"""Build the Assignment 5 review report from real browser captures.

python scripts/build-assignment5-report.py
After verified publication only:
python scripts/build-assignment5-report.py --published-date YYYY-MM-DD
"""
from pathlib import Path
from html import escape
import argparse
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak

parser = argparse.ArgumentParser()
parser.add_argument('--published-date', help='Set only after verifying the updated deployed site.')
args = parser.parse_args()
ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'docs/assignment-5/screenshots'
OUTPUT = ROOT / 'output/pdf/KZ-Travel-Assignment-5-Report.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
URL = 'https://ramazanutegen.github.io/assignment1web/'
BLUE = colors.HexColor('#174add')
INK = colors.HexColor('#172124')
GREY = colors.HexColor('#596366')
LIME = colors.HexColor('#d5f273')
FONTDIR = Path('C:/Windows/Fonts')
for name, filename in [('Report', 'arial.ttf'), ('ReportBold', 'arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTDIR / filename)))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title5',fontName='ReportBold',fontSize=35,leading=38,textColor=INK,spaceAfter=15))
styles.add(ParagraphStyle(name='HeadingKZ',fontName='ReportBold',fontSize=22,leading=26,textColor=INK,spaceAfter=12))
styles.add(ParagraphStyle(name='Body5',fontName='Report',fontSize=9.4,leading=13.5,textColor=INK,spaceAfter=8))
styles.add(ParagraphStyle(name='Small5',fontName='Report',fontSize=8,leading=11,textColor=GREY,spaceAfter=7))
styles.add(ParagraphStyle(name='Kicker5',fontName='ReportBold',fontSize=8,leading=12,textColor=BLUE,spaceAfter=12))
styles.add(ParagraphStyle(name='Caption5',fontName='Report',fontSize=7.2,leading=10,textColor=GREY,spaceAfter=10))
W = A4[0] - 88
story = []

def p(text, style='Body5'):
    return Paragraph(text, styles[style])
def add(text, style='Body5'):
    story.append(p(text, style))
def screenshot(name, caption, max_height=235):
    path = SHOTS / name
    with PILImage.open(path) as im:
        scale = min(W / im.width, max_height / im.height)
        image = Image(str(path),width=im.width*scale,height=im.height*scale)
    image.hAlign='CENTER'
    story.extend([image,Spacer(1,5),p(caption,'Caption5')])
def heading(number, title):
    story.append(PageBreak())
    add('KZ TRAVEL / ASSIGNMENT 5 / '+number,'Kicker5')
    add(title,'HeadingKZ')
def steps(items):
    for index, text in enumerate(items, 1): add(f'<b>{index}.</b> {text}')
def task(number,title,requirement,items,shot,code):
    heading(number,title)
    add(requirement,'Small5')
    steps(items)
    screenshot(shot,'Result in the local browser. Original captures are included in docs/assignment-5/screenshots/.',220)
    screenshot('code-'+code+'.png','Source-code screenshot, rendered from the actual project file with original line numbers.',265)

add('KZ TRAVEL / SE-2501 / 23 OCTOBER 2026','Kicker5')
add('Go a little further.<br/>Assignment 5','Title5')
add('Advanced JavaScript and DOM Manipulation','HeadingKZ')
screenshot('index-desktop.png','KZ Travel: a redesigned Kazakhstan guide using the original project photographs.',235)
add('<b>Objective.</b> Continue the six-page travel project with an engaging interface that demonstrates JavaScript fundamentals, DOM manipulation, events, callbacks, data structures, sound and animations.')
team = [[p('<b>Team</b>'),p('KZ Travel')],[p('<b>Members</b>'),p('Ramazan Utegen<br/>Ziyadinkhan Kudaibergenuly<br/>Ruzimuhammad')],[p('<b>Group</b>'),p('SE-2501')]]
table=Table(team,colWidths=[90,W-90]);table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f5f5f0')),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),4)]));story.extend([table,Spacer(1,12)])
add('<b>Publication:</b> '+('Updated deployment verified '+escape(args.published_date)+'.' if args.published_date else 'Review draft. The Assignment 5 changes are local; commit, push and deployment are deferred at the team\'s explicit request.'),'Small5')
add(f'<b>Existing deployment address:</b> <link href="{URL}" color="#174add">{URL}</link>','Small5')

task('01','Select, update and rate.','Part 1.1: DOM selection, dynamic text, class-based styling and the chosen rating-star option for attribute manipulation.',[
    'Select the rating group and its five stars with querySelector/querySelectorAll.',
    'A click updates the selected value, CSS class, aria-pressed and textContent feedback.',
    'Store the page-specific rating locally; reload to restore it. User text is never inserted as HTML.'
],'rating.png','dom')

task('02','A guide for day and night.','Part 1.1: dynamic styling; chosen option: functional Day/Night switch.',[
    'The moon/sun button calls applyTheme and changes the body data-theme attribute.',
    'CSS variables recolour surfaces, text, borders and controls across all six pages.',
    'Persist the theme locally. Keep the earlier Sand/Sky/Steppe background cycle working with matching night colours.'
],'night-faq.png','theme')

task('03','Make discovery respond.','Part 1.2: addEventListener, keyboard handling and switch statements.',[
    'Bind click/input listeners to category buttons, saved hearts and destination search.',
    'Use a switch to choose category logic; combine it with the search query and update results without reload.',
    'Use keydown and a switch for four arrow keys, Home and End. Move focus through navigation links and preserve normal Tab behaviour.'
],'discovery.png','events')

task('04','One journey, three steps.','Part 1.2: chosen callback option: multi-step form with Next and Back.',[
    'Create destination, traveller-details and review fieldsets. Hidden steps remain in the DOM.',
    'changeStep validates the current step, changes its index, then invokes the onStepChanged callback.',
    'Pass showStep as that callback. Back/Next preserve inputs; missing choices show feedback; Start over resets the form.'
],'planner-review.png','callback')

task('05','Turn data into a route.','Part 1.3: objects and methods, arrays, loops and higher-order functions.',[
    'Represent each city as an object containing its name, category, description and stops array.',
    'Add getRoute(days), which returns this.stops.slice(0, days). Use map/filter/forEach to process collections.',
    'Build the selected route with an explicit for loop, createElement and textContent. A two-day choice generates exactly two day items.'
],'planner-result.png','data')

task('06','A small sound of discovery.','Part 1.3: JavaScript-triggered sound effects, controlled by the user.',[
    'Sound starts disabled. Clicking the music note enables audio and previews the chime.',
    'A sine oscillator changes from 660 to 880 Hz. A short gain envelope fades the note out.',
    'Saving, rating or completing a route can trigger it. A new sound stops the old oscillator; onended disconnects nodes. The toggle disables further sounds.'
],'sound-route.png','sound')

task('07','Motion with a purpose.','Parts 1.3-1.5: event-triggered animation, separation of concerns, clean structure and theme integration.',[
    'Restart ui-enter after filtering, rating or changing a step; use a pulse for a saved heart.',
    'CSS controls transitions, keyframes and progress animation; prefers-reduced-motion disables movement.',
    'Keep markup in HTML, presentation in editorial.css, and behaviour in experience.js. Use meaningful helper functions, local assets, responsive layouts and travel-specific content.'
],'mobile-home.png','animation')

task('08','Keep every view of Kazakhstan.','Additional DOM enhancement: clickable gallery thumbnails while retaining the original manual galleries.',[
    'Retain the five nine-image Bootstrap carousels, original image sources, arrows and indicators.',
    'Add a button for every thumbnail, targeting the matching slide through Bootstrap data attributes.',
    'On slid.bs.carousel, update the thumbnail class and aria-pressed. Manual, thumbnail and keyboard navigation remain in sync.'
],'gallery.png','gallery')

heading('09','Earlier work, still working.')
add('The redesign preserves the existing theme, all original image files and references, city content, sample routes, tables and team credits. The shared Bootstrap grid and the earlier CSS-only media-query card exercise remain.')
steps(['Legacy forms still validate required fields, email, password length and confirmation; successful validation stays on the page.', 'The homepage FAQ opens/closes; the About Us dialog closes with Escape and returns focus to Contact Us.', 'The clock updates in Asia/Almaty (UTC+5). Background cycling now appears in the footer.'])
screenshot('contact-popup.png','Retained contact dialog; the screenshot shows the original form fields in the new design.',205)
screenshot('legacy-form.png','A valid sample form displays confirmation without transmitting data or creating a subscription.',205)

heading('10','Verification, reflection and publication.')
add('<b>Review environment:</b> in-app Chromium on Windows, 1280 x 720 desktop viewport; same-origin responsive frames at 360, 390 and 768 CSS px. Frame inner widths exclude scrollbars. These checks do not claim physical-device or Firefox coverage.')
checks = [
    ['Check','Observed result'],
    ['Six desktop pages','No horizontal overflow or broken loaded images'],
    ['18 responsive layouts','All six pages fit 360 / 390 / 768 px frames'],
    ['Search, filters and saved places','Combined criteria, empty state and persistence work'],
    ['Planner and callbacks','Validation, Back, review, correct route length and reset'],
    ['Theme, rating and navigation','Persistence, star feedback and arrow-key focus work'],
    ['Legacy functions','Form validation, FAQ, galleries, popup and focus return'],
    ['Static source check','Resources, anchors, IDs, credits and all original photos'],
]
table=Table([[p(escape(cell),'Small5') for cell in row] for row in checks],colWidths=[140,W-140],repeatRows=1)
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),LIME),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#dce0de')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story.extend([table,Spacer(1,14)])
add('<b>Challenges and solutions.</b> Existing features survived by retaining their scripts and changing the shared presentation layer. Theme variables resolve day/night consistency with the older background control. Hiding fieldsets preserves input on Back. textContent safely displays names; local dependency files allow offline use. Sound starts only after interaction and its audio nodes are cleaned up.')
add('<b>Reflection and defence.</b> Each member should trace an event from its listener to its callback, data processing, DOM update and CSS effect. Practise explaining this, getRoute, switch, filter/map/forEach, the explicit for loop, aria-pressed, hidden, localStorage and reduced-motion handling. Rehearsal notes are included in English and Russian.')
add('<b>Part 2 - updated website deployment.</b> '+('The team records the updated website as verified on '+escape(args.published_date)+'.' if args.published_date else 'Pending approval. No commit, push or updated deployment was performed. The existing public address still serves the previously published version. This review report must be refreshed after deployment.'))
add(f'<link href="{URL}" color="#174add">{URL}</link>')
add('<b>Before submission:</b> approve the preview; commit/push; verify GitHub Pages; rebuild the report and ZIP. Every team member submits both files and attends the practice-lesson defence. LMS deadline supplied by the team: 29 October 2026, 14:00; follow the LMS time zone.','Small5')

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#dce0de'));canvas.line(44,36,A4[0]-44,36)
    canvas.setFont('Report',7);canvas.setFillColor(GREY)
    canvas.drawString(44,23,'KZ TRAVEL / SE-2501 / '+('PUBLISHED' if args.published_date else 'LOCAL REVIEW DRAFT'))
    canvas.drawRightString(A4[0]-44,23,str(doc.page))

doc=SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=42,bottomMargin=48,title='KZ Travel - Assignment 5',author='KZ Travel / SE-2501')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
