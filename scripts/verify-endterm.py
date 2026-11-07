"""Standalone checks, also usable from the extracted endterm ZIP (no Git needed)."""
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit, unquote
from base64 import b64encode
from hashlib import sha256
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']
soups = {name: BeautifulSoup((ROOT/name).read_text(encoding='utf-8'), 'html.parser') for name in PAGES}
errors = []
asset_count = set()
expected_sri = 'sha256-' + b64encode(sha256((ROOT/'vendor/jquery-4.0.0.min.js').read_bytes()).digest()).decode()
for name, soup in soups.items():
    duplicates = [key for key, value in Counter(node['id'] for node in soup.select('[id]')).items() if value > 1]
    if duplicates: errors.append(f'{name}: duplicate IDs {duplicates}')
    if len(soup.select('h1')) != 1: errors.append(f'{name}: expected one h1')
    jquery = soup.head.find('script', src='https://code.jquery.com/jquery-4.0.0.min.js')
    if not jquery or jquery.get('integrity') != expected_sri: errors.append(f'{name}: jQuery integrity mismatch')
    for image in soup.select('img'):
        if not image.has_attr('alt'): errors.append(f'{name}: missing image alt')
    for node in soup.select('[src], [href], [data-src]'):
        for attribute in ['src', 'href', 'data-src']:
            if not node.has_attr(attribute): continue
            url = urlsplit(node[attribute])
            if url.scheme or url.netloc: continue
            target = ROOT/unquote(url.path) if url.path else ROOT/name
            if not target.is_file(): errors.append(f'{name}: missing {node[attribute]}')
            else: asset_count.add(str(target.relative_to(ROOT)))
            if url.fragment and target.name in soups and not soups[target.name].find(id=url.fragment):
                errors.append(f'{name}: missing fragment {node[attribute]}')
    if name != 'about.html':
        expected = 'almaty' if name == 'index.html' else Path(name).stem
        weather = soup.select_one('[data-weather]')
        selected = soup.select_one('[data-weather-city] option[selected]')
        if not weather or weather.get('data-default-city') != expected or not selected or selected.get('value') != expected:
            errors.append(f'{name}: incorrect weather default')
    for selector in ['[data-demo-form] .form-status', '[data-theme-toggle]', '[data-sound-toggle]', '[data-live-clock]', '[data-rating]', '[data-copy]']:
        if name == 'astana.html' and 'data-demo-form' in selector: continue
        if not soup.select_one(selector): errors.append(f'{name}: missing {selector}')
    for member in ['Ramazan Utegen', 'Ziyadinkhan Kudaibergenuly', 'Ruzimuhammad', 'SE-2501']:
        if member not in soup.footer.get_text(' ', strip=True): errors.append(f'{name}: missing {member}')
    for node in soup.find_all(True):
        if any(key.startswith('on') for key in node.attrs): errors.append(f'{name}: inline event handler')
for css in (ROOT/'css').glob('*.css'):
    for raw in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text(encoding='utf-8')):
        url = urlsplit(raw)
        if not url.scheme and not url.netloc and not (css.parent/unquote(url.path)).is_file(): errors.append(f'{css.name}: missing {raw}')
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} pages, {len(asset_count)} referenced local files, anchors, IDs, jQuery SRI, weather defaults, CSS URLs, team credits and retained controls.')
