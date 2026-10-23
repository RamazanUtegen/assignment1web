"""Static checks: python scripts/verify-assignment5.py (requires beautifulsoup4)."""
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit
import subprocess
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
# The last Assignment 4 commit is the fixed photo-preservation baseline.
BASE_REF = 'f1bfba5'
PAGES = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']
errors = []
soups = {name: BeautifulSoup((ROOT / name).read_text(encoding='utf-8'), 'html.parser') for name in PAGES}
for name, soup in soups.items():
    ids = [element['id'] for element in soup.select('[id]')]
    duplicates = [key for key, value in Counter(ids).items() if value > 1]
    if duplicates: errors.append(f'{name}: duplicate IDs {duplicates}')
    if len(soup.select('h1')) != 1: errors.append(f'{name}: expected one h1')
    for element in soup.find_all(True):
        if any(key.startswith('on') for key in element.attrs) or element.has_attr('style'):
            errors.append(f'{name}: inline behaviour or style on {element.name}')
    for image in soup.select('img'):
        if not image.has_attr('alt'): errors.append(f'{name}: image without alt')
    for element in soup.select('[href], [src]'):
        raw = element.get('href', element.get('src', ''))
        url = urlsplit(raw)
        if url.scheme or url.netloc: continue
        path = unquote(url.path)
        target = ROOT / path if path else ROOT / name
        if not target.exists(): errors.append(f'{name}: missing {raw}')
        if url.fragment and target.suffix == '.html' and target.name in soups:
            if not soups[target.name].find(id=url.fragment): errors.append(f'{name}: missing anchor {raw}')
    for selector in ['[data-theme-toggle]', '[data-sound-toggle]', '[data-live-clock]', '[data-background-button]', '[data-rating]']:
        if not soup.select_one(selector): errors.append(f'{name}: missing {selector}')
    for text in ['Ramazan Utegen', 'Ziyadinkhan Kudaibergenuly', 'Ruzimuhammad', 'SE-2501']:
        if text not in soup.footer.get_text(' ', strip=True): errors.append(f'{name}: missing team credit {text}')
    old = subprocess.run(['git', 'show', f'{BASE_REF}:{name}'], cwd=ROOT, capture_output=True, check=True).stdout.decode('utf-8')
    old_sources = {img.get('src') for img in BeautifulSoup(old, 'html.parser').select('img')}
    new_sources = {img.get('src') for img in soup.select('img')}
    if old_sources - new_sources: errors.append(f'{name}: removed original images {old_sources - new_sources}')
changed_images = subprocess.run(['git', 'diff', '--name-only', BASE_REF, '--', 'images'], cwd=ROOT, capture_output=True, check=True).stdout.decode().strip()
if changed_images: errors.append('Original image files changed: ' + changed_images)
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} pages; resources and anchors; IDs; semantics; team credits; no inline scripts/styles; all original photos preserved.')
