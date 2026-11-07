"""Build a clean, runnable endterm submission; no old reports or unrelated files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT/'output/KZ-Travel-Endterm.zip'
files = {ROOT/'README.md', ROOT/'script.js', ROOT/'favicon.svg', ROOT/'.nojekyll'}
files.update(ROOT.glob('*.html'))
for folder in ['css', 'js', 'fonts', 'vendor', 'images']:
    files.update(path for path in (ROOT/folder).rglob('*') if path.is_file() and path.suffix.lower() in {'.css','.js','.svg','.jpg','.jpeg','.png','.webp','.gif','.avif','.woff','.woff2','.ttf','.txt'})
files.update([ROOT/'docs/endterm/README.md', ROOT/'scripts/verify-endterm.py', ROOT/'scripts/verify-endterm.cjs', ROOT/'scripts/package-endterm.py'])
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(OUTPUT, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for file in sorted(files):
        archive.write(file, Path('KZ-Travel')/file.relative_to(ROOT))
with ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
    assert len([name for name in archive.namelist() if name.count('/') == 1 and name.endswith('.html')]) == 6
    assert 'KZ-Travel/js/weather.js' in archive.namelist()
    assert all('/.git/' not in name and '/tmp/' not in name and not name.endswith(('.pdf','.zip')) for name in archive.namelist())
    print(f'{OUTPUT}: {len(archive.namelist())} files, {OUTPUT.stat().st_size/1024/1024:.1f} MiB; CRC check passed.')
(ROOT/'output/KZ-Travel-Endterm.sha256').write_text(sha256(OUTPUT.read_bytes()).hexdigest()+'  '+OUTPUT.name+'\n', encoding='utf-8')
