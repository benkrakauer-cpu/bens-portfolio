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
}
