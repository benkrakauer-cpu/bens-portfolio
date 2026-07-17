# Rich per-app sub-tile data + detail-page taglines, merged by build_site.py.
def T(img, alt, title, desc, pdf=None, kind=None):
    return {'img': img, 'alt': alt, 'title': title, 'desc': desc, 'pdf': pdf, 'kind': kind}

TAGLINES = {
 'hazard-intelligence':
   ("A real-time situational dashboard and an operations console that pull the city's hazard feeds — weather, flooding, the power grid, "
    "travel, and air quality — into one place, and turn them into scheduled briefings. A tour of the screens, the PDF products, and the admin side that runs it."),
 'iad':
   ("The interagency directory NYCEM uses to reach the right person at the right agency — paired with the self-service side that keeps it accurate. "
    "A tour of the directory, the review-and-approval workflow, the PDF exports, and the admin controls. Shown with seeded demo data (fictional names, 555 numbers)."),
 'snowcorps':
   ("Two sides of one snow-response platform: a mobile worker app for claiming intersections and getting paid, and an admin console for running a "
    "storm event and approving the work. Shown in Demo Mode with seeded data."),
 'emergency-plan':
   ("A guided, multilingual conversation that turns emergency-preparedness guidance into a personalized household plan — in the user's own language, "
    "with right-to-left rendering where needed. Built on a React/TypeScript front end with an AWS Lambda + Bedrock back end and prompt caching."),
 'onboarding':
   ("The internal HCM tool that prepares a new hire's onboarding meetings and hands them to Outlook — the system never sends anything itself. "
    "A look at the build flow and the reusable pieces behind it."),
 'travelreceipt':
   ("A focused consumer product: upload a receipt or invoice in any language and currency, and get back a translated PDF with the amounts converted, "
    "emailed in about a minute. Built on the same serverless translation foundation, with a production payment flow."),
 'document-translation':
   ("The email- and web-based translation service behind TravelReceipt: send a document, get back a formatted PDF in the target language, with "
    "currency conversion handled inline for financial documents. Serverless on Bedrock and Lambda."),
 'procurement':
   ("Emergency procurement is fast, high-stakes, and rule-bound. Procurement Agent walks staff through the documents an emergency package needs — "
    "scopes of work, emergency justifications, market solicitations — with tools to pick the right method and check live NYC data. "
    "Built on Bedrock, Lambda, API Gateway, and DynamoDB."),
}

SUBTILES = {
 'hazard-intelligence': [
   T('assets/hazard/hz-dashboard.webp','Situational dashboard','Situational Dashboard',
     "The at-a-glance operating picture: the day's briefing products, the active hazard outlook, and a five-day forecast on one screen. It auto-refreshes every 90 seconds from live feeds — NWS, NYISO, Con&nbsp;Edison / PSEG-LI, NYC&nbsp;DOT, and AirNow — and serves as the landing view for the whole tool."),
   T('assets/hazard/hz-alerts.webp','Real-time hazard alerts','Real-Time Hazard Alerts',
     "A live board of active disruptions — power outages, transit and ferry suspensions, air-quality and weather advisories, and IPAWS/WEA messages. Each card is produced by a real-time collector that polls its source on a fixed interval and flags anything that crosses a defined threshold."),
   T('assets/hazard/hz-grid.webp','Power grid and outages','Power Grid &amp; Outages',
     "A focused view of electric-grid conditions: Con&nbsp;Edison and PSEG-LI customer outages by borough, an outages-over-time chart, and NYISO system load versus forecast. It's assembled from utility outage feeds and the NYISO real-time load API."),
   T('assets/hazard/hz-travel.webp','Travel times','Travel Times',
     "A network view of roadway and transit travel times, flagging corridors running slower than normal. Built from NYC&nbsp;DOT travel-time feeds and refreshed continuously so operators can see mobility impacts as they develop."),
   T('assets/hazard/hz-air.webp','Air quality','Air Quality',
     "Current air-quality conditions and the AQI outlook, with pollutant breakdowns (ozone, PM2.5). Pulled from AirNow and shown against the health thresholds that trigger advisories."),
   T('assets/hazard/hz-briefing.webp','Hazard briefing PDF','Morning Daily Briefing <span aria-hidden="true">·</span> PDF',
     'The flagship product: a multi-page PDF covering today\'s posture, the seven-day hazard outlook, current conditions, active products, and national-center outlooks. It\'s generated on a schedule by a Lambda that composes the synthesis prose on AWS&nbsp;Bedrock and renders the document; the dashboard links straight to the day\'s file. <a href="assets/hazard/morning-daily-briefing.pdf" target="_blank" rel="noopener">Open the PDF →</a>',
     pdf='assets/hazard/morning-daily-briefing.pdf', kind='PDF'),
   T('assets/hazard/hz-grid-report.webp','Grid conditions report PDF','Grid Conditions Report <span aria-hidden="true">·</span> PDF',
     'A standalone grid-conditions PDF — NYISO load, outage counts, and system state — generated from the Grid tab for sharing outside the tool. One of several on-demand PDF products the console can produce. <a href="assets/hazard/grid-report.pdf" target="_blank" rel="noopener">Open the PDF →</a>',
     pdf='assets/hazard/grid-report.pdf', kind='PDF'),
   T('assets/hazard/hz-admin-status.webp','Admin system status','Admin — System Status &amp; Control',
     "The operator's home screen: pipeline state (enabled / send mode), the last and next scheduled runs, recently fired products, and per-product schedules. It's the control panel that governs what the tool generates and when."),
   T('assets/hazard/hz-admin-generation.webp','Admin generation','Admin — Generation',
     "On-demand generation: build and send any product immediately, regenerate a briefing, or target specific products to specific people. This is where an operator compiles something outside the normal schedule and reviews it before it goes out."),
   T('assets/hazard/hz-admin-alerts.webp','Admin alerts engine','Admin — Alerts Engine',
     "The configuration behind the real-time alerts: the engine mode, its thresholds, and the running list of conditions it watches — outages, service suspensions, air quality, seismic events, and IPAWS/WEA. It decides which real-world events rise to the level of an alert."),
   T('assets/hazard/hz-admin-distribution.webp','Admin distribution','Admin — Distribution',
     "The recipient and subscription manager: who receives which products, on what schedule (6&nbsp;AM / 4&nbsp;PM / instant), and through which channel. Subscriptions are toggled per person and per product, so a briefing only reaches the people who need it."),
   T('assets/hazard/hz-admin-grid.webp','Admin grid conditions','Admin — Grid Conditions',
     "The grid product tab: real-time NYISO electricity load with today's curve against forecast, and the controls to build the grid report and send it. It turns the raw load and outage feeds into a shareable operational product."),
   T('assets/hazard/hz-admin-citywide.webp','Admin citywide impact','Admin — Citywide Impact',
     "The Citywide Impact Summary editor, where an operator compiles the cross-hazard narrative that leads the briefing. It stitches the individual hazard signals into one plain-language posture statement."),
   T('assets/hazard/hz-admin-climate.webp','Admin climate records','Admin — Climate Records',
     "The climate records and outlook product: record highs and lows and seasonal outlooks (CPC), with generation and distribution controls. It backs the record-potential callouts on the dashboard."),
   T('assets/hazard/hz-admin-history.webp','Admin activity log','Admin — Activity Log',
     "A full audit trail of every product generated and sent — name, timestamp, recipients, and status. It gives operators a record of exactly what went out, to whom, and when, and supports backfilling missed runs from the logs."),
   T('assets/hazard/hz-admin-settings.webp','Admin settings','Admin — Settings',
     "System configuration: schedules, thresholds, data sources, and access. The knobs that shape how every product is generated and when it's sent."),
 ],

 'iad': [
   T('assets/iad/iad-dashboard.webp','IAD dashboard','Dashboard',
     "The landing view: headline counts (total, verified, aging, overdue), an alert strip for items needing attention, and a searchable list of recently-updated contacts. It's the operator's daily starting point for keeping the directory current."),
   T('assets/iad/iad-directory.webp','IAD directory','Directory',
     "The searchable contact directory — every person by name, agency, role, and phone, each with a verification status. Search by name, agency, or role to find exactly who to call."),
   T('assets/iad/iad-agencies.webp','IAD agencies','Agencies',
     "The agency register: each partner agency (FBI, FEMA, FDNY, NYPD, DOHMH…) with its acronym, full name, and contact count. Contacts hang off these agency records so the structure stays consistent."),
   T('assets/iad/iad-lists.webp','IAD lists','Lists',
     "Curated distribution lists — Coastal Storm Watch, EOC Commissioners, Federal Liaisons — that group the right contacts for a given activation. A list can be sent to or exported in a single action."),
   T('assets/iad/iad-update-requests.webp','IAD update requests','Update Requests',
     "Outbound requests asking an agency to confirm or refresh its own records, each with a status and an expiry. This is the engine of the self-service portal — the directory asks agencies to keep themselves current."),
   T('assets/iad/iad-pending.webp','IAD pending changes','Pending Changes',
     "The review queue for edits submitted through the self-service portal — each proposed change with its source and an approve / reject decision. Nothing enters the directory until an operator signs off."),
   T('assets/iad/iad-flags.webp','IAD raised flags','Raised Flags',
     "Contacts flagged for attention — bad numbers, bounced verifications, or reported issues — so data-quality problems surface instead of silently rotting."),
   T('assets/iad/iad-kpi.webp','IAD KPI dashboard','KPI Dashboard',
     "A health dashboard for the directory itself: verification rates, aging and overdue contacts, role coverage, and data-freshness. It measures how trustworthy the directory is at a glance."),
   T('assets/iad/iad-export.webp','IAD import and export','Import / Export <span aria-hidden="true">·</span> PDF',
     "Bulk import of contact records from JSON (with a dry-run preview) and PDF export — a full directory PDF, plus per-contact and per-agency sheets. The paper products for when a browser isn't handy."),
   T('assets/iad/iad-audit.webp','IAD audit log','Audit Log',
     "A complete audit trail — logins, edits, password resets, and record changes — with who, when, and from where. Accountability for a system multiple agencies touch."),
   T('assets/iad/iad-roles.webp','IAD role capabilities','Role Capabilities',
     "The permission matrix: what a User, Supervisor, and Administrator can each do across contacts, agencies, and admin. Access is role-based and cumulative, so people see only what their role allows."),
 ],

 'snowcorps': [
   T('assets/snowcorps/sc-worker-map.webp','SnowCorps worker map','Worker — Live Map',
     "The worker's home screen during an event: a live map of nearby intersections color-coded by priority and status, tied to the active storm. Workers see what needs clearing and what's already claimed."),
   T('assets/snowcorps/sc-worker-intersection.webp','SnowCorps intersection detail','Worker — Intersection Detail',
     "Tapping an intersection shows its priority, estimated pay, and the claim action. This is where a worker commits to a specific corner before starting."),
   T('assets/snowcorps/sc-worker-assignments.webp','SnowCorps worker assignments','Worker — Assignments',
     "The worker's claimed and completed intersections with status (active, submitted, approved) and pay — their running to-do list and history for the event."),
   T('assets/snowcorps/sc-worker-earnings.webp','SnowCorps worker earnings','Worker — Earnings',
     "Pay tracking: season total, current pay period, pending payout, and amount paid. Workers see exactly what they've earned and what's still awaiting approval."),
   T('assets/snowcorps/sc-worker-profile.webp','SnowCorps worker profile','Worker — Profile',
     "The worker's profile and stats — tier, borough, approvals, total earned, and tenure. Tier reflects a worker's track record on the platform."),
   T('assets/snowcorps/sc-admin-dashboard.webp','SnowCorps admin dashboard','Admin — Dashboard',
     "The command view: active events, claims today, pending review, and approvals, plus a live activity feed and a borough-by-borough breakdown. Where a coordinator watches the whole response unfold."),
   T('assets/snowcorps/sc-admin-events.webp','SnowCorps admin events','Admin — Events',
     "Event management: activate a storm event with a claim window, and review past events with their totals. Everything on the platform keys off an active event."),
   T('assets/snowcorps/sc-admin-review.webp','SnowCorps admin review queue','Admin — Review Queue',
     "The approval workflow: each submission shows before / after photos of the cleared intersection side by side, with approve / reject. This is the quality gate that authorizes pay."),
   T('assets/snowcorps/sc-admin-workers.webp','SnowCorps admin workers','Admin — Workers',
     "The roster: every worker with borough, tier, verification, approvals, and earnings. Coordinators manage who's active and see how they're performing."),
   T('assets/snowcorps/sc-admin-intersections.webp','SnowCorps admin intersections','Admin — Intersections',
     "The master intersection map and list with priority, status, and times-cleared. Admins add intersections and tune priorities so labor flows where it's needed most."),
 ],

 'emergency-plan': [
   T('assets/emergency/ep-choose.webp','Choose your experience','Choose Your Experience',
     "The entry point: pick the standard English assistant or the translation-enabled multilingual version. One conversational tool, two front doors."),
   T('assets/emergency/ep-conversation.webp','Guided conversation','Guided Conversation',
     "The assistant opens by explaining what it will do and offers to begin. Instead of a static PDF, preparedness starts as a plain-language chat that anyone can follow — and you can answer in any language."),
   T('assets/emergency/ep-intake.webp','Household intake','Household Intake',
     "Structured questions capture the details a good plan depends on: household size, each person's age range, special or functional needs, and pets. These answers drive what the generated plan recommends."),
   T('assets/emergency/ep-languages.webp','Language selection','Language Selection',
     "The multilingual version opens with a searchable language picker spanning dozens of languages. The interface, the conversation, and the final PDF are all rendered in the chosen language."),
   T('assets/emergency/ep-rtl.webp','Right-to-left rendering','Right-to-Left Rendering',
     "Full right-to-left support for Arabic, Hebrew, and Urdu — the layout mirrors and the conversation reads naturally, not machine-translated text bolted onto a left-to-right shell."),
 ],

 'onboarding': [
   T('assets/onboarding/ob-generate.webp','Generate invitations','Generate Invitations',
     "The three-step build: add the new hire(s), assemble the meetings manually or from a saved pattern, then validate and generate. The whole flow is designed so a person always reviews and sends from their own Outlook."),
   T('assets/onboarding/ob-build.webp','Building a meeting set','Building a Meeting Set',
     "With a hire added and meetings queued, the tool assembles the batch — attendees, times, rooms, and descriptions — before generating, flagging NYC holidays and weekends for the organizer to acknowledge."),
   T('assets/onboarding/ob-meetings.webp','Meeting templates','Meeting Templates',
     "Reusable meeting templates — HCM Orientation, IT Orientation, Lunch Break, Security Orientation, Supervisor Meet &amp; Greet — with durations and optional flags. They're the building blocks a pattern strings together."),
   T('assets/onboarding/ob-directory.webp','Directory','Directory',
     "The people and distribution directory the tool draws attendees from, so meetings are populated with the right names instead of retyped addresses each time."),
   T('assets/onboarding/ob-rooms.webp','Rooms','Rooms',
     "The room list used when building meetings — conference rooms, the Situation Room, Press Briefing Room, Training Room — so an invitation books a real place, consistently, across every hire."),
 ],

 'travelreceipt': [
   T('assets/travelreceipt/tr-landing.webp','TravelReceipt landing and upload','Upload &amp; Landing',
     "The public landing and upload: drop a file or snap a photo of a receipt, and the product takes it from there. The pitch is deliberately narrow — receipts and invoices, translated and currency-converted."),
   T('assets/travelreceipt/tr-selected.webp','Language, currency and price','Language, Currency &amp; Price',
     "Pick one or more target languages and the currency to convert into; the price updates live and the flow is ready to continue to payment. A real, priced transaction — not a demo."),
   T('assets/travelreceipt/tr-full.webp','How TravelReceipt works','How It Works',
     "The full page walks through the three steps — upload, choose language and currency, receive the translated PDF by email in about 60 seconds — with the supported formats and the delivery promise."),
 ],

 'document-translation': [
   T('assets/document-translation/dt-landing.webp','Document translation landing','Upload &amp; Landing',
     "The web entry point: drop a document (images, PDF, Word, Excel, text) and choose where it's going. The same engine also accepts documents by email."),
   T('assets/document-translation/dt-selected.webp','Target language selection','Target Languages',
     "Select one or more target languages — with a search box spanning far more than the visible chips — and the service prepares a professional translated PDF for each."),
   T('assets/document-translation/dt-full.webp','Translation and currency conversion','Translation + Currency Conversion',
     "The full landing lays out the value: professional document translation with automatic currency conversion to USD, built for international receipts, invoices, and contracts."),
 ],

 'procurement': [
   T('assets/procurement/pa-home.webp','Procurement Agent home','Three Ways In',
     "The home offers the three things staff actually need to do — build a scope of work, run an emergency procurement, or solicit the market — plus quick tools. It meets people at the task, not a blank document."),
   T('assets/procurement/pa-sow-category.webp','Scope of work category','Scope of Work — Category',
     "Building a scope starts by naming the buy and picking a category — goods, standard or professional services, construction, human services. The category shapes the questions and the template that follow."),
   T('assets/procurement/pa-sow-interview.webp','Scope of work guided interview','Scope of Work — Guided Interview',
     "Instead of a blank Word doc, the tool interviews the user in plain language — “what does success look like when this contract is done?” — and keeps a running summary of what you've told it. Those answers become an editable draft SOW."),
   T('assets/procurement/pa-emergency.webp','Emergency procurement','Emergency Procurement',
     "The emergency path skips straight to the emergency-procurement interview, picking the closest type so a package can be assembled fast when there's an unforeseen danger to life, safety, or property."),
   T('assets/procurement/pa-solicit.webp','Solicit the market','Solicit the Market',
     "Market-solicitation outreach: generate an RFI (market research) or an RFEI (expressions of interest), then refine and distribute the documents. It rounds out the package once the scope is drafted."),
   T('assets/procurement/pa-method.webp','Method evaluator','Method Evaluator',
     "A guided evaluator that recommends the right procurement method: a few high-level questions — estimated value, what's being procured, whether specs can be made definite — mapped against the PPB rules, so staff pick a defensible path."),
   T('assets/procurement/pa-mwbe.webp','M/WBE vendor search','M/WBE Vendor Search',
     "A lookup for City-certified M/WBE vendors, usable on its own without starting a procurement — so staff can find certified minority- and women-owned businesses to include."),
   T('assets/procurement/pa-contracts.webp','Prior contracts search','Prior Contracts Search',
     "A search over similar past NYC contracts — describe what you're procuring and find precedents to price and scope against, drawing on live NYC data sources like Checkbook NYC."),
 ],
}
