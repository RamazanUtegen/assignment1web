"""Create source views from exact repository lines for report screenshots."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp/assignment6-code'
OUT.mkdir(parents=True, exist_ok=True)
js = (ROOT / 'script.js').read_text(encoding='utf-8').splitlines()
head = (ROOT / 'index.html').read_text(encoding='utf-8').splitlines()

def chunk(filename, lines, marker, count):
    start = next(i for i, line in enumerate(lines) if marker in line)
    return '<h2>' + escape(filename) + '</h2>' + ''.join(
        f'<div class="line"><span>{i+1}</span><code>{escape(lines[i])}</code></div>'
        for i in range(start, min(len(lines), start + count)))

views = {
    '0': ('CDN setup and DOM readiness', [('index.html', head, '<!-- Assignment 6, Task 0', 3), ('script.js', js, 'function initialise()', 6)]),
    '1': ('Live search with combined category filters', [('script.js', js, 'function renderDestinations(', 22)]),
    '2': ('Autocomplete: safe suggestions and keyboard selection', [('script.js', js, 'if (showSuggestions && query', 10), ('script.js', js, "if (event.key === 'Enter'", 15)]),
    '3': ('Highlight literal matches without injecting HTML', [('script.js', js, 'const pattern = new RegExp', 23)]),
    '4': ('Scroll progress: clamped percentage and styled width', [('script.js', js, 'function updateViewport()', 6), ('script.js', js, 'function scheduleViewport()', 5)]),
    '5': ('Animate each counter once when it enters view', [('script.js', js, '$counters.filter(function', 11)]),
    '6': ('Validated form: spinner, disabled button and completion', [('script.js', js, "$(document).on('kz:form-loading'", 21)]),
    '7': ('Shared toast with jQuery fade and timer cancellation', [('script.js', js, "const $toast = $('.toast-message')", 13)]),
    '8': ('Clipboard API, fallback and truthful confirmation', [('script.js', js, 'const text = target.innerText', 21)]),
    '9': ('Viewport lazy loading with jQuery attributes', [('script.js', js, 'function nearViewport(', 14), ('script.js', js, '$pendingImages.filter(function', 2)]),
}
for number, (title, chunks) in views.items():
    html = '''<!doctype html><html lang="en"><meta charset="utf-8"><title>Source capture</title><style>
    body{margin:0;padding:28px 34px;background:#14242d;color:#e3edf3;font-family:Arial}
    header{font-size:12px;letter-spacing:2px;color:#d5f273;margin-bottom:12px}h1{font-size:23px;margin:0 0 14px}
    h2{font-size:13px;color:#aac3ff;margin:16px 0 8px}.line{display:grid;grid-template-columns:38px 1fr;gap:13px;font:18px/24px Consolas,monospace}
    .line>span{color:#95acb7;text-align:right}code{white-space:pre-wrap;overflow-wrap:anywhere}</style>
    <header>KZ TRAVEL / ASSIGNMENT 6 / ACTUAL SOURCE</header>'''
    html += '<h1>Task ' + number + '. ' + escape(title) + '</h1>' + ''.join(chunk(*args) for args in chunks) + '</html>'
    (OUT / (number + '.html')).write_text(html, encoding='utf-8')
(OUT / 'index.json').write_text(json.dumps(list(views)), encoding='utf-8')
print('Prepared 10 exact source views with original line numbers.')
