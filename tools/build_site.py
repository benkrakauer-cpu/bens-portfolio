#!/usr/bin/env python3
"""Generate src/index.html and per-app detail pages from one data model.

An app with a non-empty `subtiles` list becomes a LINK tile on the home page
(clicking it opens its detail page) and gets a generated detail page. An app
with no subtiles stays an accordion tile (story + live links) — the pre-drill-down
behavior — so the site keeps working while detail pages are built out.

Run:  python3 tools/build_site.py
"""
import os, html

SRC = os.path.join(os.path.dirname(__file__), '..', 'src')

# ---- extern-link + chevron snippets (match existing markup) --------------
EXT = ('<svg class="ext" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">'
       '<path d="M6 3h7v7M13 3L6.5 9.5M11 9v4H3V5h4" fill="none" stroke="currentColor" '
       'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')
CHEV_R = ('<svg class="chev-r" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">'
          '<path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.7" '
          'stroke-linecap="round" stroke-linejoin="round"/></svg>')

def links_html(links):
    parts = []
    for i, l in enumerate(links):
        if i: parts.append('<span class="link-sep" aria-hidden="true">·</span>')
        note = f'<span class="link-note">{l["note"]}</span>' if l.get('note') else ''
        parts.append(f'<a href="{l["href"]}" target="_blank" rel="noopener noreferrer">{l["label"]}{EXT}</a>{note}')
    return ''.join(parts)

# ---- data model ----------------------------------------------------------
# Each app: slug, kicker, headline, oneliner, home_image, home_alt, story,
#           links[], tagline (detail header), subtiles[]
# subtile: img, alt, title, desc (html ok), pdf?(str), kind?(badge str)
def T(img, alt, title, desc, pdf=None, kind=None):
    return {'img': img, 'alt': alt, 'title': title, 'desc': desc, 'pdf': pdf, 'kind': kind}

APPS = [
 {
  'slug':'hazard-intelligence','kicker':'Hazard Intelligence',
  'headline':'One live picture of every hazard facing the city',
  'oneliner':"A situational dashboard that unifies the city's real-time hazard feeds and daily briefings.",
  'home_image':'assets/images/hazardintel.webp',
  'home_alt':'NYCEM Hazard Intelligence — real-time situational dashboard',
  'story':("When a storm, heat wave, or blackout hits, the operating picture is scattered across a dozen agencies and feeds. "
    "This tool pulls them into one place — weather and street flooding, the power grid, travel times, air quality, and coastal and climate signals — "
    "as a live situational dashboard backed by automated daily briefings. A companion admin console runs the pipeline behind it: what gets generated, "
    "when each product sends, and to whom. Built serverless on AWS, with scheduled collectors polling NWS, NYISO, Con Edison / PSEG-LI, NYC DOT, and AirNow."),
  'links':[{'href':'https://inteldash.benjaminkrakauer.com','label':'inteldash.benjaminkrakauer.com','note':'dashboard'},
           {'href':'https://hazardintel.benjaminkrakauer.com','label':'hazardintel.benjaminkrakauer.com','note':'admin console'}],
  'tagline':("A real-time situational dashboard and an operations console that pull the city's hazard feeds — weather, flooding, the power grid, "
    "travel, and air quality — into one place, and turn them into scheduled briefings. A tour of the screens, the PDF products, and the admin side that runs it."),
  'subtiles':[
    T('assets/hazard/hz-dashboard.webp','Situational dashboard','Situational Dashboard',
      "The at-a-glance operating picture: the day's briefing products, the active hazard outlook, and a five-day forecast on one screen. It auto-refreshes every 90 seconds from live feeds — NWS, NYISO, Con&nbsp;Edison / PSEG-LI, NYC&nbsp;DOT, and AirNow — and serves as the landing view for the whole tool."),
    T('assets/hazard/hz-alerts.webp','Real-time hazard alerts','Real-Time Hazard Alerts',
      "A live board of active disruptions — power outages, transit and ferry suspensions, air-quality and weather advisories, and IPAWS/WEA messages. Each card is produced by a real-time collector that polls its source on a fixed interval and flags anything that crosses a defined threshold."),
    T('assets/hazard/hz-grid.webp','Power grid and outages','Power Grid &amp; Outages',
      "A focused view of electric-grid conditions: Con&nbsp;Edison and PSEG-LI customer outages by borough, an outages-over-time chart, and NYISO system load versus forecast. It's assembled from utility outage feeds and the NYISO real-time load API."),
    T('assets/hazard/hz-briefing.webp','Hazard briefing PDF','Morning Daily Briefing <span aria-hidden="true">·</span> PDF product',
      'The flagship output: a multi-page PDF covering today\'s posture, the seven-day hazard outlook, current conditions, active products, and national-center outlooks. It\'s generated on a schedule by a Lambda that composes the synthesis prose on AWS&nbsp;Bedrock and renders the document; the dashboard links straight to the day\'s file. <a href="assets/hazard/morning-daily-briefing.pdf" target="_blank" rel="noopener">Open the PDF →</a>',
      pdf='assets/hazard/morning-daily-briefing.pdf', kind='PDF'),
    T('assets/hazard/hz-admin-status.webp','Admin system status','Admin — System Status &amp; Control',
      "The operator's home screen: pipeline state (enabled / send mode), the last and next scheduled runs, recently fired products, and per-product schedules. It's the control panel that governs what the tool generates and when."),
    T('assets/hazard/hz-admin-generation.webp','Admin generation','Admin — Generation',
      "On-demand generation: build and send any product immediately, regenerate a briefing, or target specific products to specific people. This is where an operator compiles something outside the normal schedule and reviews it before it goes out."),
    T('assets/hazard/hz-admin-alerts.webp','Admin alerts engine','Admin — Alerts Engine',
      "The configuration behind the real-time alerts: the engine mode, its thresholds, and the running list of conditions it watches — outages, service suspensions, air quality, seismic events, and IPAWS/WEA. It decides which real-world events rise to the level of an alert."),
    T('assets/hazard/hz-admin-distribution.webp','Admin distribution','Admin — Distribution',
      "The recipient and subscription manager: who receives which products, on what schedule (6&nbsp;AM / 4&nbsp;PM / instant), and through which channel. Subscriptions are toggled per person and per product, so a briefing only reaches the people who need it."),
    T('assets/hazard/hz-admin-grid.webp','Admin grid conditions','Admin — Grid Conditions &amp; Reports',
      "The grid product tab: real-time NYISO electricity load with today's curve against forecast, plus a downloadable grid-conditions PDF and email send. It turns the raw load and outage feeds into a shareable operational report."),
    T('assets/hazard/hz-admin-history.webp','Admin activity log','Admin — Activity Log &amp; History',
      "A full audit trail of every product generated and sent — name, timestamp, recipients, and status. It gives operators a record of exactly what went out, to whom, and when, and supports backfilling missed runs from the logs."),
  ],
 },
 {
  'slug':'iad','kicker':'IAD 2.0 — Interagency Directory',
  'headline':'Knowing who to call, before you need to call them',
  'oneliner':'A contact and agency directory for NYC Emergency Management, with a self-service update portal.',
  'home_image':'assets/images/iad.webp',
  'home_alt':'IAD 2.0 — interagency directory dashboard for NYC Emergency Management',
  'story':("In an emergency, the bottleneck is often simply reaching the right person at the right agency. IAD 2.0 is a structured interagency "
    "directory built for NYCEM, paired with a self-service portal that lets agencies keep their own contact records current — so the directory "
    "stays accurate without a central team chasing updates."),
  'links':[{'href':'https://iad.benjaminkrakauer.com','label':'iad.benjaminkrakauer.com','note':None},
           {'href':'https://update.iad.benjaminkrakauer.com','label':'update.iad.benjaminkrakauer.com','note':None}],
  'tagline':'',
  'subtiles':[],
 },
 {
  'slug':'procurement','kicker':'Procurement Agent',
  'headline':'Guiding staff through emergency procurement, step by step',
  'oneliner':'An internal NYCEM tool that helps staff draft compliant procurement documents.',
  'home_image':'assets/images/procurement.webp',
  'home_alt':'Procurement Agent — internal NYCEM procurement drafting tool',
  'story':("Emergency procurement is fast, high-stakes, and rule-bound — a hard combination for staff who don't do it daily. This internal prototype "
    "walks users through generating the documents an emergency procurement package needs, from vendor solicitation covers to scopes of work, with a "
    "shared review workflow and a built-in method evaluator that helps pick the right procurement path. It draws on live NYC data sources (M/WBE, "
    "Checkbook NYC) and is built on Bedrock, Lambda, API Gateway, and DynamoDB."),
  'links':[{'href':'https://procurementagent.benjaminkrakauer.com','label':'procurementagent.benjaminkrakauer.com','note':'internal NYCEM tool'}],
  'tagline':'','subtiles':[],
 },
 {
  'slug':'emergency-plan','kicker':'NYC Emergency Plan Assistant',
  'headline':'Multilingual, agentic emergency preparedness — for every New Yorker',
  'oneliner':'A conversational tool that builds a personalized household emergency plan in your language.',
  'home_image':'assets/images/emergencyplan.webp',
  'home_alt':'NYC Emergency Plan Assistant — conversational preparedness interface',
  'story':("Most emergency-preparedness guidance is a static PDF almost nobody reads. This tool replaces it with a guided conversation: it asks about "
    "your household, housing, and needs, then generates a personalized, downloadable emergency plan. It works in dozens of languages — with the "
    "interface, the conversation, and the final PDF all translated, including right-to-left rendering for Arabic, Hebrew, and Urdu. Built on a "
    "React/TypeScript front end with an AWS Lambda + Bedrock back end, with prompt caching for fast, low-cost responses."),
  'links':[{'href':'https://emergencyplanagent.benjaminkrakauer.com','label':'emergencyplanagent.benjaminkrakauer.com','note':None}],
  'tagline':'','subtiles':[],
 },
 {
  'slug':'document-translation','kicker':'Document Translation Service',
  'headline':'Send a document, get it back translated',
  'oneliner':'An email- and web-based service that translates documents and returns a clean PDF.',
  'home_image':'assets/images/translate.webp',
  'home_alt':'Document Translation Service — upload and email translation',
  'story':("A lightweight translation service designed for real documents, not just text snippets. Send a file by email or upload it on the web, and it "
    "returns a formatted PDF in the target language — with currency conversion handled inline for invoices and financial documents. Built entirely "
    "serverless on Bedrock and Lambda, with cost tracking baked in."),
  'links':[{'href':'https://translate.benjaminkrakauer.com','label':'translate.benjaminkrakauer.com','note':None}],
  'tagline':'','subtiles':[],
 },
 {
  'slug':'travelreceipt','kicker':'TravelReceipt',
  'headline':'Turn a foreign receipt into something you can actually file',
  'oneliner':'Upload a receipt or invoice; get a translated PDF with currency conversion by email.',
  'home_image':'assets/images/travelreceipt.webp',
  'home_alt':'TravelReceipt — translate a receipt and convert its currency',
  'story':("A small, public-facing product for anyone dealing with receipts in another language and currency — travelers, expense filers, small "
    "businesses. Upload the receipt and it emails back a translated PDF with the amounts converted. A focused consumer application built on the same "
    "serverless translation foundation, with a production payment flow."),
  'links':[{'href':'https://travelreceipt.com','label':'travelreceipt.com','note':None}],
  'tagline':'','subtiles':[],
 },
 {
  'slug':'snowcorps','kicker':'SnowCorps',
  'headline':'Coordinating snow-clearing labor across the city',
  'oneliner':'A worker-and-admin platform for managing paid snow-removal at the intersection level.',
  'home_image':'assets/images/snowcorps.webp',
  'home_alt':'SnowCorps — worker and admin platform for snow-removal coordination',
  'story':("A two-sided application for organizing snow response: a worker app where people claim intersections, document completed work, and get paid, "
    "paired with an admin portal for oversight and coordination. It tackles the logistics problem behind a familiar civic promise — that the sidewalks "
    "and crossings actually get cleared."),
  'links':[{'href':'https://snowcorps.benjaminkrakauer.com','label':'snowcorps.benjaminkrakauer.com','note':None},
           {'href':'https://admin.snowcorps.benjaminkrakauer.com','label':'admin.snowcorps.benjaminkrakauer.com','note':None}],
  'tagline':'','subtiles':[],
 },
 {
  'slug':'onboarding','kicker':'Onboarding Scheduler',
  'headline':"Booking a new hire's first-week meetings, without the busywork",
  'oneliner':"An internal NYCEM tool that prepares a new hire's onboarding invitations in Outlook — nothing sends automatically.",
  'home_image':'assets/images/onboarding.webp',
  'home_alt':'Onboarding Scheduler — internal NYCEM tool that builds onboarding meeting invitations',
  'story':("Onboarding a new employee means booking the same set of first-week meetings — orientation, IT, HR, team intros — with the right people, "
    "rooms, and times. This internal HCM tool prepares that whole set: add the hire, build the meetings one by one or from a saved pattern with "
    "day-offsets, and each opens in Outlook pre-filled with attendees, time, location, and description. The system never sends anything — it flags NYC "
    "holidays and weekends, logs every batch, and hands each invitation to the organizer to add a Teams link, review, and send from their own Outlook. "
    "Built serverless on AWS — a React/TypeScript SPA on S3 + CloudFront, one Lambda behind API Gateway, and DynamoDB, with a server-side password gate via Secrets Manager."),
  'links':[{'href':'https://onboardingscheduler.benjaminkrakauer.com','label':'onboardingscheduler.benjaminkrakauer.com','note':'internal NYCEM tool'}],
  'tagline':'','subtiles':[],
 },
]

# Merge richer per-app sub-tile data + taglines from subtiles.py (single source)
try:
    import subtiles as _s
    for _a in APPS:
        if _a['slug'] in getattr(_s, 'TAGLINES', {}): _a['tagline'] = _s.TAGLINES[_a['slug']]
        if _a['slug'] in getattr(_s, 'SUBTILES', {}): _a['subtiles'] = _s.SUBTILES[_a['slug']]
except ImportError:
    pass

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
  "%3Crect width='32' height='32' rx='6' fill='%23faf8f4'/%3E%3Ctext x='16' y='23' font-size='20' "
  "text-anchor='middle' font-family='Georgia,serif' fill='%23b0762a'%3ES%3C/text%3E%3C/svg%3E")

def home_tile(app):
    if app['subtiles']:  # LINK tile → detail page
        return f'''      <li class="tile" role="listitem">
        <a class="tile-link" href="{app['slug']}.html">
          <span class="tile-media">
            <img src="{app['home_image']}" alt="{app['home_alt']}" width="1200" height="750" loading="eager" decoding="async" />
          </span>
          <span class="tile-head">
            <span class="tile-kicker">{app['kicker']}</span>
            <span class="tile-headline">{app['headline']}</span>
            <span class="tile-oneliner">{app['oneliner']}</span>
            <span class="tile-go" aria-hidden="true">Explore the project {CHEV_R}</span>
          </span>
        </a>
      </li>'''
    # accordion fallback (pre-drill-down behavior)
    chev = ('<svg class="chev" viewBox="0 0 16 16" width="16" height="16"><path d="M4 6l4 4 4-4" fill="none" '
            'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    return f'''      <li class="tile" role="listitem">
        <button class="tile-toggle" aria-expanded="false" aria-controls="panel-{app['slug']}" id="tab-{app['slug']}">
          <span class="tile-media">
            <img src="{app['home_image']}" alt="{app['home_alt']}" width="1200" height="750" loading="eager" decoding="async" />
          </span>
          <span class="tile-head">
            <span class="tile-kicker">{app['kicker']}</span>
            <span class="tile-headline">{app['headline']}</span>
            <span class="tile-oneliner">{app['oneliner']}</span>
            <span class="tile-more" aria-hidden="true">Read more{chev}</span>
          </span>
        </button>
        <div class="tile-panel" id="panel-{app['slug']}" role="region" aria-labelledby="tab-{app['slug']}">
          <div class="tile-panel-inner">
            <p class="tile-story">{app['story']}</p>
            <p class="tile-links">{links_html(app['links'])}</p>
          </div>
        </div>
      </li>'''

def build_index():
    tiles = '\n\n'.join(home_tile(a) for a in APPS)
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Selected Work — Ben Krakauer</title>
  <meta name="description" content="Applied civic technology — emergency management, language access, and public-service tooling." />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="color-scheme" content="light" />
  <link rel="icon" href="{FAVICON}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <a class="skip-link" href="#work">Skip to work</a>

  <header class="site-header">
    <div class="wrap">
      <h1 class="site-title">Selected Work</h1>
      <hr class="title-rule" aria-hidden="true" />
      <p class="site-tagline">Applied civic technology — emergency management, language access, and public-service tooling.</p>
    </div>
  </header>

  <main id="work" class="wrap">
    <ul class="grid" role="list">

{tiles}

    </ul>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>Applied civic technology · New York City</p>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>
'''

def subtile_html(t):
    pdf_attr = f' data-pdf="{t["pdf"]}"' if t.get('pdf') else ''
    caption = t['title'].replace('<span aria-hidden="true">·</span>','·')
    # strip any tags from caption for the lightbox bar
    import re
    caption = re.sub('<[^>]+>','',caption)
    kind = f'<span class="kind">{t["kind"]}</span>' if t.get('kind') else ''
    return f'''      <li class="subtile" role="listitem">
        <button class="subtile-view" data-full="{t['img']}" data-caption="{caption}"{pdf_attr}>
          {kind}<img src="{t['img']}" alt="{t['alt']}" loading="eager" decoding="async" />
        </button>
        <div class="subtile-body">
          <h2 class="subtile-title">{t['title']}</h2>
          <p class="subtile-desc">{t['desc']}</p>
        </div>
      </li>'''

def build_detail(app):
    subs = '\n\n'.join(subtile_html(t) for t in app['subtiles'])
    n = len(app['subtiles'])
    dl = links_html(app['links'])
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{re_strip(app['kicker'])} — Selected Work</title>
  <meta name="description" content="Inside {re_strip(app['kicker'])} — screens, products, and how it's built." />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="color-scheme" content="light" />
  <link rel="icon" href="{FAVICON}" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="detail.css" />
</head>
<body>
  <a class="skip-link" href="#views">Skip to screens</a>

  <header class="site-header detail-header">
    <div class="wrap">
      <a class="back-link" href="index.html">← Selected Work</a>
      <span class="detail-kicker">{app['kicker']}</span>
      <h1 class="site-title">{app['headline']}</h1>
      <hr class="title-rule" aria-hidden="true" />
      <p class="site-tagline">{app['tagline']}</p>
      <p class="detail-links">{dl}<span class="detail-count">· {n} views</span></p>
    </div>
  </header>

  <main id="views" class="wrap">
    <ul class="subgrid" role="list">

{subs}

    </ul>
  </main>

  <footer class="site-footer">
    <div class="wrap"><p><a class="back-link" href="index.html" style="margin:0">← Back to Selected Work</a></p></div>
  </footer>

  <div class="lightbox" id="lb" hidden role="dialog" aria-modal="true" aria-label="Screenshot viewer">
    <div class="lb-bar">
      <span class="lb-caption"></span>
      <div class="lb-actions">
        <a class="lb-btn lb-download" hidden target="_blank" rel="noopener">↓ Download PDF</a>
        <button class="lb-btn lb-close" type="button">✕ Close</button>
      </div>
    </div>
    <div class="lb-stage">
      <button class="lb-nav prev" type="button" aria-label="Previous screen">‹</button>
      <img class="lb-img" alt="" />
      <button class="lb-nav next" type="button" aria-label="Next screen">›</button>
    </div>
  </div>

  <script src="detail.js"></script>
</body>
</html>
'''

def re_strip(s):
    import re
    return re.sub('<[^>]+>','',s)

def main():
    open(os.path.join(SRC,'index.html'),'w',encoding='utf-8').write(build_index())
    built=['index.html']
    for a in APPS:
        if a['subtiles']:
            open(os.path.join(SRC,f"{a['slug']}.html"),'w',encoding='utf-8').write(build_detail(a))
            built.append(f"{a['slug']}.html ({len(a['subtiles'])} views)")
    print('generated:', ', '.join(built))

if __name__=='__main__':
    main()
