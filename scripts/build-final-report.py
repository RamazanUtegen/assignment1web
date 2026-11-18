"""Create the final PDF from actual screenshots, source and verification records."""
from pathlib import Path
from html import escape
from hashlib import sha256
import argparse
import json
import textwrap
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,Table,TableStyle,PageBreak,Preformatted

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
styles=getSampleStyleSheet()
for name,size,leading,font,color in [('KBody',10,14,BODY_FONT,INK),('KSmall',8.5,11.8,BODY_FONT,MUTED),('KCaption',8,11,BODY_FONT,MUTED),('KHeading',24,28,BOLD_FONT,INK),('KTitle',36,40,BOLD_FONT,INK),('KKicker',8,12,BOLD_FONT,ACCENT)]:
    styles.add(ParagraphStyle(name=name,fontName=font,fontSize=size,leading=leading,textColor=color,spaceAfter=8))
styles.add(ParagraphStyle(name='KCode',fontName='Courier',fontSize=7.2,leading=9.6,textColor=INK,backColor=WASH,borderPadding=10,spaceAfter=14))
W=A4[0]-80;story=[]
def p(text,style='KBody'):return Paragraph(text,styles[style])
def add(text,style='KBody'):story.append(p(text,style))
def heading(kicker,title):
    story.append(PageBreak());add('KZ TRAVEL / '+kicker,'KKicker');add(title,'KHeading')
def picture(name,max_h=220,max_w=W):
    path=SHOTS/(name+'.png')
    with PILImage.open(path) as image: scale=min(max_w/image.width,max_h/image.height);w,h=image.width*scale,image.height*scale
    result=Image(str(path),width=w,height=h);result.hAlign='CENTER';return result
def shot(name,caption,max_h=220):story.extend([picture(name,max_h),Spacer(1,4),p(caption,'KCaption')])
def table(rows,widths=None):
    data=[[p(str(cell),'KSmall') for cell in row] for row in rows]
    result=Table(data,colWidths=widths or [W/len(rows[0])]*len(rows[0]),repeatRows=1,hAlign='LEFT')
    result.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e0efe6')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,WASH]),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.extend([result,Spacer(1,10)])
def code(file,marker,count):
    lines=(ROOT/file).read_text(encoding='utf-8').splitlines();start=next(i for i,line in enumerate(lines) if marker in line)
    text=[]
    for i in range(start,min(len(lines),start+count)):
        wrapped=textwrap.wrap(lines[i],width=98,replace_whitespace=False,drop_whitespace=False) or ['']
        text.append(f'{i+1:>3} '+wrapped[0]);text.extend('    '+part for part in wrapped[1:])
    add(escape(file)+' - actual source excerpt; long lines wrap.','KCaption')
    story.append(Preformatted('\n'.join(text),styles['KCode']))

add('KZ TRAVEL / SE-2501 / FINAL PROJECT','KKicker')
add('Destinations in Kazakhstan','KTitle')
shot('index-desktop','The river valley and city directory on the redesigned homepage.',275)
table([['Team','Members and group'],['KZ Travel','Ramazan Utegen<br/>Ziyadinkhan Kudaibergenuly<br/>Ruzimuhammad<br/><b>SE-2501</b>']],[100,W-100])
add('<b>Project type.</b> Multi-page responsive website. Nine connected pages continue the same team topic and previous assignments.')
add('<b>Goal.</b> Help first-time visitors and students compare Kazakhstan destinations, find route ideas, save places and check local weather before a short trip.')
add(f'<b>Live website</b> <link href="{URL}" color="#164d3c">{URL}</link>','KSmall')
add(f'<b>Code repository</b> <link href="{REPO}" color="#164d3c">{REPO}</link>','KSmall')
add('18 November 2026. '+('Design branch review edition. Publication verification follows team approval.' if review else 'GitHub Pages source and asset verification are recorded in docs/final/deployment.json.'),'KSmall')

heading('GOAL AND WORK DIVISION','A travel guide with a clear audience')
add('KZ Travel serves first-time visitors, students and travellers planning short Kazakhstan breaks. It covers Aktau, Astana, Almaty and Shymkent. City content, photographs, quick facts and itineraries support destination choice. The notebook, search, route builder and forecast extend that same purpose.')
add('The site uses HTML, shared CSS, Bootstrap, vanilla JavaScript and jQuery. GitHub Pages serves the site and the browser runs the account and itinerary features.')
add('The page credits and Our Story page document the original work division. The rehearsal roles are shown alongside those contributions.')
table([['Member','Original contribution recorded in the project','Presentation role'],['Ramazan Utegen','Home and Aktau; initial shared visual theme, destination cards, tables and forms.','Introduction, purpose, responsive design and conclusion.'],['Ziyadinkhan Kudaibergenuly','Astana and Our Story; city itinerary, team profiles, responsive sections and photo journal.','Local account flow and JavaScript validation demonstration.'],['Ruzimuhammad','Almaty and Shymkent; city information, attraction cards, tables, photographs and enquiries.','Search, saved guides, route builder and API demonstration.']],[110,245,W-355])
add('<b>Shared final delivery.</b> Authentication, validation, weather handling, integration and repeatable verification are shared project functionality. Each member should review these modules and rehearse the complete demonstration, regardless of original page ownership.')
add('The homepage uses a wide valley photo and a portrait crop that keeps the river in view on phones. Search and filters lead into a two-column city directory that stacks on phones. Each guide starts with a location-specific photo. The account pages use a shorter header and put the form or saved places first. Locally hosted DM Sans, white and slate surfaces, and pine-green controls tie the pages together.')
add('The photography and centered homepage composition draw on <link href="https://www.visitfinland.com/en/places-to-go/" color="#164d3c">Visit Finland’s Places to go page</link>.','KSmall')

heading('WEBSITE PAGES','The city guides and Our Story')
cards=[('index-desktop','Home','Destination search and filters, FAQ, gallery, weather, three-step planner and links to the notebook.'),('aktau-desktop','Aktau','Mangystau landscapes, sights, gallery, three-day excursion, local forecast and validated enquiry.'),('astana-desktop','Astana','Capital architecture, places to visit, gallery, itinerary and city forecast.'),('almaty-desktop','Almaty','City and mountain attractions, photograph gallery, sample itinerary, forecast and enquiry.'),('shymkent-desktop','Shymkent','Southern culture, parks and food, photo gallery, itinerary, forecast and enquiry.'),('about-desktop','Our Story','Team members, project purpose, photo journal and keyboard-accessible contact dialog.')]
grid=[]
for i in range(0,len(cards),2):
    row=[]
    for image,title,description in cards[i:i+2]:row.append([picture(image,130,(W-24)/2),p('<b>'+title+'</b>','KBody'),p(description,'KSmall')])
    grid.append(row)
t=Table(grid,colWidths=[W/2,W/2]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),14)]));story.append(t)
add('Sign Up, Log In and Profile add three connected pages, giving nine in total. The public navigation leads to Login, Login links to Signup, and successful authentication opens Profile.','KSmall')

heading('AUTHENTICATION / SIGN UP','Create a local travel notebook')
add('The Signup page collects name, email, phone, password and confirmation. It validates values before writing account data to localStorage. Duplicate emails are rejected after normalization. A successful registration opens Login with a confirmation message.')
shot('signup','Sign Up on desktop with sample details.',320)
add('The account collection is stored in <b>kz-users-v1</b>. Each record contains contact details and a PBKDF2 password verifier with its own random salt. Show and Hide control visibility while entering a password.')
code('js/auth.js','async function passwordHash',9)
add('The browser runs the classroom simulation. Use sample account details on localhost or the hosted HTTPS site.','KSmall')

heading('AUTHENTICATION / LOGIN AND PROFILE','Log in, reload and return')
add('Login checks the normalized email and derives a verifier from the entered password and stored salt. Incorrect credentials produce an inline message. A successful match writes <b>kz-session-v1</b> and redirects to <b>profile.html</b>.')
shot('login-error','Log In shows a message beside the credentials when they are incorrect.',190)
shot('profile','Profile shows the saved Almaty guide and the sample contact details.',245)
add('Reloading Profile preserves the local session. Opening it without a valid session redirects to Login. Logout removes the session and returns to Login. A storage-event listener also updates another open profile tab. Saved-city links lead to the existing city guides; empty notebooks include working Explore and Build a route actions.')
add('Saved cities are shared by accounts on the same browser and site origin. The notebook is a local planning tool.','KSmall')

heading('JAVASCRIPT VALIDATION','Validate values before processing')
add('Every form has <b>novalidate</b>. JavaScript checks fields and consent according to their purpose. Inline errors identify the field with aria-invalid and associate the message with aria-describedby.')
table([['Field or form','JavaScript rule'],['Required values','Reject empty and whitespace-only text. Check consent when the form requests it.'],['Email','Validate the address format and normalize account email case.'],['Phone','Accept 10–15 digits, optional + and common spaces, brackets and hyphens.'],['Account password','8–64 characters with uppercase, lowercase, a digit and a symbol, without spaces.'],['Confirmation','Must match the original password.'],['Enquiry message','10–2,000 characters.'],['Route planner','A valid destination, a 1–60 character traveller name and a 1–3 day duration.']],[130,W-130])
code('js/validation.js',"if (rules.includes('phone')",9)
add('Both account forms and all four enquiry forms use the shared validator. The planner shows the required message alongside each field or radio group. Valid enquiries show a spinner and lock fields during processing. The contact dialog keeps keyboard focus within enabled controls.')

heading('DISCOVERY AND PLANNING','Find a place and build a route')
add('jQuery listens to search input, combines text with category or Saved filters, updates the results count and offers keyboard/touch autocomplete. Matches are highlighted by building mark elements from text nodes; regular-expression characters are escaped. FAQ search covers both questions and answers.')
shot('search','Search, the Saved filter and the confirmation on the Almaty card.',200)
shot('planner','A two-day Almaty itinerary with a clipboard control.',225)
add('A Set tracks saved city IDs and localStorage persists them. Profile renders the same valid IDs as links. Clipboard confirmation appears only after successful copying. Galleries retain previous/next controls, keyboard handling and thumbnails. Ratings and theme preferences persist locally.')

heading('EXTERNAL API','Weather that fits the travel topic')
add('Open-Meteo supplies current conditions and a three-day outlook for the four guide cities. The browser uses fetch and async/await, checks HTTP status, parses JSON and rejects incomplete numeric values. No API key or user geolocation is needed.')
live_weather=any('real Open-Meteo' in scenario for result in tests['results'] for scenario in result['scenarios'])
if live_weather:
    shot('weather-real','Open-Meteo forecast captured live. Forecasts change over time.',245)
else:
    shot('weather-fixture','Browser test using a forecast fixture.',245)
code('js/weather.js','const response = await fetch',8)
add('The forecast loads near the viewport. Users can choose another city or refresh it. Loading and error states are visible. A 10-second timeout restores controls; superseded requests are aborted and a request counter prevents stale results from replacing a newer city.')
add('A fresh cache avoids repeat requests for 10 minutes. If an update fails, a clearly dated saved forecast up to 24 hours old may be shown. Expired or corrupt data is ignored. Without usable data the page offers retry and never fabricates a forecast. Source attribution and CC BY 4.0 are shown in the UI.')

heading('RESPONSIVENESS AND THEMES','One interface across screen sizes')
add('Bootstrap, Flexbox and CSS Grid adapt navigation, cards, the weather panel and account pages. The navbar collapses below 1200 px to leave room for the account action on tablets. Text and user details wrap; layouts stack on phones.')
row=[[picture('index-mobile',260,155),picture('destinations-desktop-night',240,325)],[p('Home at 390 px with the portrait crop.','KCaption'),p('City discovery in the night theme.','KCaption')]]
t=Table(row,colWidths=[185,W-185]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story.append(t)
matrix = [
    [browser, ', '.join(str(width) for width in sorted({
        item['viewport']['width'] for item in layout_runs if item['browser']==browser
    })), '9 pages in day and night']
    for browser in sorted({item['browser'] for item in layout_runs})
]
table([['Browser','Widths in px','Pages and themes'],*matrix],[100,195,W-295])
add('The same theme toggle updates shared CSS variables and saves the selected mode. Tests switch to night on Profile and verify it remains on Login and other pages. Error messages, controls and panels remain readable in both modes. Account details use overflow wrapping so long values do not break columns.')
add('Reduced-motion preference removes unnecessary transitions and counter movement. Skip links, field labels, inline error descriptions, menu Escape, dialog focus management and accessible status messages support keyboard use. Without JavaScript, city content, navigation, photographs and FAQ answers remain available; account pages explain that JavaScript is needed.')

heading('UI EFFECTS AND ORGANIZATION','Keep feedback useful and code readable')
add('Buttons scale slightly on a 120 ms press. Save feedback and planner steps use a 180 ms ease-out. Search and keyboard focus respond immediately. Reduced motion keeps state, text and colour feedback. The reading progress bar and counters support longer guide pages. Optional sound starts after a user turns it on.')
add('Motion reference <link href="https://emilkowal.ski/ui/7-practical-animation-tips" color="#164d3c">Emil Kowalski’s 7 Practical Animation Tips</link>.','KSmall')
table([['File / folder','Responsibility'],['index.html, city HTML, about.html','Travel content, connected navigation, structured sections and images.'],['signup.html, login.html, profile.html','Account and notebook pages that reuse the shared design.'],['js/validation.js and js/forms.js','Explicit validation and enquiry completion.'],['js/auth.js','Account storage, salted verifier, session, profile and logout.'],['script.js','jQuery search, highlights, notification, clipboard, spinner and lazy images.'],['js/experience.js','Route planner, theme, saved cities, ratings and Web Audio.'],['js/weather.js','API, response validation, cache and forecast states.'],['css/, images/, fonts/, vendor/','Shared presentation, original photos and local dependencies.'],['scripts/ and docs/final/','Repeatable checks, report/package builders and presentation backups.']],[170,W-170])
add('Complex sections include comments explaining password verification, stale-request guards and callbacks. The clean submission preserves folder structure and excludes Git history, temporary files and earlier submission archives.')

heading('VERIFICATION AND PUBLICATION','Check the user journeys, then publish')
add('Static checks cover nine connected pages, internal links and fragments, responsive image variants, unique IDs, form validation and jQuery integrity. Browser checks cover the nine pages in both themes at 390, 768, 1024 and 1440 px.')
for text in [
 'Registration: required fields, invalid email/phone, weak and mismatched passwords, duplicate email and no plaintext password persistence.',
 'Authentication: wrong credentials, successful redirect, profile details, reload persistence, logout and another open profile tab.',
 'Travel journey. Find Almaty, save it before registration, confirm it on Profile after reload, copy a two-day route and view its forecast.',
 'Enquiries. Check inline messages, accepted phone formats, locked fields and duplicate submission.',
 'Weather. Recover with Retry after an HTTP error. Reuse a fresh cache on reload and show a dated forecast after a failed refresh.',
 'Fallbacks. Keep controls usable if storage is denied, use the bundled jQuery when the CDN fails and make guide content readable with JavaScript disabled.'
]:add('- '+text)
add(f"{len(tests['results'])} browser scenario groups passed. The layout runs covered {sum(len(item['layoutChecks']) for item in layout_runs)} page, theme and width combinations across the tested browsers.")
if publication:
    add('<b>Website source:</b> '+escape(publication['sourceCommit']),'KSmall')
    add('<b>Published assets:</b> '+str(publication['http']['fileCount'])+' HTML/resources returned HTTP 200 and matched the checkout.','KSmall')
    workflow=publication['workflowUrl'];add(f'<b>GitHub Pages</b> <link href="{workflow}" color="#164d3c">successful workflow</link>.','KSmall')
else:add('The verified Design branch is ready for team review. The GitHub Pages check follows approval and deployment.','KSmall')
add('The browser results and screenshots are in docs/final. The rubric map links the evidence to each criterion.','KSmall')
add('A future improvement is a server-backed notebook that syncs saved cities and trips between devices.')

heading('SUBMISSION AND PRESENTATION','Three files and a rehearsed demonstration')
add('Every team member submits all three files together in the Final Exam folder:')
for name in ['KZTravel_SE2501_FinalProject.zip','KZTravel_SE2501_Report.pdf','KZTravel_SE2501_Links.txt']:add(escape(name),'KSmall')
add('The TXT file lists the live website and repository on separate lines.')
table([['Time','Speaker','Focus'],['0:00–0:30','Ramazan','Team, goal and audience'],['0:30–1:15','Ramazan','Responsive design, both themes and saving Almaty'],['1:15–2:00','Ziyadinkhan','Inline validation and registration'],['2:00–2:45','Ziyadinkhan','Log in, find Almaty on Profile and reload'],['2:45–3:35','Ruzimuhammad','Build and copy a two-day route, motion feedback'],['3:35–4:20','Ruzimuhammad','Live weather, cache and retry'],['4:20–4:45','Ramazan','Future improvement, links and close']],[85,105,W-190])
add('The timed script and backup screenshots support the 4:45 product demonstration. Each participant presents their assigned portion.')
add('<b>Moodle deadline</b> 18 November 2026 at 23:59.','KSmall')
add('Course sources are the Final Project Requirements and Final Project Presentation Guideline PDFs. The project includes the font and library licences.','KSmall')
for label,url in [('Open-Meteo API','https://open-meteo.com/en/docs'),('Web Crypto PBKDF2','https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits'),('Local Storage','https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage')]:add(f'<link href="{url}" color="#164d3c">{label}</link>','KSmall')

def footer(canvas,document):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor('#dce0de'));canvas.line(40,34,A4[0]-40,34)
    canvas.setFillColor(MUTED);canvas.setFont(BODY_FONT,7.2);canvas.drawString(40,22,'KZ TRAVEL / FINAL PROJECT / SE-2501');canvas.drawRightString(A4[0]-40,22,str(document.page));canvas.restoreState()
SimpleDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=40,rightMargin=40,topMargin=38,bottomMargin=47,title='KZ Travel - Final Project Report',author='KZ Travel - SE-2501').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
