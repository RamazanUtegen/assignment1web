"""Prepare exact source excerpts for browser screenshots used by the PDF."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tmp/code'
OUT.mkdir(parents=True, exist_ok=True)
js = (ROOT / 'js/experience.js').read_text(encoding='utf-8').splitlines()
css = (ROOT / 'css/editorial.css').read_text(encoding='utf-8').splitlines()
def find(lines, text):
    return next(i for i, line in enumerate(lines) if text in line)
def excerpt(filename, lines, start, count):
    return '<h2>' + escape(filename) + '</h2>' + ''.join(f'<div class="line"><span>{i+1}</span><code>{escape(lines[i])}</code></div>' for i in range(start, min(len(lines), start+count)))
views = {
    'dom': ('DOM selection and star-rating updates', [('js/experience.js', js, find(js, "document.querySelectorAll('[data-rating]')"), 23)]),
    'theme': ('Persistent day and night themes', [('js/experience.js', js, find(js, 'function applyTheme'), 15)]),
    'events': ('Keyboard listeners and switch logic', [('js/experience.js', js, find(js, 'const menuLinks'), 16)]),
    'callback': ('Multi-step form: validation and rendering callback', [('js/experience.js', js, find(js, 'function changeStep'), 15)]),
    'data': ('Objects, methods, higher-order functions and a loop', [('js/experience.js', js, find(js, 'const destinations'), 7), ('js/experience.js', js, find(js, '...destination'), 3), ('js/experience.js', js, find(js, 'const stops = planner'), 5)]),
    'sound': ('A short, user-triggered Web Audio chime', [('js/experience.js', js, find(js, 'const oscillator'), 22)]),
    'animation': ('Event-triggered movement with reduced-motion support', [('js/experience.js', js, find(js, 'function animate'), 8), ('css/editorial.css', css, find(css, '@media(prefers-reduced-motion'), 11)]),
    'gallery': ('Existing carousel and new thumbnail state', [('js/experience.js', js, find(js, "document.querySelectorAll('[data-gallery-for]')"), 11)]),
}
for key, (title, chunks) in views.items():
    html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>' + escape(title) + '</title><style>body{margin:0;background:#14242d;color:#e3edf3;padding:30px 44px;font-family:Arial}header{font-size:12px;letter-spacing:2px;color:#b9d06c;margin-bottom:14px}h1{font-size:23px;margin:0 0 18px}h2{font-size:12px;color:#aac3ff;margin:15px 0 8px}.line{display:grid;grid-template-columns:42px 1fr;gap:10px;font:19px/25px Consolas,monospace}.line>span{color:#759099;text-align:right}code{white-space:pre-wrap;overflow-wrap:anywhere}</style><header>KZ TRAVEL / ASSIGNMENT 5 / SOURCE CAPTURE</header><h1>' + escape(title) + '</h1>' + ''.join(excerpt(*chunk) for chunk in chunks) + '</html>'
    (OUT / (key + '.html')).write_text(html, encoding='utf-8')
(OUT / 'index.json').write_text(json.dumps(list(views)),encoding='utf-8')
print('Prepared', len(views), 'source views.')
