"""Package the complete project and final PDF, excluding previous deliverables."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT/'output/KZ-Travel-Assignment-6.zip'
REPORT = ROOT/'output/pdf/KZ-Travel-Assignment-6-Report.pdf'
if not REPORT.is_file(): raise SystemExit('Build the final report first.')
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(OUTPUT,'w',ZIP_DEFLATED,compresslevel=6) as archive:
    for file in sorted(ROOT.rglob('*')):
        relative = file.relative_to(ROOT)
        if not file.is_file() or any(part in {'.git','output','tmp','__pycache__','node_modules'} for part in relative.parts): continue
        archive.write(file,Path('KZ-Travel')/relative)
    archive.write(REPORT,'KZ-Travel/output/pdf/'+REPORT.name)
with ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
    for item in ['index.html','script.js','css/assignment6.css','vendor/jquery-4.0.0.min.js','docs/assignment-6/deployment.json','output/pdf/'+REPORT.name]:
        assert 'KZ-Travel/'+item in archive.namelist(), item
    assert all('/.git/' not in name and not name.endswith('Assignment-5.zip') for name in archive.namelist())
    print(f'{OUTPUT}: {len(archive.namelist())} files; {OUTPUT.stat().st_size/1024/1024:.1f} MiB; CRC check passed.')
(ROOT/'output/KZ-Travel-Assignment-6.sha256').write_text(sha256(OUTPUT.read_bytes()).hexdigest()+'  '+OUTPUT.name+'\n',encoding='utf-8')
