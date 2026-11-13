"""Final rubric checks. Run from the repository or extracted submission ZIP."""
from pathlib import Path
from collections import Counter, deque
from urllib.parse import urlsplit, unquote
from hashlib import sha256
from base64 import b64encode
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
pages = {p.name: BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser') for p in ROOT.glob('*.html')}
errors, assets, graph = [], set(), {}
if len(pages) < 6: errors.append('At least six pages are needed.')
sri = 'sha256-' + b64encode(sha256((ROOT/'vendor/jquery-4.0.0.min.js').read_bytes()).digest()).decode()
for name, soup in pages.items():
    graph[name] = set()
    if len(soup.select('h1')) != 1: errors.append(name+': expected one h1')
    duplicates = [key for key,count in Counter(node['id'] for node in soup.select('[id]')).items() if count>1]
    if duplicates: errors.append(f'{name}: duplicate IDs {duplicates}')
    jquery = soup.find('script', src='https://code.jquery.com/jquery-4.0.0.min.js')
    if not jquery or jquery.get('integrity') != sri: errors.append(name+': invalid jQuery SRI')
    if soup.select('[required], [pattern], [minlength], [maxlength], [min], [max], input[type=email]'):
        errors.append(name+': prohibited native validation constraint')
    for form in soup.select('form'):
        if not form.has_attr('novalidate'): errors.append(name+': form without novalidate')
        if not form.has_attr('data-trip-planner') and not form.select('[data-rules]'): errors.append(name+': form missing explicit rules')
    for node in soup.select('[src], [href], [data-src]'):
        for attr in ['src','href','data-src']:
            if attr not in node.attrs: continue
            url = urlsplit(node[attr])
            if url.scheme or url.netloc: continue
            target = ROOT/unquote(url.path) if url.path else ROOT/name
            if not target.is_file(): errors.append(f'{name}: missing {node[attr]}')
            else: assets.add(str(target.relative_to(ROOT)))
            if attr=='href' and target.name in pages: graph[name].add(target.name)
            if url.fragment and target.name in pages and not pages[target.name].find(id=url.fragment): errors.append(f'{name}: missing fragment {node[attr]}')
    for image in soup.select('img'):
        if not image.has_attr('alt'): errors.append(name+': image without alt')
    for selector in ['[data-account-link]','[data-theme-toggle]']:
        if not soup.select_one(selector): errors.append(name+': missing '+selector)
    for member in ['Ramazan Utegen','Ziyadinkhan Kudaibergenuly','Ruzimuhammad','SE-2501']:
        if member not in soup.footer.get_text(' ',strip=True): errors.append(name+': missing credit '+member)
    if any(any(key.startswith('on') for key in node.attrs) for node in soup.find_all(True)): errors.append(name+': inline event handler')
# The authenticated route is reached by the real login redirect, not a public menu link.
if "location.assign('profile.html')" in (ROOT/'js/auth.js').read_text(encoding='utf-8'):
    graph['login.html'].add('profile.html')
seen, queue = set(), deque(['index.html'])
while queue:
    page=queue.popleft()
    if page in seen: continue
    seen.add(page); queue.extend(graph.get(page,set())-seen)
if seen != set(pages): errors.append('Disconnected pages: '+', '.join(set(pages)-seen))
for css in (ROOT/'css').glob('*.css'):
    for value in re.findall(r'url\([\'"]?([^\)\'\"]+)',css.read_text(encoding='utf-8')):
        url=urlsplit(value)
        if not url.scheme and not (css.parent/unquote(url.path)).is_file(): errors.append(css.name+': missing '+value)
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} connected pages; {len(assets)} resources; explicit JS validation; novalidate; no native validation constraints; labels/IDs/anchors; theme/account controls; team credits; jQuery SRI.')
