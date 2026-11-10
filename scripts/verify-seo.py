"""Check source metadata and sitemap: python scripts/verify-seo.py.

Uses the same beautifulsoup4 dependency as verify-assignment5.py. This verifies
local source consistency, not publication, search indexing or social previews.
"""
from collections import Counter
from pathlib import Path
from urllib.parse import unquote
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://ramazanutegen.github.io/assignment1web/'
PAGES = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']
errors = []
titles, descriptions, canonicals = [], [], []

for name in PAGES:
    soup = BeautifulSoup((ROOT / name).read_text(encoding='utf-8'), 'html.parser')
    head = soup.head

    def one(selector, attribute=None):
        nodes = head.select(selector)
        value = (nodes[0].get(attribute, '') if attribute else nodes[0].get_text()).strip() if nodes else ''
        if len(nodes) != 1 or not value:
            errors.append(f'{name}: expected one nonempty {selector}')
        return value

    title = one('title')
    description = one('meta[name="description"]', 'content')
    canonical = one('link[rel="canonical"]', 'href')
    expected = BASE + ('' if name == 'index.html' else name)
    if canonical != expected:
        errors.append(f'{name}: canonical must be {expected}')
    titles.append(title)
    descriptions.append(description)
    canonicals.append(canonical)

    for field, value in {'title': title, 'description': description, 'url': canonical,
                         'type': 'website', 'site_name': 'KZ Travel'}.items():
        if one(f'meta[property="og:{field}"]', 'content') != value:
            errors.append(f'{name}: og:{field} must match page metadata')
    image = one('meta[property="og:image"]', 'content')
    if not image.startswith(BASE):
        errors.append(f'{name}: social image must use the absolute publication URL')
    else:
        relative = unquote(image.removeprefix(BASE))
        path = (ROOT / relative).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            errors.append(f'{name}: social image does not exist locally: {relative}')
        visible_images = {node.get('src') for node in soup.select('img[src]')}
        for node in soup.select('img[srcset], source[srcset]'):
            visible_images.update(candidate.strip().split()[0] for candidate in node['srcset'].split(',') if candidate.strip())
        if relative not in visible_images:
            errors.append(f'{name}: social image must appear on the page')
    one('meta[property="og:image:alt"]', 'content')
    if one('meta[name="twitter:card"]', 'content') != 'summary_large_image':
        errors.append(f'{name}: expected a large-image social card')
    for meta in head.select('meta[name="robots"], meta[name="googlebot"]'):
        directives = meta.get('content', '').lower().replace(',', ' ').split()
        if {'noindex', 'none'} & set(directives):
            errors.append(f'{name}: canonical page must remain indexable')

for label, values in [('title', titles), ('description', descriptions), ('canonical', canonicals)]:
    if any(count > 1 for count in Counter(values).values()):
        errors.append(f'Pages must have unique {label} values')

namespace = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
try:
    sitemap = ET.parse(ROOT / 'sitemap.xml').getroot()
    urls = [(node.text or '').strip() for node in sitemap.findall(f'{namespace}url/{namespace}loc')]
    if sitemap.tag != f'{namespace}urlset' or sorted(urls) != sorted(canonicals):
        errors.append('Sitemap must contain each canonical page exactly once')
except (ET.ParseError, OSError) as error:
    errors.append(f'Invalid sitemap XML: {error}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} unique page metadata sets; canonical/social consistency; existing social images; matching sitemap.')
