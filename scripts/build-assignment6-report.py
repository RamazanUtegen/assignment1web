"""Build the final PDF only after publication and browser checks succeed."""
from pathlib import Path
from html import escape
import json
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'docs/assignment-6'
publication = json.loads((EVIDENCE/'deployment.json').read_text(encoding='utf-8'))
local = json.loads((EVIDENCE/'browser-verification.json').read_text(encoding='utf-8'))
live = json.loads((EVIDENCE/'live-browser-verification.json').read_text(encoding='utf-8'))
assert publication['workflowConclusion'] == 'success'
assert all(row['matchesCheckout'] for row in publication['http']['files'])
assert all(row['status'] == 'passed' for row in local['results'] + live['results'])
SHOTS = EVIDENCE/'screenshots'
OUTPUT = ROOT/'output/pdf/KZ-Travel-Assignment-6-Report.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
URL = 'https://ramazanutegen.github.io/assignment1web/'
INK, BLUE, GREY = (colors.HexColor(value) for value in ['#172124', '#174add', '#596366'])
font_pairs = [(Path('C:/Windows/Fonts/arial.ttf'), Path('C:/Windows/Fonts/arialbd.ttf')),
              (Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'), Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))]
fonts = next((pair for pair in font_pairs if all(p.is_file() for p in pair)), None)
if fonts:
    for name, font in zip(['Report', 'ReportBold'], fonts): pdfmetrics.registerFont(TTFont(name, str(font)))
else:
    pdfmetrics.registerFont(pdfmetrics.Font('Report', 'Helvetica', 'WinAnsiEncoding'))
    pdfmetrics.registerFont(pdfmetrics.Font('ReportBold', 'Helvetica-Bold', 'WinAnsiEncoding'))
styles = getSampleStyleSheet()
for name, size, leading, colour, font in [
    ('Body6', 9.4, 13.4, INK, 'Report'), ('Small6', 8, 11, GREY, 'Report'),
    ('Caption6', 7.3, 10, GREY, 'Report'), ('Kicker6', 8, 12, BLUE, 'ReportBold'),
    ('Heading6', 23, 27, INK, 'ReportBold'), ('Title6', 38, 41, INK, 'ReportBold')]:
    styles.add(ParagraphStyle(name=name, fontName=font, fontSize=size, leading=leading, textColor=colour, spaceAfter=8))
W = A4[0] - 80
story = []
def p(text, style='Body6'): return Paragraph(text, styles[style])
def add(text, style='Body6'): story.append(p(text, style))
def shot(name, caption, max_height=220):
    with PILImage.open(SHOTS/(name+'.png')) as source:
        scale = min(W/source.width, max_height/source.height)
        picture = Image(str(SHOTS/(name+'.png')), width=source.width*scale, height=source.height*scale)
    picture.hAlign = 'CENTER'
    story.extend([picture, Spacer(1,4), p(caption,'Caption6')])
def page(kicker, heading):
    story.append(PageBreak()); add(kicker,'Kicker6'); add(heading,'Heading6')
def steps(items):
    for i, item in enumerate(items, 1): add(f'<b>{i}.</b> {item}')
def task(number, title, items, result, caption, code_height=290, result_height=225):
    page(f'KZ TRAVEL / ASSIGNMENT 6 / TASK {number}', title)
    steps(items)
    shot(result, 'Webpage result. '+caption, result_height)
    shot('code-'+str(number), 'Code screenshot from the actual project, with original file names and line numbers.', code_height)

add('KZ TRAVEL / SE-2501 / 31 OCTOBER 2026','Kicker6')
add('Find your<br/>next somewhere.','Title6')
add('Assignment 6: jQuery','Heading6')
shot('live-home', 'Published KZ Travel homepage, captured after the Assignment 6 deployment.', 235)
team = [['Team', 'KZ Travel'], ['Members', 'Ramazan Utegen<br/>Ziyadinkhan Kudaibergenuly<br/>Ruzimuhammad'], ['Group', 'SE-2501']]
table = Table([[p('<b>'+a+'</b>'),p(b)] for a,b in team], colWidths=[85,W-85])
table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f5f5f0')),('LEFTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
story.extend([table,Spacer(1,12)])
add('<b>Objective.</b> Continue the team\'s Kazakhstan travel project and use jQuery to simplify DOM manipulation, event handling and animations. Implement Tasks 0-9 and publish the updated six-page website.')
add(f'<b>Deployed website:</b> <link href="{URL}" color="#174add">{URL}</link>','Small6')
add('<b>Repository:</b> <link href="https://github.com/RamazanUtegen/assignment1web" color="#174add">github.com/RamazanUtegen/assignment1web</link>','Small6')

page('KZ TRAVEL / SCOPE AND REQUIREMENTS', 'A more useful travel guide.')
add('The same team and original project topic are retained. Six existing pages, original photographs, city guides, tables, navigation, forms, clock, saved places, themes, ratings, route planner and galleries remain available. The jQuery features fit the existing travel experience.')
mapping = [
 ('0', 'CDN + document.ready', 'All pages; browser console'),
 ('1', 'Real-time search and live filter', 'Home destination cards'),
 ('2', 'Autocomplete suggestions', 'Destination search combobox'),
 ('3', 'Search highlighting', 'Destination text and FAQ answers'),
 ('4', 'Stylized scroll progress bar', 'Top edge of all pages'),
 ('5', 'Animated number counters', 'Home guide statistics'),
 ('6', 'Loading spinner on submit', 'Signup, city and contact forms'),
 ('7', 'Temporary fading notifications', 'Save, form and copy actions'),
 ('8', 'Copy to clipboard + tooltip', 'Guide links and generated route'),
 ('9', 'Lazy image loading', 'Below-fold photos and galleries'),
 ('Part 4', 'Commit, push and deployment', 'Existing GitHub Pages website')]
rows = [[p('<b>Task</b>'), p('<b>Requirement</b>'),p('<b>Location</b>')]] + [[p(escape(a)),p(escape(b)),p(escape(c))] for a,b,c in mapping]
table = Table(rows,colWidths=[45,230,W-275],repeatRows=1)
table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8eefc')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f5f5f0')]),('LEFTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
story.extend([table,Spacer(1,14)])
add('<b>Run locally.</b> Open index.html or run python -m http.server 8765 --bind 127.0.0.1 in the project folder. No build or backend is needed. jQuery uses the specified CDN and an identical local fallback. Forms simulate processing and send no personal information.')
add('<b>Main files.</b> script.js implements the jQuery features; css/assignment6.css supplies their styles. The earlier validator and saved-place controls communicate with the new module through custom events.')

task(0, 'Set up jQuery.', [
 'Include the specified jQuery 4.0.0 CDN script inside each HTML head, followed by external script.js. defer preserves execution order; an integrity hash verifies the CDN bytes.',
 'In script.js, call $(document).ready() and log jQuery is ready! before attaching the handlers.',
 'If the CDN cannot load, initialise with the bundled identical jQuery version. Browser checks verify both CDN and blocked-CDN paths.'
], 'live-home', 'The homepage runs with jQuery 4.0.0. The browser console log is verified in the saved test evidence.', 240, 230)
task(1, 'Search as you type.', [
 'Bind the destination search input with jQuery .on(input). Normalize the query and read searchable city names and tags from the cards.',
 'Use .filter() to combine the text with the selected category or saved-state filter, then update hidden properties, the results count and the empty state.',
 'Test Almaty, combine a mismatching category, and clear the filters. The cards update immediately without reloading.'
], 'task-1-search', 'Only Almaty remains; its matching name is highlighted.', 290, 225)
task(2, 'Offer the next useful word.', [
 'Build a listbox of city names from the same matching set, using .text() to create safe labels. Show it only for a non-empty query.',
 'Use Arrow Down/Up and aria-activedescendant to select an option. Enter or a click applies the suggestion and filters the cards.',
 'Close the dropdown on Escape or blur. Test keyboard selection, empty results and clearing the input.'
], 'task-2-autocomplete', 'Typing a shows matching suggestions with the first keyboard option selected.', 300, 205)
task(3, 'Make every match visible.', [
 'Add a FAQ search that checks questions and full answers, including collapsed text. Reveal matching answers and report the matching-question count.',
 'Escape regex metacharacters and traverse text nodes. Replace every case-insensitive match with a mark element; user input is never interpreted as HTML.',
 'Remove previous marks before each update. On clear, restore all FAQ items and their previous open/closed state. Test guide, [ and HTML-like input.'
], 'task-3-highlight', 'Every occurrence of guide in matching questions and answers is marked.', 285, 220)
task(4, 'Show reading progress.', [
 'Add a fixed horizontal bar with a blue, teal and lime gradient on every page. Expose its 0-100 value through an accessible progressbar role.',
 'On jQuery scroll/resize events, schedule one update per animation frame. Calculate scrollTop / (scrollHeight - innerHeight) * 100.',
 'Clamp the percentage, handle pages without scrollable distance and set the span width with .css(). Verify that the bottom of the page reads 100%.'
], 'task-4-progress', 'The colored bar reaches the full viewport width at the page bottom.', 220, 240)
task(5, 'Bring the guide numbers to life.', [
 'Display three real project counts: 4 city destinations, 6 pages and 9 photos in the homepage carousel.',
 'When the block enters the viewport, use jQuery .animate() on a numeric object. The step callback updates the displayed integer and complete sets the exact target.',
 'Mark each counter as counted to avoid repeats. Reduced-motion preference skips the movement and shows the final values immediately.'
], 'task-5-counters', 'Counters finish at 4, 6 and 9; static accessible labels keep the counts understandable.', 260, 165)
task(6, 'Make form processing clear.', [
 'Keep the existing validation. Invalid fields show errors immediately; successful validation dispatches a cancelable form-loading event to the jQuery handler.',
 'Replace the submit button contents with a spinner and Please wait, disable the button and mark the form aria-busy. Repeated submit events are ignored.',
 'After the 1.4-second simulated delay, restore the original button and run the completion callback. Clear sample passwords and show the demo confirmation and toast.'
], 'task-6-spinner', 'The valid signup form is busy and the submit control is disabled.', 275, 220)
task(7, 'Confirm the action, then fade.', [
 'Share one accessible status toast between saved places, successful form checks and copy actions. Earlier controls dispatch a notification event.',
 'Set the message with .text() and show it using .fadeIn(). Cancel the previous timer and animation queue before displaying a newer message.',
 'After 2.8 seconds, use .fadeOut() and clear the text. Browser checks verify that saving a city displays a message and the toast later disappears.'
], 'task-7-toast', 'Saving Aktau produces a temporary confirmation at the bottom of the viewport.', 230, 235)
task(8, 'Copy something worth sharing.', [
 'Add Copy guide link on every page and Copy my route inside the generated route result. Read the actual displayed text from the linked target element.',
 'Use navigator.clipboard.writeText() in a secure context, with a legacy text-selection fallback. Await successful copying before showing a checkmark and Copied to clipboard tooltip.',
 'Restore the button after 2.2 seconds. Test actual clipboard text and denied permission; failures show a clear message without claiming success.'
], 'task-8-copy', 'A generated three-day Almaty route is copied successfully.', 290, 205)
task(9, 'Load the view as it arrives.', [
 'Preserve each original photograph, alt text and dimensions. Store its URL in data-src and initially use a small local placeholder; retain noscript image copies.',
 'Use jQuery viewport checks on throttled scroll/resize events. For an image near the visible region, set src from data-src with .attr() and remove data-src.',
 'Preload an upcoming Bootstrap slide before its transition. Network checks verify that Rock Trail is absent from initial requests and loads after the gallery is visited.'
], 'task-9-lazy', 'The next carousel photograph has loaded while offscreen images remain deferred.', 280, 225)

page('KZ TRAVEL / PART 4 / DEPLOYMENT', 'Published and checked.')
add('The website implementation was committed and pushed to the existing shared main branch. GitHub Pages rebuilt the site successfully. The report was prepared after checking the published version.')
add('<b>Verified website source:</b> '+escape(publication['sourceCommit']),'Small6')
add('<b>Verified:</b> '+escape(publication['verifiedAtLocal'])+' (Asia/Tashkent).','Small6')
add(f'<b>Live URL:</b> <link href="{URL}" color="#174add">{URL}</link>')
workflow = publication['workflowUrl']
add(f'<b>Pages workflow:</b> <link href="{workflow}" color="#174add">Open successful build and deployment</link>')
add(f"<b>HTTP verification.</b> {publication['http']['fileCount']} published HTML/assets returned HTTP 200 and matched the checkout. Exact hashes and the workflow result are stored in docs/assignment-6/deployment.json.")
add('<b>Browser verification.</b> The local and published websites were checked in Chromium and Microsoft Edge, each at 1440 x 1000 and 390 x 844. All six pages fit the viewport and retained team credits; the test recorded no JavaScript exceptions or HTTP errors.')
for item in [
 'Search, category/Saved combinations, no-results recovery, keyboard suggestions and literal special-character/HTML-like queries.',
 'FAQ highlights, restored accordion state, night mode, counters and reduced-motion values.',
 'Invalid and valid forms, a disabled submit button, repeated-submit rejection and completion recovery.',
 'Fading toast, actual Clipboard API contents in Chromium, route and guide copying, reset state and clipboard denial.',
 'Deferred image network requests, successful carousel lazy loading, scroll progress to 100%, responsive layout and contact dialog Escape.',
 'Blocked CDN with working local jQuery fallback.'
]: add('- '+item)
add('<b>Evidence files.</b> docs/assignment-6/browser-verification.json and live-browser-verification.json contain repeatable scenario results. Source and webpage screenshots accompany this report in the ZIP. The test script is scripts/verify-assignment6.cjs.','Small6')
shot('mobile-home', 'Mobile homepage, Chromium at 390 x 844.', 205)

page('KZ TRAVEL / REFLECTION AND DEFENCE', 'What we learned.')
add('<b>Integrating an existing project.</b> Search and notifications already had JavaScript handlers. Adding competing handlers would cause inconsistent results. We gave jQuery ownership of the discovery display and connected saved-place changes through events. One shared toast now handles confirmation messages.')
add('<b>Safe highlighting.</b> A raw search value can break a regular expression, and inserting it as HTML can create unintended elements. Escaping regex syntax and constructing marks from text nodes supports literal queries while preserving the document structure.')
add('<b>State and asynchronous feedback.</b> FAQ searching temporarily expands matching answers, so we save the original accordion state and restore it on clear. Forms validate first, then expose a busy state and use a completion callback. Clipboard confirmation follows the resolved promise and reports permission failure honestly.')
add('<b>Media and performance.</b> Hidden carousel slides are not in the viewport. We load their images before the slide transition in addition to normal scroll checks. A single animation-frame scheduler groups progress, counter and image work. Reduced-motion preference changes animation duration to zero.')
add('<b>Defence sequence.</b> Open the console for Task 0; filter Almaty; choose a suggestion by keyboard; search guide in the FAQ; scroll through the progress bar and counters; submit invalid then valid sample data; save a city; copy a generated route; inspect deferred requests in Network. Explain .on(), .filter(), .text(), .attr(), .prop(), .animate() and .fadeOut().')
add('<b>Delivery.</b> Submit this PDF and KZ-Travel-Assignment-6.zip. Every member uploads the same complete files individually and prepares to explain every feature. Check the exact deadline in the LMS; the supplied assignment PDF does not specify a date.')
add('<b>Limitations.</b> This is a static educational travel guide. Processing is simulated; no account, booking, subscription or message is created. Actual clipboard access follows browser permissions. Dynamic travel details should be checked before a real trip.')
add('<b>References.</b> The supplied Assignment 6 jQuery.pdf, Tasks 0-9 and Part 4; official jQuery documentation:','Small6')
for label, url in [('ready','https://api.jquery.com/ready/'),('filter','https://api.jquery.com/filter/'),('on','https://api.jquery.com/on/'),('animate','https://api.jquery.com/animate/'),('fadeOut','https://api.jquery.com/fadeOut/')]:
    add(f'<link href="{url}" color="#174add">jQuery .{label}() - {url}</link>','Small6')
add('jQuery is MIT licensed (vendor/jquery-LICENSE.txt). Bootstrap and local font licences remain in the project. All original project images are preserved. Russian defence notes are included in docs/assignment-6-defense-ru.md.','Small6')

def footer(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#dce0de')); canvas.line(40,34,A4[0]-40,34)
    canvas.setFont('Report',7.3); canvas.setFillColor(GREY)
    canvas.drawString(40,22,'KZ TRAVEL  /  ASSIGNMENT 6  /  SE-2501')
    canvas.drawRightString(A4[0]-40,22,str(document.page))
    canvas.restoreState()
SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=38, bottomMargin=47,
                  title='KZ Travel - Assignment 6: jQuery', author='KZ Travel - SE-2501').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
