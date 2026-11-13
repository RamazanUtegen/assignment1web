"""Create the final PDF from actual screenshots, source and verification records."""
from pathlib import Path
from html import escape
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
parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true');args=parser.parse_args()
EVIDENCE=ROOT/'docs/final';SHOTS=EVIDENCE/'screenshots'
publication=json.loads((EVIDENCE/'deployment.json').read_text(encoding='utf-8')) if (EVIDENCE/'deployment.json').is_file() else {}
tests=json.loads((EVIDENCE/'browser-verification.json').read_text(encoding='utf-8'))
assert all(item['status']=='passed' for item in tests['results'])
if not args.draft:
    assert publication.get('workflowConclusion')=='success','Verify publication first.'
    assert all(item['matchesCheckout'] for item in publication['http']['files'])
    live=json.loads((EVIDENCE/'live-browser-verification.json').read_text(encoding='utf-8'))
    assert all(item['status']=='passed' for item in live['results'])
OUTPUT=ROOT/('tmp/pdfs/KZTravel-final-draft.pdf' if args.draft else 'output/final/KZTravel_SE2501_Report.pdf')
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
URL='https://ramazanutegen.github.io/assignment1web/'
REPO='https://github.com/RamazanUtegen/assignment1web'
INK,BLUE,MUTED,WASH=[colors.HexColor(v) for v in ['#172124','#174add','#596366','#f5f5f0']]
for name,filename in [('BodyFont','arial.ttf'),('BoldFont','arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/filename)))
styles=getSampleStyleSheet()
for name,size,leading,font,color in [('KBody',9.5,13.7,'BodyFont',INK),('KSmall',8,11,'BodyFont',MUTED),('KCaption',7.5,10.5,'BodyFont',MUTED),('KHeading',24,28,'BoldFont',INK),('KTitle',36,40,'BoldFont',INK),('KKicker',8,12,'BoldFont',BLUE)]:
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
    result.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8eefc')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,WASH]),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.extend([result,Spacer(1,10)])
def code(file,marker,count):
    lines=(ROOT/file).read_text(encoding='utf-8').splitlines();start=next(i for i,line in enumerate(lines) if marker in line)
    text=[]
    for i in range(start,min(len(lines),start+count)):
        wrapped=textwrap.wrap(lines[i],width=98,replace_whitespace=False,drop_whitespace=False) or ['']
        text.append(f'{i+1:>3} '+wrapped[0]);text.extend('    '+part for part in wrapped[1:])
    add(escape(file)+' - actual source excerpt; long lines wrap.','KCaption')
    story.append(Preformatted('\n'.join(text),styles['KCode']))

add('KZ TRAVEL / SE-2501 / FINAL PROJECT','KKicker')
add('Explore Kazakhstan.<br/>Plan your next chapter.','KTitle')
shot('index-desktop','The final KZ Travel homepage uses the original project photographs and shared navigation.',235)
table([['Team','Members and group'],['KZ Travel','Ramazan Utegen<br/>Ziyadinkhan Kudaibergenuly<br/>Ruzimuhammad<br/><b>SE-2501</b>']],[100,W-100])
add('<b>Project type.</b> Multi-page responsive website. Nine connected pages continue the same team topic and previous assignments.')
add('<b>Goal.</b> Help first-time visitors and students compare Kazakhstan destinations, find route ideas, save places and check local weather before a short trip.')
add(f'<b>Live website:</b> <link href="{URL}" color="#174add">{URL}</link>','KSmall')
add(f'<b>Code repository:</b> <link href="{REPO}" color="#174add">{REPO}</link>','KSmall')
add('Prepared 13 November 2026. '+('Draft layout review; publication verification is pending.' if args.draft else 'Final publication and browser verification are recorded in docs/final/deployment.json.'),'KSmall')

heading('GOAL AND WORK DIVISION','A travel guide with a clear audience')
add('KZ Travel serves first-time visitors, students and travellers planning short Kazakhstan breaks. It covers Aktau, Astana, Almaty and Shymkent. City content, photographs, quick facts and itineraries support destination choice. The notebook, search, route builder and forecast extend that same purpose.')
add('The project uses HTML, shared CSS, Bootstrap, vanilla JavaScript and jQuery. It is hosted on GitHub Pages without a backend. Original page content and photographs are retained; the final version adds local signup, login, profile and a central JavaScript validator.')
add('<b>Recorded work division.</b> The existing page credits and team page establish the original contributions below. Shared final modules are documented separately; individual authorship is not inferred from a presentation role.')
table([['Member','Original contribution recorded in the project','Presentation role'],['Ramazan Utegen','Home and Aktau; initial shared visual theme, destination cards, tables and forms.','Introduction, purpose, responsive design and conclusion.'],['Ziyadinkhan Kudaibergenuly','Astana and Our Story; city itinerary, team profiles, responsive sections and photo journal.','Local account flow and JavaScript validation demonstration.'],['Ruzimuhammad','Almaty and Shymkent; city information, attraction cards, tables, photographs and enquiries.','Search, saved guides, route builder and API demonstration.']],[110,245,W-355])
add('<b>Shared final delivery.</b> Authentication, validation, weather handling, integration and repeatable verification are shared project functionality. Each member should review these modules and rehearse the complete demonstration, regardless of original page ownership.')
add('<b>Design decisions.</b> Large destination photographs establish the travel theme. A consistent blue accent identifies actions, lime highlights feedback, and shared spacing and typography connect the pages. CSS variables provide readable day/night palettes without duplicating layouts. New account pages use the same header, footer, imagery and controls.')

heading('WEBSITE PAGES','Six original pages, still complete')
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
shot('signup','Signup uses the shared travel design. The example details are synthetic test data.',300)
add('The account collection is stored in <b>kz-users-v1</b>. Each account contains contact details and a PBKDF2 password verifier with its own random salt. The plaintext password is never written to localStorage or shown on Profile. Show/Hide buttons change visibility only while entering a password.')
code('js/auth.js','async function passwordHash',9)
add('This is a teaching simulation on one browser origin. LocalStorage can be edited in developer tools and does not provide real server authorisation. The interface asks users to use sample details. HTTPS or localhost is recommended for the account flow.','KSmall')

heading('AUTHENTICATION / LOGIN AND PROFILE','Log in, reload and return')
add('Login checks the normalized email and derives a verifier from the entered password and stored salt. Incorrect credentials produce an inline message. A successful match writes <b>kz-session-v1</b> and redirects to <b>profile.html</b>.')
shot('login-error','Incorrect credentials keep the user on Login and show a friendly message.',160)
shot('profile','Profile displays name, email and phone, plus links to cities saved on this browser.',240)
add('Reloading Profile preserves the local session. Opening it without a valid session redirects to Login. Logout removes the session and returns to Login. A storage-event listener also updates another open profile tab. Saved-city links lead to the existing city guides; empty notebooks include working Explore and Build a route actions.')
add('Saved cities are browser-level preferences and are labelled that way. They are not presented as isolated server-side user data. No booking, message or server account is created.','KSmall')

heading('JAVASCRIPT VALIDATION','Validate values before processing')
add('Every form has <b>novalidate</b>. The project does not use required, pattern, minlength, maxlength, min, max or type="email" as its validation mechanism. Explicit data-rules select JavaScript checks; errors are placed next to fields with aria-invalid and aria-describedby.')
table([['Field / context','JavaScript rule'],['Required values','Reject empty and whitespace-only text; required consent must be checked.'],['Email','Validate address format and reject malformed values; normalize account email case.'],['Phone','Accept 10-15 digits, optional + and common spaces, brackets and hyphens.'],['Account password','8-64 characters with uppercase, lowercase, a digit and a symbol; no spaces.'],['Confirmation','Must match the original password.'],['Enquiry message','10-2,000 characters. Passwords belong to account forms, not travel enquiries.'],['Route planner','Valid destination, traveller name of 1-60 characters, and a 1-3 day duration.']],[130,W-130])
code('js/validation.js',"if (rules.includes('phone')",9)
add('The shared validator is used by both account forms and all four enquiry forms. The planner performs its step-specific checks in JavaScript. Valid enquiries show a spinner, freeze the checked fields and prevent duplicate submission; completion restores controls. The contact dialog keeps keyboard focus within enabled controls.')

heading('DISCOVERY AND PLANNING','Find a place and build a route')
add('jQuery listens to search input, combines text with category or Saved filters, updates the results count and offers keyboard/touch autocomplete. Matches are highlighted by building mark elements from text nodes; regular-expression characters are escaped. FAQ search covers both questions and answers.')
shot('search','A category filter and saved-place state update the real destination cards.',200)
shot('planner','The route builder preserves choices on Back, validates steps and generates a copyable itinerary.',210)
add('A Set tracks saved city IDs and localStorage persists them. Profile renders the same valid IDs as links. Clipboard confirmation appears only after successful copying. Galleries retain previous/next controls, keyboard handling and thumbnails. Ratings and theme preferences persist locally.')

heading('EXTERNAL API','Weather that fits the travel topic')
add('Open-Meteo supplies current conditions and a three-day outlook for the four guide cities. The browser uses fetch and async/await, checks HTTP status, parses JSON and rejects incomplete numeric values. No API key or user geolocation is needed.')
shot('weather-real','Actual Open-Meteo data captured in the browser; weather changes over time.',245)
code('js/weather.js','const response = await fetch',8)
add('The forecast loads near the viewport. Users can choose another city or refresh it. Loading and error states are visible. A 10-second timeout restores controls; superseded requests are aborted and a request counter prevents stale results from replacing a newer city.')
add('A fresh cache avoids repeat requests for 10 minutes. If an update fails, a clearly dated saved forecast up to 24 hours old may be shown. Expired or corrupt data is ignored. Without usable data the page offers retry and never fabricates a forecast. Source attribution and CC BY 4.0 are shown in the UI.')

heading('RESPONSIVENESS AND THEMES','One interface across screen sizes')
add('Bootstrap, Flexbox and CSS Grid adapt navigation, cards, the weather panel and account pages. The navbar collapses below 1200 px to leave room for the account action on tablets. Text and user details wrap; layouts stack on phones.')
row=[[picture('signup-mobile',230,180),picture('profile-night',230,320)],[p('Phone signup view.','KCaption'),p('Profile in the saved night theme.','KCaption')]]
t=Table(row,colWidths=[185,W-185]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story.append(t)
table([['Browser','Desktop','Tablet','Phone'],['Chromium','1440 x 1000','1024 x 900','390 x 844'],['Microsoft Edge','1440 x 1000','1024 x 900','390 x 844']],[120,(W-120)/3,(W-120)/3,(W-120)/3])
add('The same theme toggle updates shared CSS variables and saves the selected mode. Tests switch to night on Profile and verify it remains on Login and other pages. Error messages, controls and panels remain readable in both modes. Account details use overflow wrapping so long values do not break columns.')
add('Reduced-motion preference removes unnecessary transitions and counter movement. Skip links, field labels, inline error descriptions, menu Escape, dialog focus management and accessible status messages support keyboard use. Without JavaScript, city content, navigation, photographs and FAQ answers remain available; account pages explain that JavaScript is needed.')

heading('UI EFFECTS AND ORGANIZATION','Keep feedback useful and code readable')
add('Hover and press effects identify clickable actions. Counters animate once when entering view. Toasts fade after save/copy actions, and duplicate timers are cancelled. Submit spinners communicate processing and prevent repeated clicks. Optional sound starts only after a user action. No button exists solely as decoration.')
table([['File / folder','Responsibility'],['index.html, city HTML, about.html','Travel content, connected navigation, structured sections and images.'],['signup.html, login.html, profile.html','Account and notebook pages that reuse the shared design.'],['js/validation.js and js/forms.js','Explicit validation and enquiry completion.'],['js/auth.js','Account storage, salted verifier, session, profile and logout.'],['script.js','jQuery search, highlights, notification, clipboard, spinner and lazy images.'],['js/experience.js','Route planner, theme, saved cities, ratings and Web Audio.'],['js/weather.js','API, response validation, cache and forecast states.'],['css/, images/, fonts/, vendor/','Shared presentation, original photos and local dependencies.'],['scripts/ and docs/final/','Repeatable checks, report/package builders and presentation backups.']],[170,W-170])
add('Complex sections include comments explaining password verification, stale-request guards and callbacks. The clean submission preserves folder structure and excludes Git history, temporary files and earlier submission archives.')

heading('VERIFICATION AND PUBLICATION','Check the user journeys, then publish')
add('Static verification checks nine connected pages, resources and fragments, unique IDs, labels, jQuery integrity and the prohibition on native validation constraints. Browser journeys run in Chromium and Edge at three sizes.')
for text in [
 'Registration: required fields, invalid email/phone, weak and mismatched passwords, duplicate email and no plaintext password persistence.',
 'Authentication: wrong credentials, successful redirect, profile details, reload persistence, logout and another open profile tab.',
 'Travel features: combined search/filter, autocomplete, safe FAQ matching, saved guides in Profile, planner, real clipboard text, carousel and ratings.',
 'Enquiries: inline validation on all city/contact forms, correct phone patterns, frozen values and duplicate-submit rejection.',
 'Resilience: denied storage restores controls, CDN fallback works, no-JavaScript explanations remain readable, and real weather renders in both themes.'
]:add('- '+text)
add('<b>Local browser result.</b> '+str(len(tests['results']))+' scenario groups passed; JavaScript exceptions and unexpected HTTP failures were not recorded in the main journeys.')
if publication:
    add('<b>Website source:</b> '+escape(publication['sourceCommit']),'KSmall')
    add('<b>Published assets:</b> '+str(publication['http']['fileCount'])+' HTML/resources returned HTTP 200 and matched the checkout.','KSmall')
    workflow=publication['workflowUrl'];add(f'<b>GitHub Pages:</b> <link href="{workflow}" color="#174add">successful workflow</link>.','KSmall')
else:add('Publication verification will be inserted after the final code is deployed.','KSmall')
add('Evidence: docs/final/browser-verification.json, live-browser-verification.json and deployment.json. The source, screenshots and test scripts allow the team to reproduce the demonstrations.','KSmall')
add('Limitations: accounts are browser-local simulations; enquiries do not send data; external forecasts depend on API availability and may differ from conditions in mountains or deserts. Future work would add a backend, server authentication and personal saved routes.')

heading('SUBMISSION AND PRESENTATION','Three files and a rehearsed demonstration')
add('Every team member submits all three files together in the Final Exam folder:')
for name in ['KZTravel_SE2501_FinalProject.zip','KZTravel_SE2501_Report.pdf','KZTravel_SE2501_Links.txt']:add(escape(name),'KSmall')
add('The report uses PDF, as explicitly required. The guideline contains a conflicting DOCX example, but its format rule and penalty list reject DOCX. The TXT file lists the live website and repository separately.')
table([['Time','Speaker','Focus'],['0:00-0:30','Ramazan','Team, topic, goal and audience'],['0:30-1:15','Ramazan','Design, responsive layout and themes'],['1:15-2:05','Ziyadinkhan','Signup, login and profile'],['2:05-2:45','Ziyadinkhan','JavaScript validation'],['2:45-3:35','Ruzimuhammad','Search, saves and route builder'],['3:35-4:20','Ruzimuhammad','Real weather API'],['4:20-4:45','Ramazan','Strengths, future work and thanks']],[85,105,W-190])
add('The presentation script targets 4:45. Each member speaks or demonstrates. Rehearse with a stopwatch; the timing is a plan, not a claim that rehearsal has already happened. Show the final product rather than editing code live. Screenshots and slide backups are available if connectivity fails.')
add('<b>Deadline supplied by the assignment:</b> 18 November 2026, 23:59. Verify the LMS display and submit by the deadline. The stated cutoff is nine hours later.','KSmall')
add('<b>References and attribution.</b> Final Project Requirements.pdf and Final Project Presentation Guideline.pdf supplied by the team; official Open-Meteo API documentation; MDN Web Crypto and Local Storage documentation. Bootstrap, jQuery and font licence files remain in the project. Original project photographs are preserved.','KSmall')
for label,url in [('Open-Meteo API','https://open-meteo.com/en/docs'),('Web Crypto PBKDF2','https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits'),('Local Storage','https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage')]:add(f'<link href="{url}" color="#174add">{label}</link>','KSmall')

def footer(canvas,document):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor('#dce0de'));canvas.line(40,34,A4[0]-40,34)
    canvas.setFillColor(MUTED);canvas.setFont('BodyFont',7.2);canvas.drawString(40,22,'KZ TRAVEL / FINAL PROJECT / SE-2501');canvas.drawRightString(A4[0]-40,22,str(document.page));canvas.restoreState()
SimpleDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=40,rightMargin=40,topMargin=38,bottomMargin=47,title='KZ Travel - Final Project Report',author='KZ Travel - SE-2501').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
