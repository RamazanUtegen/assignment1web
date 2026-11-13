"""Package the final runnable site, keeping the three required submission files separate."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/final'
REPORT=OUT/'KZTravel_SE2501_Report.pdf'
LINKS=OUT/'KZTravel_SE2501_Links.txt'
ZIP=OUT/'KZTravel_SE2501_FinalProject.zip'
if not REPORT.is_file() or not LINKS.is_file(): raise SystemExit('Build the PDF report and links TXT before packaging.')
files={ROOT/'README.md',ROOT/'script.js',ROOT/'favicon.svg',ROOT/'.nojekyll'}
files.update(ROOT.glob('*.html'))
for folder in ['css','js','fonts','images','vendor']:
    files.update(p for p in (ROOT/folder).rglob('*') if p.is_file() and p.suffix.lower() in {'.html','.js','.css','.svg','.jpg','.jpeg','.png','.webp','.gif','.avif','.woff','.woff2','.ttf','.txt'})
files.update(p for p in (ROOT/'docs/final').rglob('*') if p.is_file() and p.suffix in {'.md','.json','.png'})
files.update([ROOT/'scripts/verify-final.py',ROOT/'scripts/verify-final.cjs',ROOT/'scripts/package-final.py'])
OUT.mkdir(parents=True,exist_ok=True)
with ZipFile(ZIP,'w',ZIP_DEFLATED,compresslevel=6) as archive:
    for file in sorted(files): archive.write(file,Path('KZTravel')/file.relative_to(ROOT))
    archive.write(LINKS,Path('KZTravel')/LINKS.name)
with ZipFile(ZIP) as archive:
    assert archive.testzip() is None
    assert len([name for name in archive.namelist() if name.count('/')==1 and name.endswith('.html')])==9
    assert all('/.git/' not in name and '/tmp/' not in name and not name.endswith(('.zip','.pdf')) for name in archive.namelist())
    for item in ['signup.html','login.html','profile.html','js/auth.js','js/validation.js','docs/final/presentation-script.md']:
        assert 'KZTravel/'+item in archive.namelist()
    print(f'{ZIP}: {len(archive.namelist())} files; {ZIP.stat().st_size/1024/1024:.1f} MiB; CRC passed.')
manifest={file.name:sha256(file.read_bytes()).hexdigest() for file in [ZIP,REPORT,LINKS]}
import json
(ROOT/'docs/final/submission-checksums.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
