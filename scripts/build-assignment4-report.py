"""Build the submission PDF from the implemented tasks and browser screenshots.

Run with a Python environment containing reportlab and Pillow.
"""
from pathlib import Path
from html import escape
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, KeepTogether, Preformatted,
)

ROOT = Path(__file__).resolve().parents[1]
# Embed available fonts to keep spacing identical in every PDF viewer.
FONT_DIR = Path('/usr/share/fonts/google-noto')
for name, filename in [
    ('Helvetica', 'NotoSans-Regular.ttf'),
    ('Helvetica-Bold', 'NotoSans-Bold.ttf'),
    ('Helvetica-Oblique', 'NotoSans-Italic.ttf'),
    ('Helvetica-BoldOblique', 'NotoSans-BoldItalic.ttf'),
    ('Courier', 'NotoSansMono-Regular.ttf'),
]:
    if (FONT_DIR / filename).exists():
        pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
SHOTS = ROOT / 'docs/assignment-4/screenshots'
OUTPUT = ROOT / 'output/pdf/KZ-Travel-Assignment-4-Report.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
BLUE = colors.HexColor('#315e77')
OLIVE = colors.HexColor('#56562e')
SAND = colors.HexColor('#fbeec1')
WIDTH = A4[0] - 92
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', fontName='Helvetica-Bold', fontSize=29,
                          leading=34, textColor=BLUE, spaceAfter=18))
styles.add(ParagraphStyle(name='ReportH1', fontName='Helvetica-Bold', fontSize=19,
                          leading=24, textColor=BLUE, spaceAfter=12))
styles.add(ParagraphStyle(name='ReportH2', fontName='Helvetica-Bold', fontSize=12,
                          leading=16, textColor=OLIVE, spaceBefore=12, spaceAfter=7))
styles.add(ParagraphStyle(name='ReportBody', fontName='Helvetica', fontSize=10,
                          leading=14, spaceAfter=8))
styles.add(ParagraphStyle(name='ReportSmall', fontName='Helvetica', fontSize=8.5,
                          leading=11.5, textColor=colors.HexColor('#555555'), spaceAfter=7))
styles.add(ParagraphStyle(name='Caption', fontName='Helvetica-Oblique', fontSize=8.5,
                          leading=12, textColor=colors.HexColor('#555555'), alignment=TA_CENTER,
                          spaceBefore=5, spaceAfter=11))
styles.add(ParagraphStyle(name='CodeBlock', fontName='Courier', fontSize=8.5,
                          leading=12, backColor=colors.HexColor('#f4f6f7'), borderPadding=10))
story = []


def p(text, style='ReportBody'):
    return Paragraph(text, styles[style])


def add(text, style='ReportBody'):
    story.append(p(text, style))


def heading(text):
    add(text, 'ReportH1')


def steps(items):
    for i, text in enumerate(items, 1):
        add(f'<b>{i}.</b> {text}')


def shot(filename, caption, max_height=280, max_width=WIDTH, keep=True):
    file = SHOTS / filename
    with PILImage.open(file) as source:
        width, height = source.size
    scale = min(max_width / width, max_height / height)
    content = [Image(str(file), width=width * scale, height=height * scale), p(caption, 'Caption')]
    return KeepTogether(content) if keep else content


def table(rows, widths, header=True):
    content = [[p(escape(str(cell)), 'ReportSmall') for cell in row] for row in rows]
    result = Table(content, colWidths=widths, hAlign='LEFT')
    commands = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), .5, colors.HexColor('#d7c896')),
        ('INNERGRID', (0, 0), (-1, -1), .4, colors.HexColor('#d7c896')),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    if header:
        commands.append(('BACKGROUND', (0, 0), (-1, 0), SAND))
    result.setStyle(TableStyle(commands))
    story.append(result)
    story.append(Spacer(1, 12))


add('FRONTEND DEVELOPMENT / SE-2501', 'ReportSmall')
story.append(Spacer(1, 20))
add('KZ Travel<br/>Assignment 4', 'ReportTitle')
add('Introduction to JavaScript', 'ReportH1')
add('<b>Team:</b> KZ Travel &nbsp;&nbsp; <b>Group:</b> SE-2501<br/><b>Prepared:</b> 11 October 2026')
table([
    ['Team member', 'JavaScript responsibility'],
    ['Ramazan Utegen', 'Task 1: form validation, password length and confirmation'],
    ['Ziyadinkhan Kudaibergenuly', 'Task 2: FAQ accordion'],
    ['Ruzimuhammad', 'Tasks 3-5: contact popup, background colours and live clock'],
], [WIDTH * .40, WIDTH * .60])
add('Objective', 'ReportH2')
add('Extend the existing six-page Kazakhstan travel guide with interactive JavaScript features: input validation, expandable FAQ answers, a contact popup, background colour changes, and a readable current date and time. Keep the previous responsive Bootstrap layouts and destination content.')
add('Shared website', 'ReportH2')
add('<link href="https://ramazanutegen.github.io/assignment1web/" color="#315e77">https://ramazanutegen.github.io/assignment1web/</link>')
add('Repository: <link href="https://github.com/ramazanutegen/assignment1web" color="#315e77">github.com/ramazanutegen/assignment1web</link>')
add('Pages: Home, Aktau, Astana, Almaty, Shymkent, and About Us. Every footer names all three members. JavaScript is linked with <font face="Courier">defer</font>, and shared files run after the page markup is parsed.')
add('Team preparation', 'ReportH2')
add('The table sets responsibility and study ownership for the shared implementation. Each member must personally review and practise their component, understand their teammates\' code, submit the report and ZIP, and defend the project during the practice lesson.')

story.append(PageBreak())
heading('Task 1 / Form validation')
add('<b>Responsible member:</b> Ramazan Utegen<br/><b>Location:</b> Home / Community signup; shared validation on existing enquiry forms.')
steps([
    'Add required name, email, message, password, and confirmation inputs. Choose and display a minimum password length of eight characters.',
    'Select forms with <font face="Courier">data-demo-form</font> and attach a submit listener in <font face="Courier">js/forms.js</font>. Prevent normal submission and check the entries in JavaScript.',
    'Reject empty or whitespace-only required values, invalid email syntax, short passwords, and mismatched confirmation. Require the contact form\'s acknowledgement checkbox.',
    'Show an inline error beside each invalid field and a summary. Set accessible error attributes and focus the first invalid input.',
    'Recheck corrected fields, including confirmation when the original password changes. Show success for valid input and clear passwords after a successful check.',
])
story.append(shot('task-1-validation-errors.png', 'Figure 1. Required-field, email, length, and matching-password errors.', max_height=365))
add('Forms validate in the browser only. They do not transmit data or create accounts, bookings, messages, or subscriptions.', 'ReportSmall')

story.append(PageBreak())
heading('Task 2 / FAQ accordion')
add('<b>Responsible member:</b> Ziyadinkhan Kudaibergenuly<br/><b>Location:</b> Home / Travel FAQ.')
steps([
    'Create four question buttons and matching answer panels with unique IDs. All answers start closed.',
    'In <font face="Courier">js/accordion.js</font>, toggle <font face="Courier">aria-expanded</font>, answer visibility, <font face="Courier">inert</font>, and the item\'s open class on click.',
    'Animate the CSS grid row from 0fr to 1fr over 0.3 seconds. Disable transitions when reduced motion is requested.',
    'Verify repeated clicks and keyboard Enter open and close each question independently.',
])
story.append(shot('task-2-faq-closed.png', 'Figure 2. Default state: all four answers are hidden.', max_height=190))
story.append(shot('task-2-faq-open.png', 'Figure 3. Clicking the first question reveals its answer.', max_height=220))

story.append(PageBreak())
heading('Task 3 / Popup contact form')
add('<b>Responsible member:</b> Ruzimuhammad<br/><b>Location:</b> About Us / Contact the Team.')
steps([
    'Place the contact form inside an initially closed, labelled HTML dialog.',
    'Call <font face="Courier">showModal()</font> from Contact Us and show a dark backdrop. Keep its width and height within the viewport.',
    'Close it with the close button, Escape, or an outside click. Compare pointer-down and click positions to avoid accidental dismissal while dragging from inside.',
    'Keep keyboard focus inside while open, stop background scrolling, and restore focus to Contact Us after closing. Apply shared form validation.',
])
story.append(shot('task-3-contact-popup.png', 'Figure 4. The contact form opens above the page with a close control and backdrop.', max_height=415))
add('The popup was checked at desktop and phone sizes in Chromium and Firefox. All three close methods and valid contact input passed.', 'ReportSmall')

story.append(PageBreak())
heading('Task 4 / Change background colour')
add('<b>Responsible member:</b> Ruzimuhammad &nbsp;&nbsp; <b>Location:</b> Toolbar on all six pages.')
steps([
    'Add a Change background button and a current-colour label.',
    'Store Sand, Sky, and Steppe in an array in <font face="Courier">js/preferences.js</font>. Advance with <font face="Courier">(index + 1) % colours.length</font>.',
    'Assign the selected colour to <font face="Courier">document.body.style.backgroundColor</font> and update the label. Use a short CSS transition and a reduced-motion override.',
])
story.append(shot('task-4-background-sand.png', 'Figure 5. Original Sand page background.', max_height=55))
story.append(shot('task-4-background-sky.png', 'Figure 6. The button changes the background and label to Sky.', max_height=55))
add('Task 5 / Display current date and time', 'ReportH1')
add('<b>Responsible member:</b> Ruzimuhammad &nbsp;&nbsp; <b>Location:</b> Toolbar on all six pages.')
steps([
    'Create a Date object and update the time element\'s machine-readable datetime attribute.',
    'Use Intl.DateTimeFormat for a readable English date and time with seconds. Use Asia/Almaty and label UTC+5 explicitly.',
    'Update immediately, then every 1,000 milliseconds with setInterval in <font face="Courier">js/clock.js</font>.',
])
story.append(shot('task-5-live-clock.png', 'Figure 7. Readable Kazakhstan time, updated every second.', max_height=55))
add('The clock was tested with the browser configured to America/New_York: it still displayed Kazakhstan time, and its datetime value advanced automatically.', 'ReportSmall')

story.append(PageBreak())
heading('Deployment and verification')
steps([
    'Run the website locally with <font face="Courier">python3 -m http.server 8000</font>. Check assets, unique IDs, and internal fragment links.',
    'Exercise all six pages and all five features using the browser integration check in <font face="Courier">scripts/verify-assignment4.cjs</font>.',
    'Commit and push to the existing shared repository on main. GitHub Pages builds the root of main; verify the build and the updated files at the live website URL.',
    'Generate this PDF, inspect its rendered pages, and package the website, assets, report, screenshots, and study notes into the project ZIP.',
])
table([
    ['Browser', 'Viewport', 'Result'],
    ['Chromium', '1440 x 1100 / desktop', 'Passed'],
    ['Chromium', '390 x 844 / phone size', 'Passed'],
    ['Firefox', '1440 x 1100 / desktop', 'Passed'],
    ['Firefox', '390 x 844 / phone size', 'Passed'],
], [WIDTH * .23, WIDTH * .47, WIDTH * .30])
add('Checks: missing and whitespace-only fields; email syntax; short and mismatched passwords; successful submission; FAQ clicks and keyboard toggling; popup opening, closing, and focus; complete colour cycling; live clock updates and timezone; footer names; overflow; and JavaScript/HTTP asset errors.', 'ReportSmall')
mobile = Table([[
    shot('mobile-faq.png', 'Figure 8. Phone-size FAQ.', max_height=245, max_width=WIDTH / 2 - 12, keep=False),
    shot('mobile-contact-popup.png', 'Figure 9. Phone-size popup.', max_height=245, max_width=WIDTH / 2 - 12, keep=False),
]], colWidths=[WIDTH / 2, WIDTH / 2])
mobile.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0)]))
story.append(mobile)

story.append(PageBreak())
heading('Reflection and defence preparation')
add('JavaScript adds immediate input feedback, expandable content, a popup contact form, background control, and a live clock to the existing travel guide. Shared scripts make the behaviour consistent across pages while retaining the previous responsive design. The tasks connect DOM selection, events, conditionals, arrays, CSS changes, and timers to visible interactions.')
add('Each member\'s practice task', 'ReportH2')
table([
    ['Member', 'Practice change and explanation'],
    ['Ramazan Utegen', 'Change the minimum password length and hint. Explain required-field checks, email syntax, confirmation, and preventDefault.'],
    ['Ziyadinkhan Kudaibergenuly', 'Add a fifth FAQ with unique IDs. Explain DOM selection, aria-expanded, open classes, and the CSS transition.'],
    ['Ruzimuhammad', 'Add a fourth background colour and change the clock format. Explain modal close methods, focus, arrays, Date, and setInterval.'],
], [WIDTH * .35, WIDTH * .65])
add('All members should also explain another member\'s component and demonstrate the full website. Study <font face="Courier">docs/assignment-4.md</font> for the complete walkthrough and additional screenshots.')
add('Final submission checklist', 'ReportH2')
for text in [
    'All five requested JavaScript components are included, linked, and tested.',
    'All three team members are named in every HTML footer.',
    'The report includes team/group details, an objective, task steps, screenshots, the deployed URL, verification, and reflection.',
    'Every member submits the same report and project ZIP individually in the LMS.',
    'Check the Assignment 4 deadline in the LMS; no specific date is provided in the assignment PDF.',
    'Attend and defend the work during the practice lesson. Defence is worth 40%; implementation is 50% and the report is 10%.',
]:
    add('&bull; ' + text)
add('The forms remain static demonstrations. A production service would need server-side processing before creating accounts or sending messages. The next learning step is for each member to rehearse the implementation and practise making small changes independently.', 'ReportSmall')


def page_chrome(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#d7c896'))
    canvas.line(46, A4[1] - 35, A4[0] - 46, A4[1] - 35)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(OLIVE)
    canvas.drawString(46, A4[1] - 25, 'KZ TRAVEL / ASSIGNMENT 4')
    canvas.drawRightString(A4[0] - 46, A4[1] - 25, 'SE-2501 / THREE-PERSON TEAM')
    canvas.setFillColor(colors.HexColor('#666666'))
    canvas.drawString(46, 25, '11 October 2026 | Frontend Development')
    canvas.drawRightString(A4[0] - 46, 25, str(doc.page))
    canvas.restoreState()


doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=46, rightMargin=46,
                        topMargin=52, bottomMargin=43, title='KZ Travel - Assignment 4 Report',
                        author='KZ Travel team, SE-2501', pageCompression=1)
doc.build(story, onFirstPage=page_chrome, onLaterPages=page_chrome)
print(OUTPUT)
