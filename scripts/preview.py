"""Run an isolated loopback-only theme preview; never use a real library or database."""
import argparse
import json
from pathlib import Path
import socket
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=14533)
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        raise SystemExit('Use an unprivileged TCP port')
    with socket.socket() as check:
        check.bind(('127.0.0.1', args.port))
    sandbox = ROOT / '.local' / 'preview'
    for child in ['data', 'music', 'cache', 'logs']:
        (sandbox / child).mkdir(parents=True, exist_ok=True)
    stop = ROOT / '.local' / 'preview.stop'
    if stop.exists():
        stop.unlink()
    config = sandbox / 'navidrome.toml'
    text = "Address = '127.0.0.1'\nPort = " + str(args.port) + "\nDefaultTheme = 'Catppuccin Mocha Eira'\nDefaultLanguage = ''\nEnableInsightsCollector = false\nEnableExternalServices = false\n"
    for key, folder in [('DataFolder', 'data'), ('MusicFolder', 'music'), ('CacheFolder', 'cache')]:
        text += key + " = '" + (sandbox / folder).as_posix() + "'\n"
    text += "LogFile = '" + (sandbox / 'logs' / 'navidrome.log').as_posix() + "'\n"
    config.write_text(text, encoding='utf-8')
    http = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    url = 'http://127.0.0.1:' + str(args.port)
    with (sandbox / 'logs' / 'stdout.log').open('wb') as out, (sandbox / 'logs' / 'stderr.log').open('wb') as err:
        process = subprocess.Popen([str(ROOT / 'dist' / 'navidrome.exe'), '-c', str(config)], cwd=sandbox, stdout=out, stderr=err)
        try:
            ready = False
            for _ in range(120):
                if process.poll() is not None:
                    raise RuntimeError('Preview process exited before becoming ready')
                try:
                    with http.open(url + '/ping', timeout=2) as response:
                        if response.status == 200:
                            ready = True
                            break
                except Exception:
                    time.sleep(0.5)
            if not ready:
                raise RuntimeError('Preview health check timed out')
            html = http.open(url + '/', timeout=5).read().decode()
            if 'Catppuccin Mocha Eira' not in html:
                raise RuntimeError('Preview did not advertise the configured custom theme')
            state = {'url': url, 'pid': process.pid, 'theme': 'Catppuccin Mocha Eira', 'privateSandbox': str(sandbox), 'ready': True}
            (ROOT / '.local' / 'preview-state.json').write_text(json.dumps(state, indent=2), encoding='utf-8')
            print(json.dumps(state, indent=2), flush=True)
            while process.poll() is None and not stop.exists():
                time.sleep(0.5)
        finally:
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=15)
            print('Isolated preview stopped', flush=True)

if __name__ == '__main__':
    main()
