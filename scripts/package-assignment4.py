"""Create the project ZIP without Git data, caches, or recursive archives."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'output/pdf/KZ-Travel-Assignment-4-Report.pdf'
OUTPUT = ROOT / 'output/KZ-Travel-Assignment-4.zip'
assert REPORT.is_file(), 'Generate the PDF report before packaging.'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
files = list(ROOT.glob('*.html')) + [ROOT / 'README.md']
for folder in ['css', 'js', 'images', 'docs', 'scripts']:
    files.extend(file for file in (ROOT / folder).rglob('*') if file.is_file() and '__pycache__' not in file.parts)
with ZipFile(OUTPUT, 'w', compression=ZIP_DEFLATED) as archive:
    for file in sorted(files):
        archive.write(file, 'KZ-Travel-Assignment-4/' + file.relative_to(ROOT).as_posix())
    archive.write(REPORT, 'KZ-Travel-Assignment-4/output/pdf/' + REPORT.name)
with ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
    assert sum(name.endswith('.html') for name in archive.namelist()) == 6
print(OUTPUT)
