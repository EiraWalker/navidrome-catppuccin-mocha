"""Build the theme into the exact supported Navidrome source, without touching a deployment."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'theme.json').read_text(encoding='utf-8'))
SOURCE = ROOT / '.build' / 'navidrome'
CACHE = ROOT / '.cache'
DIST = ROOT / 'dist'

def run(command, cwd=ROOT, env=None, capture=False):
    print('+', subprocess.list2cmdline([str(x) for x in command]), flush=True)
    return subprocess.run([str(x) for x in command], cwd=cwd, env=env, check=True, text=True, encoding='utf-8', errors='replace', capture_output=capture)

def environment():
    env = os.environ.copy()
    env.update({'GOCACHE': str(CACHE / 'go-build'), 'GOMODCACHE': str(CACHE / 'go-mod'), 'GOPATH': str(CACHE / 'go-path'), 'GOTOOLCHAIN': 'auto', 'CGO_ENABLED': '1', 'npm_config_cache': str(CACHE / 'npm'), 'ND_ENABLEINSIGHTSCOLLECTOR': 'false'})
    if os.name == 'nt':
        bash = shutil.which('bash')
        gcc = shutil.which('gcc')
        if not bash or not gcc:
            raise RuntimeError('Windows builds need Git Bash and MinGW-w64 GCC on PATH')
        env['npm_config_script_shell'] = bash
        env['CC'] = gcc
    return env

def prepare():
    if not (SOURCE / '.git').exists():
        SOURCE.parent.mkdir(parents=True, exist_ok=True)
        run(['git', 'clone', '--depth', '1', '--branch', MANIFEST['navidromeTag'], '--single-branch', 'https://github.com/navidrome/navidrome.git', str(SOURCE)])
    sha = run(['git', 'rev-parse', 'HEAD'], cwd=SOURCE, capture=True).stdout.strip()
    if sha != MANIFEST['navidromeCommit']:
        raise RuntimeError('Unexpected upstream commit; refusing to reset or build it')
    changed = run(['git', 'diff', '--name-only'], cwd=SOURCE, capture=True).stdout.splitlines()
    if set(changed) - {'ui/src/themes/index.js'}:
        raise RuntimeError('Unexpected tracked upstream edits; preserving them instead of building')
    patch = ROOT / 'patches' / 'register-theme.patch'
    already = subprocess.run(['git', 'apply', '--reverse', '--check', str(patch)], cwd=SOURCE, capture_output=True).returncode == 0
    if not already:
        run(['git', 'apply', '--check', patch], cwd=SOURCE)
        run(['git', 'apply', patch], cwd=SOURCE)
    for name in MANIFEST['files']:
        shutil.copyfile(ROOT / 'src' / name, SOURCE / 'ui' / 'src' / 'themes' / name)
    return SOURCE

def npm_command():
    node = shutil.which('node')
    if not node:
        raise RuntimeError('Node.js with npm is required')
    candidate = Path(node).parent / 'node_modules' / 'npm' / 'bin' / 'npm-cli.js'
    if candidate.exists():
        return [node, str(candidate)]
    npm = shutil.which('npm')
    if not npm:
        raise RuntimeError('npm was not found')
    return ['cmd.exe', '/d', '/c', npm] if os.name == 'nt' else [npm]

def build_ui(env):
    ui = SOURCE / 'ui'
    npm = npm_command()
    receipt = CACHE / 'ui-install-lock.sha256'
    lock = hashlib.sha256((ui / 'package-lock.json').read_bytes()).hexdigest()
    if not (ui / 'node_modules').is_dir() or not receipt.exists() or receipt.read_text().strip() != lock:
        run(npm + ['ci', '--no-audit', '--no-fund'], cwd=ui, env=env)
        receipt.write_text(lock, encoding='ascii')
    run([shutil.which('node'), ROOT / 'scripts' / 'check-material-ui.mjs'], env=env)
    run(npm + ['run', 'test', '--', 'src/themes/theme.test.js', 'src/reducers/themeReducer.test.js'], cwd=ui, env=env)
    run(npm + ['run', 'build'], cwd=ui, env=env)

def build_server(env):
    if not (SOURCE / 'ui' / 'build' / 'index.html').is_file():
        raise RuntimeError('Build the frontend before the server')
    name = 'navidrome.exe' if os.name == 'nt' else 'navidrome'
    target = DIST / name
    flags = '-s -w -X github.com/navidrome/navidrome/consts.gitTag=v0.64.2+mocha.1 -X github.com/navidrome/navidrome/consts.gitSha=10114574-mocha1'
    run(['go', 'build', '-trimpath', '-tags=netgo,sqlite_fts5', '-ldflags', flags, '-o', target, '.'], cwd=SOURCE, env=env)
    version = run([target, '--version'], capture=True).stdout.strip()
    info = {'theme': MANIFEST['name'], 'themeVersion': MANIFEST['version'], 'upstreamCommit': MANIFEST['navidromeCommit'], 'version': version, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'sourceFiles': {name: hashlib.sha256((ROOT / 'src' / name).read_bytes()).hexdigest() for name in MANIFEST['files']}}
    (DIST / 'build-info.json').write_text(json.dumps(info, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(info, indent=2), flush=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    phase = parser.add_mutually_exclusive_group()
    phase.add_argument('--ui-only', action='store_true')
    phase.add_argument('--server-only', action='store_true')
    phase.add_argument('--prepare-only', action='store_true')
    args = parser.parse_args()
    CACHE.mkdir(exist_ok=True)
    DIST.mkdir(exist_ok=True)
    env = environment()
    prepare()
    if args.prepare_only:
        return
    if not args.server_only:
        build_ui(env)
    if not args.ui_only:
        build_server(env)

if __name__ == '__main__':
    main()
