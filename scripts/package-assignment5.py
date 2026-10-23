"""Package the local project and current report; never commits or pushes."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/KZ-Travel-Assignment-5.zip'
REPORT = ROOT / 'output/pdf/KZ-Travel-Assignment-5-Report.pdf'
if not REPORT.is_file(): raise SystemExit('Build the Assignment 5 report first.')
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(OUTPUT,'w',ZIP_DEFLATED,compresslevel=6) as archive:
    for file in sorted(ROOT.rglob('*')):
        relative=file.relative_to(ROOT)
        if not file.is_file() or any(part in {'.git','output','tmp','__pycache__','node_modules'} for part in relative.parts): continue
        archive.write(file,Path('KZ-Travel')/relative)
    archive.write(REPORT,'KZ-Travel/output/pdf/'+REPORT.name)
with ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
    assert all(not name.startswith('KZ-Travel/.git/') for name in archive.namelist())
    print(f'{OUTPUT}: {len(archive.namelist())} files, {OUTPUT.stat().st_size / 1024 / 1024:.1f} MiB; CRC check passed.')
