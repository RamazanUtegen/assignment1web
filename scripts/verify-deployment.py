"""Verify the published HTML and every referenced local asset against this checkout.

python scripts/verify-deployment.py --commit <published-sha>
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, urljoin, unquote
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://ramazanutegen.github.io/assignment1web/'
parser = argparse.ArgumentParser()
parser.add_argument('--commit', required=True)
parser.add_argument('--output', default='tmp/pages-http-check.json')
args = parser.parse_args()
paths = {'index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html'}
for page in list(paths):
    soup = BeautifulSoup((ROOT / page).read_text(encoding='utf-8'), 'html.parser')
    for node in soup.select('img[src], script[src], link[rel="stylesheet"][href]'):
        url = urlsplit(node.get('src', node.get('href', '')))
        if not url.scheme and not url.netloc: paths.add(unquote(url.path))
for font in re.findall(r'url\([\'"]?([^\)\'\"]+)', (ROOT / 'css/editorial.css').read_text(encoding='utf-8')):
    path = unquote(urlsplit(urljoin(BASE + 'css/editorial.css', font)).path)
    paths.add(path.removeprefix('/assignment1web/'))

def check(path):
    url = BASE + path + '?verify=' + args.commit[:12]
    try:
        with urlopen(Request(url, headers={'User-Agent': 'KZ-Travel-deployment-check'}), timeout=30) as response:
            status = response.status
            actual = response.read()
        expected = (ROOT / path).read_bytes()
        if Path(path).suffix in {'.html', '.css', '.js'}:
            actual = actual.replace(b'\r\n', b'\n')
            expected = expected.replace(b'\r\n', b'\n')
        matches = actual == expected
        return {'path': path, 'status': status, 'matchesCheckout': matches, 'sha256': sha256(actual).hexdigest()}
    except Exception as error:
        return {'path': path, 'status': None, 'matchesCheckout': False, 'error': str(error)}

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(check, sorted(paths)))
record = {'url': BASE, 'sourceCommit': args.commit, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'fileCount': len(results), 'files': results}
output = ROOT / args.output
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(record, indent=2), encoding='utf-8')
failed = [item for item in results if not item['matchesCheckout'] or item['status'] != 200]
if failed: raise SystemExit(json.dumps(failed, indent=2))
print(f'PASS: {len(results)} published HTML/assets returned HTTP 200 and matched this checkout.')
