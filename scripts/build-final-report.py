"""Create the final PDF from actual screenshots, source and verification records."""
from pathlib import Path
from html import escape
from hashlib import sha256
import argparse
import json
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
mode=parser.add_mutually_exclusive_group()
mode.add_argument('--review',action='store_true',help='Build the named submission PDF from branch verification.')
mode.add_argument('--draft',action='store_true',help='Write a temporary layout proof.')
args=parser.parse_args()
review=args.review or args.draft
EVIDENCE=ROOT/'docs/final';SHOTS=EVIDENCE/'screenshots'
tests=json.loads((EVIDENCE/'browser-verification.json').read_text(encoding='utf-8'))
assert tests['results'] and all(item['status']=='passed' for item in tests['results'])
layout_runs = [item for item in tests['results'] if 'layoutChecks' in item]
assert {item['viewport']['width'] for item in layout_runs} == {390,768,1024,1440}, 'Run the four-width browser matrix first.'
assert all(len(item['layoutChecks']) == 18 for item in layout_runs), 'Verify each page in both themes.'
publication={}
if not review:
    publication=json.loads((EVIDENCE/'deployment.json').read_text(encoding='utf-8'))
    assert publication.get('workflowConclusion')=='success','Verify publication first.'
    for item in publication['http']['files']:
        asset=ROOT/item['path']
        expected=asset.read_bytes()
        if asset.suffix in {'.html','.css','.js','.svg','.txt','.json','.xml'}:
            expected=expected.replace(b'\r\n',b'\n')
        assert item['matchesCheckout'] and item['sha256']==sha256(expected).hexdigest(), f'Rerun hosted verification for {asset.name}.'
    live=json.loads((EVIDENCE/'live-browser-verification.json').read_text(encoding='utf-8'))
    assert all(item['status']=='passed' for item in live['results'])
OUTPUT=ROOT/('tmp/pdfs/KZTravel-final-draft.pdf' if args.draft else 'output/final/KZTravel_SE2501_Report.pdf')
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
URL='https://ramazanutegen.github.io/assignment1web/'
REPO='https://github.com/RamazanUtegen/assignment1web'
INK,ACCENT,MUTED,WASH=[colors.HexColor(v) for v in ['#182824','#164d3c','#4e605a','#f0f5f1']]
font_locations = [
    ('C:/Windows/Fonts', 'arial.ttf', 'arialbd.ttf'),
    ('/usr/share/fonts/liberation-sans-fonts', 'LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation2', 'LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation', 'LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/dejavu', 'DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'),
]
BODY_FONT, BOLD_FONT = 'Helvetica', 'Helvetica-Bold'
for folder, regular, bold in font_locations:
    regular_path, bold_path = Path(folder)/regular, Path(folder)/bold
    if regular_path.is_file() and bold_path.is_file():
        BODY_FONT, BOLD_FONT = 'KZ Body', 'KZ Bold'
        pdfmetrics.registerFont(TTFont(BODY_FONT,str(regular_path)))
        pdfmetrics.registerFont(TTFont(BOLD_FONT,str(bold_path)))
        pdfmetrics.registerFontFamily(BODY_FONT,normal=BODY_FONT,bold=BOLD_FONT)
        break
styles = getSampleStyleSheet()
for name, size, leading, font, color, after in [
    ('KBody', 10.5, 14.5, BODY_FONT, INK, 9),
    ('KSmall', 9, 12.6, BODY_FONT, MUTED, 7),
    ('KCaption', 8.5, 11.5, BODY_FONT, MUTED, 9),
    ('KCell', 9.3, 12.5, BODY_FONT, INK, 0),
    ('KColumn', 9.3, 12.5, BOLD_FONT, ACCENT, 0),
    ('KSection', 13, 17, BOLD_FONT, ACCENT, 5),
    ('KHeading', 27, 32, BOLD_FONT, INK, 11),
    ('KTitle', 46, 49, BOLD_FONT, INK, 6),
    ('KSubtitle', 17, 22, BODY_FONT, MUTED, 14),
    ('KKicker', 9, 12, BOLD_FONT, ACCENT, 7),
]:
    styles.add(ParagraphStyle(
        name=name, fontName=font, fontSize=size, leading=leading,
        textColor=color, spaceAfter=after,
    ))

MARGIN = 40
W = A4[0] - 2 * MARGIN - 12
story = []


def p(text, style='KBody'):
    return Paragraph(text, styles[style])


def add(text, style='KBody'):
    story.append(p(text, style))


def heading(kicker, title):
    story.append(PageBreak())
    add(kicker, 'KKicker')
    add(title, 'KHeading')


def link(label, url):
    return f'<link href="{escape(url, quote=True)}" color="#164d3c">{escape(label)}</link>'


def picture(name, max_h=220, max_w=W):
    path = SHOTS / (name + '.png')
    with PILImage.open(path) as image:
        scale = min(max_w / image.width, max_h / image.height)
        width, height = image.width * scale, image.height * scale
    result = Image(str(path), width=width, height=height)
    result.hAlign = 'CENTER'
    return result


def shot(name, caption, max_h=220):
    story.extend([picture(name, max_h), Spacer(1, 5), p(caption, 'KCaption')])


def figures(items, height, widths):
    cells = [
        [picture(name, height, width - 10), Spacer(1, 5), p(caption, 'KCaption')]
        for (name, caption), width in zip(items, widths, strict=True)
    ]
    grid = Table([cells], colWidths=widths, hAlign='LEFT')
    grid.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(grid)


def table(rows, widths):
    data = [
        [p(str(cell), 'KColumn' if index == 0 else 'KCell') for cell in row]
        for index, row in enumerate(rows)
    ]
    result = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    result.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0efe6')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, WASH]),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.extend([result, Spacer(1, 11)])

add('FINAL PROJECT REPORT  /  SE-2501', 'KKicker')
add('KZ Travel', 'KTitle')
add('A travel guide and itinerary planner for Kazakhstan', 'KSubtitle')
shot('index-desktop', 'Figure 1. The published homepage introduces the four destinations and leads into the city directory.', 325)
table([
    ['Team', 'Members'],
    ['KZ Travel<br/>SE-2501', 'Ramazan Utegen<br/>Ziyadinkhan Kudaibergenuly<br/>Ruzimuhammad'],
], [107, W - 107])
add('<b>Project goal.</b> Help first-time visitors choose a city, save places, plan a short trip and check the forecast before travelling.')
add(f'{link("Live website", URL)} &nbsp;&nbsp; {link("Code repository", REPO)}', 'KSmall')
edition = 'Design branch review edition' if review else 'Final submission edition'
add(f'<b>{edition}</b> &nbsp; 18 November 2026', 'KSmall')

heading('PROJECT OVERVIEW', 'Goal and work division')
add('KZ Travel grew from the team\'s existing Kazakhstan guide. It serves first-time visitors, students and travellers planning short breaks. Visitors can compare Aktau, Astana, Almaty and Shymkent before opening a city guide for highlights, photographs and an itinerary.')
add('From the homepage, a traveller can find Almaty, save the guide, see it in a local profile, build a two-day route and check the forecast. The same navigation connects the nine pages, and the notebook brings saved guides and trip planning together.')
add('Documented team contributions', 'KSection')
auth_commit = link('Initial account and validation implementation', REPO + '/commit/ddce3fb')
design_commit = link('Final interface redesign', REPO + '/commit/3405ccb')
image_commit = link('Responsive photo delivery', REPO + '/commit/f022667')
release_commit = link('Publication evidence', REPO + '/commit/a83d4ce')
table([
    ['Member', 'Page and feature contributions'],
    ['<b>Ramazan Utegen</b>', 'Home and Aktau. Built the original shared styles, destination cards, tables and forms. '
     f'Implemented local registration, login, Profile and shared validation. {auth_commit}.'],
    ['<b>Ziyadinkhan Kudaibergenuly</b>', 'Astana and Our Story. Built the capital itinerary and team profiles. '
     'Redesigned the layout, improved keyboard access, optimized photography and verified the GitHub Pages release. '
     f'{design_commit} | {image_commit} | {release_commit}.'],
    ['<b>Ruzimuhammad</b>', 'Almaty and Shymkent. Built the city content, attraction cards, itinerary tables, photo galleries and enquiry forms.'],
], [135, W - 135])
add('Shared integration and testing', 'KSection')
add('The team integrated the guides with shared navigation, account, search, itinerary and forecast modules. Static checks verify the page graph and assets. Browser journeys exercise the complete trip-planning flow, including invalid input, narrower layouts and recovery from forecast or storage errors.')
add(f'Page ownership is recorded on {link("Our Story", URL + "about.html")} and in the repository README. Presentation roles are listed on page 11.', 'KSmall')

heading('WEBSITE PAGES', 'Nine connected pages')
add('The six public guide and team pages share a navigation menu. Log In links to Sign Up. A successful login opens Profile, which links back to saved guides and the route planner.')
pages = [
    ('Home', 'index.html', 'Search and filter cities, save guides, build itineraries, check the forecast and search travel FAQs.'),
    ('Aktau', 'aktau.html', 'Explore Mangystau and the Caspian coast. The guide includes Bozjyra, a gallery, a three-day excursion and an enquiry form.'),
    ('Astana', 'astana.html', 'Explore capital landmarks and architecture, including Baiterek and Khan Shatyr. The guide includes a day itinerary and forecast.'),
    ('Almaty', 'almaty.html', 'Compare city and mountain attractions, browse the gallery and use the three-day schedule, forecast and enquiry form.'),
    ('Shymkent', 'shymkent.html', 'Explore southern food, parks and regional sights. The page includes a gallery, a three-day itinerary, a forecast and an enquiry form.'),
    ('Our Story', 'about.html', 'Read the project purpose and team credits, browse the photo journal and open the keyboard-accessible contact dialog.'),
    ('Sign Up', 'signup.html', 'Create a browser-local account with validated contact details, password and confirmation.'),
    ('Log In', 'login.html', 'Check credentials, show inline feedback and open the notebook after successful authentication.'),
    ('Profile', 'profile.html', 'See stored contact details and saved cities, open the route planner or log out. A session is required.'),
]
table([
    ['Page', 'File', 'What visitors can do'],
    *[(f'<b>{name}</b>', link(filename, URL + filename), feature) for name, filename, feature in pages],
], [78, 86, W - 164])
figures([
    ('astana-desktop', 'Figure 2. Astana guide and its city-specific header.'),
    ('about-desktop', 'Figure 3. Our Story and the team introduction.'),
], 148, [W / 2, W / 2])

heading('DESIGN AND RESPONSIVENESS', 'One guide across screen sizes')
add('The valley photograph and city-specific headers establish a travel identity. Locally hosted DM Sans, a pine-green accent '
    'and shared spacing give cards, forms and navigation a consistent hierarchy. The centered lead image draws on a Finnish '
    'travel guide. ' + link("Visit Finland's Places to Go", 'https://www.visitfinland.com/en/places-to-go/') + '.')
add('Bootstrap, Flexbox and Grid adapt the same content. The menu collapses on smaller screens, the directory uses two columns on tablets, and cards stack on phones. Responsive WebP variants and a portrait crop keep the images useful at each width.')
figures([
    ('destinations-desktop', 'Figure 4. Desktop, 1440 px. Two columns and full navigation.'),
    ('destinations-tablet', 'Figure 5. Tablet, 1024 px. Two columns and a collapsed menu.'),
    ('destinations-mobile', 'Figure 6. Phone, 390 px. One column with touch-sized Save buttons.'),
], 224, [207, 174, W - 381])
add('Light and dark modes', 'KSection')
add('The theme toggle updates shared CSS variables and saves the choice in localStorage across pages. Both themes use the same layout and make controls, keyboard focus and error text readable. The independent Sand, Sky and Steppe background choices also persist.')
shot('destinations-desktop-night', 'Figure 7. The same city directory in dark mode. Saved state and labels remain visible.', 165)
add('Focus outlines, a skip link, labelled controls and reduced-motion styles support keyboard navigation and different motion preferences.', 'KSmall')

heading('AUTHENTICATION', 'From Sign Up to the travel notebook')
add('The account simulation runs on the hosted HTTPS site or localhost. It uses localStorage for account records and session state. Saved city IDs are shared within the same browser and site origin.')
table([
    ['Stage', 'Behaviour'],
    ['<b>Sign Up</b>', 'Validate name, email, phone, password and confirmation. Normalize email and reject duplicates. Store the submitted details with a salted PBKDF2-SHA-256 password verifier.'],
    ['<b>Log In</b>', 'Normalize the email, derive a verifier from the entered password and compare it to the saved value. An incorrect login shows an inline message. A successful login opens Profile.'],
    ['<b>Profile</b>', 'Display the name, email, phone and saved guide links. The session persists after reload. Logging out clears it and updates another open Profile tab.'],
], [85, W - 85])
figures([
    ('signup', 'Figure 8. Sign Up with synthetic contact details.'),
    ('login-error', 'Figure 9. Log In feedback after incorrect credentials.'),
], 168, [W / 2, W / 2])
shot('profile-desktop', 'Figure 10. Profile displays a saved Almaty guide and the demo contact details.', 200)
add('The simulation uses kz-users-v1 and kz-session-v1. Passwords are verified using a hash stored with a per-account salt. ' +
    link('Account implementation', REPO + '/blob/main/js/auth.js') + '.', 'KSmall')

heading('FORM VALIDATION', 'Show the user what to correct')
add('Each form uses <b>novalidate</b> and applies explicit JavaScript rules to the fields it contains. The markup omits required, pattern, minlength, maxlength, min, max and type="email" validation constraints.')
table([
    ['Field', 'Accepted input and feedback'],
    ['<b>Required values</b>', 'Reject empty or whitespace-only values. Require consent where the form has a consent control.'],
    ['<b>Email</b>', 'Validate the address format. Invalid values such as invalid-email get a message beside the field.'],
    ['<b>Phone</b>', 'Require 10-15 digits with an optional plus sign and common separators. A short value such as 123 is rejected.'],
    ['<b>Password</b>', 'Require 8-64 characters with uppercase, lowercase, a digit and a symbol, without spaces. Confirmation must match.'],
    ['<b>Enquiry message</b>', 'Require 10-2,000 characters. The form displays a spinner and locks checked fields while processing.'],
    ['<b>Route planner</b>', 'Check the destination, a 1-60 character traveller name and a 1-3 day duration before generating the route.'],
], [119, W - 119])
figures([
    ('signup-validation', 'Figure 11. Sign Up marks incorrect email, phone, password and confirmation beside their fields.'),
    ('contact-form', 'Figure 12. The contact dialog provides inline feedback and keeps actions keyboard-reachable.'),
], 255, [174, W - 174])
add('Registration, login and enquiries use shared rules that attach errors with aria-invalid and aria-describedby. '
    'The planner validates its steps in JavaScript. ' + link('Shared validation rules', REPO + '/blob/main/js/validation.js') +
    '.', 'KSmall')

heading('DISCOVERY, SAVING AND PLANNING', 'Turn a search into an itinerary')
add('On Home, jQuery combines the typed query and the category or Saved filter. Results update immediately, and keyboard or touch suggestions let visitors choose a city. The FAQ search also filters its questions and answers.')
shot('search', 'Figure 13. Search and the Saved filter keep Almaty visible. The Save control confirms that the city was stored.', 210)
add('Saving a city stores its ID locally. Profile uses the same IDs for guide links. The planner keeps choices when a traveller goes back and builds a route from the city, traveller name and preferred duration.')
shot('planner', 'Figure 14. An Almaty itinerary for two days, with a copy control and confirmation.', 205)
add('<b>Motion and feedback.</b> A 120 ms press animation acknowledges button taps. Saving and planner steps use a 180 ms transition. Clipboard confirmation follows a successful copy, and manual-copy instructions appear if access fails. Reduced motion preserves the controls and messages.')

heading('EXTERNAL API', 'Weather for all four cities')
add('Open-Meteo provides current conditions and a three-day outlook on Home and the city guides. The forecast supports a practical decision such as when to leave for an outdoor stop or whether to bring rain gear.')
live_weather = any(
    'real Open-Meteo' in scenario
    for result in tests['results'] for scenario in result['scenarios']
)
if publication:
    shot('weather-published', 'Figure 15. A live forecast captured on GitHub Pages on 18 November 2026. The values are a snapshot.', 243)
elif live_weather:
    shot('weather-real', 'Figure 15. A live Open-Meteo forecast captured during browser verification.', 243)
else:
    shot('weather-fixture', 'Figure 15. Forecast layout with controlled data from the browser test.', 243)
table([
    ['State', 'What users see'],
    ['<b>Loading</b>', 'The panel identifies the city being fetched and signals progress. A newer request cancels the previous one.'],
    ['<b>Success</b>', 'The current temperature, feels-like temperature, wind and three forecast days appear after validation.'],
    ['<b>Cached</b>', 'A fresh forecast can be reused for 10 minutes. If a refresh fails, a dated saved forecast up to 24 hours old can be shown.'],
    ['<b>Error</b>', 'The panel explains the failure and offers Retry. A 10-second timeout restores the controls.'],
], [95, W - 95])
add('The forecast uses fetch and async/await with HTTP and JSON checks. Requests use the selected city coordinates. '
    'The panel credits Open-Meteo and the CC BY 4.0 licence. ' +
    link('Forecast implementation', REPO + '/blob/main/js/weather.js') + '.', 'KSmall')

heading('PROJECT ORGANIZATION AND CHECKS', 'How the build was verified')
table([
    ['Area', 'Files and responsibilities'],
    ['<b>Pages and layout</b>', 'Root HTML, css/editorial.css and shared styles define the nine pages, responsive grid, palettes and account layouts.'],
    ['<b>Travel features</b>', 'script.js and js/experience.js handle search, saved places, itinerary steps, clipboard, galleries and interactive feedback.'],
    ['<b>Accounts and forms</b>', 'js/auth.js, js/validation.js and js/forms.js handle local identity, inline rules and enquiry states.'],
    ['<b>Forecast</b>', 'js/weather.js manages requests, checks returned data, handles caching and updates the panel.'],
    ['<b>Assets and verification</b>', 'images/, fonts/ and vendor/ supply local resources. scripts/ and docs/final/ contain the final checks, generator and evidence.'],
], [126, W - 126])
add('Browser and deployment evidence', 'KSection')
matrix = [
    ['Chromium' if browser == 'chromium' else 'Microsoft Edge',
     ', '.join(str(width) for width in sorted({
         item['viewport']['width'] for item in layout_runs if item['browser'] == browser
     })),
     'Nine pages in both themes']
    for browser in sorted({item['browser'] for item in layout_runs})
]
table([['Browser', 'Viewport widths (px)', 'Coverage'], *matrix], [104, 165, W - 269])
layout_count = sum(len(item['layoutChecks']) for item in layout_runs)
add(f'The recorded browser run passed {len(tests["results"])} scenario groups and {layout_count} page, theme and width combinations. The journeys cover keyboard navigation, responsive images, validation, logout, search, saving, clipboard, weather retry and cache.')
if publication:
    count = publication['http']['fileCount']
    commit = publication['sourceCommit']
    add(f'All {count} checked GitHub Pages URLs returned HTTP 200. The nine pages and their assets matched the published source by SHA-256. '
        f'{link("Published website source " + commit[:7], REPO + "/commit/" + commit)}. '
        f'{link("Successful GitHub Pages workflow", publication["workflowUrl"])}.')
else:
    add('This edition records branch checks and local browser results.', 'KSmall')
add('Verification files include ' +
    link('static checks', REPO + '/blob/main/scripts/verify-final.py') + ' | ' +
    link('browser results', REPO + '/blob/main/docs/final/browser-verification.json') + ' | ' +
    link('hosted verification', REPO + '/blob/main/docs/final/http-verification.json'), 'KSmall')

heading('COURSE RUBRIC', 'Requirements and evidence')
add('The course requires at least six connected pages. KZ Travel has nine, including the signup, login and profile flow. The table maps each grading criterion to the relevant pages of this report.')
table([
    ['Criterion', 'Points', 'Evidence in the report'],
    ['Responsiveness', 10, 'Page 4 shows desktop, tablet and phone layouts. Page 9 records both-theme browser checks.'],
    ['Hosting', 5, 'Pages 1 and 9 give the live site, repository, successful deploy and HTTP verification.'],
    ['Light and dark modes', 5, 'Page 4 shows the stylesheet themes, toggle and saved preferences.'],
    ['Design and user experience', 20, 'Pages 2-4 explain the audience, navigation, typography, palette and image choices.'],
    ['Enhanced JavaScript functionality', 25, 'Pages 5-7 cover local authentication, inline validation, search, filtering and saved results.'],
    ['Animated buttons and UI effects', 5, 'Page 7 covers press animation, planner transitions and confirmation feedback.'],
    ['External API integration', 10, 'Page 8 documents the live weather API and its loading, success, retry and cache states.'],
    ['Feature cohesion', 10, 'Pages 2 and 7 connect city discovery, the notebook and route planning to the same trip.'],
    ['Presentation', 5, 'Page 11 covers the 4:45 plan, speakers, demonstration and backups.'],
    ['Code quality and organization', 5, 'Page 9 maps shared files and shows repeatable static, browser and deployment checks.'],
], [172, 55, W - 227])

heading('PRESENTATION AND SUBMISSION', 'A five-minute demonstration')
add('The planned live walkthrough runs for 4:45. Every member presents part of the finished site on GitHub Pages. Backup slides and screenshots support the same sequence if the connection fails.')
table([
    ['Time', 'Presenter', 'What to show'],
    ['0:00-0:30', 'Ramazan', 'Introduce the team, SE-2501, the travel goal and audience.'],
    ['0:30-1:15', 'Ramazan', 'Show desktop, tablet and phone, switch themes and save Almaty from search.'],
    ['1:15-2:45', 'Ziyadinkhan', 'Show inline form errors, create an account, log in and reload the saved Almaty guide on Profile.'],
    ['2:45-4:20', 'Ruzimuhammad', 'Build and copy the two-day route, show UI feedback and switch the live forecast city.'],
    ['4:20-4:45', 'Ramazan', 'Summarize strengths, propose synced saved places and thank the audience.'],
], [86, 100, W - 186])
add('Moodle submission', 'KSection')
add('Every team member uploads these three files together in <b>Final Exam</b> by <b>18 November 2026 at 23:59</b>.')
table([
    ['File', 'Contents'],
    ['KZTravel_SE2501_FinalProject.zip', 'Complete runnable project with the folder structure, scripts, images and backup materials.'],
    ['KZTravel_SE2501_Report.pdf', 'Team, goal, work division, website explanation and screenshots.'],
    ['KZTravel_SE2501_Links.txt', 'Separate links to the GitHub repository and hosted site.'],
], [210, W - 210])
add('References', 'KSection')
add('Course guidance comes from the Final Project Requirements and Final Project Presentation Guidelines. Technical references include ' +
    link('Open-Meteo API', 'https://open-meteo.com/en/docs') + ' | ' +
    link('Web Crypto PBKDF2', 'https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits') + ' | ' +
    link('Local Storage', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage') + '.', 'KSmall')

def footer(canvas,document):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor('#dce0de'));canvas.line(40,34,A4[0]-40,34)
    canvas.setFillColor(MUTED);canvas.setFont(BODY_FONT,7.2);canvas.drawString(40,22,'KZ TRAVEL / FINAL PROJECT / SE-2501');canvas.drawRightString(A4[0]-40,22,str(document.page));canvas.restoreState()
SimpleDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=40,rightMargin=40,topMargin=38,bottomMargin=47,title='KZ Travel - Final Project Report',author='KZ Travel - SE-2501').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
