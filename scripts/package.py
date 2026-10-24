"""Package the tested binary and its complete patched upstream source separately."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '.build' / 'navidrome'
DIST = ROOT / 'dist'


def main():
    info = json.loads((DIST / 'build-info.json').read_text())
    binary = DIST / 'navidrome.exe'
    if hashlib.sha256(binary.read_bytes()).hexdigest() != info['sha256']:
        raise RuntimeError('Refusing to package a binary that differs from its build manifest')
    result = subprocess.check_output(['git', '-C', str(ROOT), 'ls-files', '-z'])
    own_files = [Path(p.decode()) for p in result.split(b'\0') if p]
    if not own_files:
        raise RuntimeError('Stage the public source files before packaging')
    for path in own_files:
        if any(x in path.parts for x in ['.local', '.build', '.cache', 'dist', 'node_modules']):
            raise RuntimeError('Private/build artifact was incorrectly staged: ' + str(path))
    bundle = DIST / 'navidrome-mocha-1.0.0-windows-amd64.zip'
    with zipfile.ZipFile(bundle, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative in own_files:
            archive.write(ROOT / relative, relative.as_posix())
        archive.write(binary, 'dist/navidrome.exe')
        archive.write(DIST / 'build-info.json', 'dist/build-info.json')
    upstream = subprocess.check_output(['git', '-C', str(SOURCE), 'ls-files', '-z'])
    source_files = {Path(p.decode()) for p in upstream.split(b'\0') if p}
    for name in json.loads((ROOT / 'theme.json').read_text())['files']:
        source_files.add(Path('ui/src/themes') / name)
    source_zip = DIST / 'navidrome-0.64.2-mocha.1-corresponding-source.zip'
    with zipfile.ZipFile(source_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative in sorted(source_files):
            actual = SOURCE / relative
            if not actual.resolve().is_relative_to(SOURCE.resolve()):
                raise RuntimeError('Source archive path escapes the pinned checkout')
            if actual.is_file():
                archive.write(actual, 'navidrome/' + relative.as_posix())
        for relative in own_files:
            archive.write(ROOT / relative, 'theme/' + relative.as_posix())
    sums = []
    for artifact in [bundle, source_zip]:
        sums.append(hashlib.sha256(artifact.read_bytes()).hexdigest() + '  ' + artifact.name)
    (DIST / 'SHA256SUMS').write_text('\n'.join(sums) + '\n', encoding='ascii')
    print(json.dumps({'artifacts': [{'name': p.name, 'bytes': p.stat().st_size} for p in [bundle, source_zip]], 'sha256sums': sums}, indent=2))

if __name__ == '__main__':
    main()
