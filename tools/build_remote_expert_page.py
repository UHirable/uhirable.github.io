#!/usr/bin/env python3
"""Build remote-jobs-usd.html (remote expert work on Mercor) from a current page's header and footer.

Every statement on the page comes from Mercor's own pages (home page, public listings,
referral policy), read on 21 Nov 2026. Nothing about pay amounts or acceptance is promised.
"""
import os, re, json
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(SITE)
SHELL = "work-from-home-jobs-for-beginners.html"
OUT = "remote-jobs-usd.html"
URL = "https://uhirable.com/" + OUT
REF = "https://t.mercor.com/vU87Z"
TITLE = "Remote Expert Work for AI Projects, Paid by the Hour (Mercor)"
DESC = "How remote, hourly expert work on Mercor works: the fields that are listed, the three application steps, location requirements to check, and how you are paid."
BTN = '<a class="btn %s" href="' + REF + '" target="_blank" rel="sponsored noopener" data-src="mercor">Apply on Mercor →</a>'

MAIN = '''  <main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true">
        <div class="sphere s3"></div>
        <div class="ring"></div>
      </div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> Remote · Hourly contracts</span>
        <h1>Remote expert work for AI projects, paid by the hour</h1>
        <p style="margin-left:auto;margin-right:auto">Mercor hires professionals to help train and evaluate AI systems in their own field. Listings are remote hourly contracts. This page explains how it works and what to check before you apply.</p>
        <p style="margin-top:18px;text-align:center;margin-left:auto;margin-right:auto">''' + (BTN % "btn-gold") + '''</p>
        <p style="margin-top:12px;font-size:14px;opacity:.9;max-width:640px;margin-left:auto;margin-right:auto">This is a referral link. When Mercor shows that you were referred by Amel Moussa, that is the recruiter behind U Hirable.</p>
      </div>
    </section>

    <section class="page-body">
      <div class="container wfh">
        <section class="topic-faq wfh-intro"><h2>What is this work?</h2><p>Mercor says it partners with AI labs and enterprises to train frontier models using human expertise. Experts work on projects that train and evaluate AI systems in their area of expertise: for example a finance expert flags where a model's output would not pass review.</p><p>Its public listings are marked <b>Hourly contract</b> and <b>Remote</b>, and each one shows an hourly rate. Mercor's listings also say the listed rate scale is for US-based applicants and that the rate offered depends on your professional background and location.</p></section>

        <div class="wfh-stats"><div><b>Remote</b><span>listings are marked Remote</span></div><div><b>Hourly</b><span>each listing shows an hourly rate</span></div><div><b>3 steps</b><span>resume, location, short AI interview</span></div><div><b>Weekly</b><span>payments on Stripe or Wise, as listings state</span></div></div>

        <h2 class="wfh-h">1. Check the location first</h2>
        <section class="topic-faq"><p><b>Not every listing is open to every country.</b> Many listings show a "Location requirements" line, for example USA only, or Canada, UK and USA. Mercor's referral policy says a listing that names a region is open only to candidates from that region, and a listing with no location is assumed open to applicants in the US, Canada, the UK or the EU.</p><p>Before you spend time on an application, open the listing and read its location line.</p></section>

        <h2 class="wfh-h">2. Fields Mercor lists</h2>
        <div class="wfh-grid">
          <article class="wfh-card"><i>\U0001F4BB</i><h3>Software &amp; machine learning</h3><p>Engineers and machine learning experts. Mercor's enterprise page names engineers among its experts.</p></article>
          <article class="wfh-card"><i>\U0001FA7A</i><h3>Medicine</h3><p>Physicians. "General Physician" is one of the roles shown on Mercor's home page.</p></article>
          <article class="wfh-card"><i>⚖️</i><h3>Law</h3><p>Lawyers. Mercor says its expert network spans law.</p></article>
          <article class="wfh-card"><i>\U0001F4CA</i><h3>Finance &amp; accounting</h3><p>Finance and accounting experts. Mercor says its network spans finance and accounting.</p></article>
          <article class="wfh-card"><i>\U0001F52C</i><h3>Science &amp; research</h3><p>Researchers in life, physical and social sciences, and humanities experts.</p></article>
          <article class="wfh-card"><i>\U0001F465</i><h3>Business roles</h3><p>Human resources, project management, sales and marketing, editors and creative and media experts.</p></article>
        </div>
        <p class="count" style="margin-top:6px">These are fields that appeared in Mercor's own pages and listings on 21 November 2026. Open listings change.</p>

        <h2 class="wfh-h">3. How to apply on Mercor</h2>
        <div class="wfh-steps wfh-road">
          <div class="wfh-step"><b>1</b><h3>Upload your resume</h3><p>The first step is your resume. Check it first with our free <a href="cv-match.html">CV checker</a>.</p></div>
          <div class="wfh-step"><b>2</b><h3>Confirm your location</h3><p>You confirm where you work from. This is what Mercor checks against a listing's location requirements.</p></div>
          <div class="wfh-step"><b>3</b><h3>Take the short AI interview</h3><p>Mercor's listings describe a short AI interview about your background. One listing says the resume, location and interview take about 20 minutes in total. Some listings use a short evaluation exercise or work trial instead.</p></div>
          <div class="wfh-step"><b>4</b><h3>Wait for a matching project</h3><p>Some listings are standing "talent network" listings. Mercor says these stay open whether or not a matching project is running that week, and it draws from them when a project begins.</p>''' + (BTN % "btn-sm btn-primary wfh-cta") + '''</div>
        </div>

        <h2 class="wfh-h">4. Before you apply</h2>
        <div class="wfh-two">
          <section class="topic-faq"><h2>Good to know</h2><ul class="wfh-list">
            <li>Listings state that payments are weekly on Stripe or Wise, based on services rendered. Check which one works in your country before you start.</li>
            <li>The work is contract work by the hour or by the task, not a permanent job.</li>
            <li>Some listings give the expected hours per week. Read them before you apply.</li>
          </ul></section>
          <section class="topic-faq"><h2>Stay safe</h2><ul class="wfh-list">
            <li>Apply only on Mercor's own website. Never pay anyone to "get you in".</li>
            <li>The application includes a recorded AI interview. Mercor confirmed a data breach in April 2026 and later said it had added security measures. Decide what you are comfortable sharing.</li>
            <li>Upload documents only inside the official platform, never by email, WhatsApp or Telegram.</li>
          </ul></section>
        </div>

        <section class="topic-faq" style="margin-top:28px"><h2>Disclosure</h2><p>The Mercor links on this page are referral links. If you are hired and start paid work, U Hirable may earn a referral fee from Mercor. Read our <a href="disclosure.html">affiliate disclosure</a>.</p></section>

        <p class="count" style="margin-top:28px">''' + (BTN % "btn-primary") + ''' &nbsp; <a class="btn btn-sm btn-soft" href="remote-jobs.html">See remote jobs at startups →</a></p>
      </div>
    </section>
  </main>
'''

s = open(SHELL, encoding="utf-8").read()
head, rest = s.split("<main>", 1)
head = head.rstrip(" ")
tail = rest.split("</main>", 1)[1]
old_slug = SHELL
e = lambda t: t.replace("&", "&amp;")
head = head.replace(old_slug, OUT)
head = re.sub(r"<title>.*?</title>", "<title>" + e(TITLE) + " | U Hirable</title>", head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + e(DESC), head)
head = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + e(TITLE) + " | U Hirable", head)
head = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>Remote hourly expert work on Mercor: fields, application steps and location requirements to check.", head)
ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebPage", "name": TITLE, "description": DESC, "url": URL},
    {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://uhirable.com/"},
        {"@type": "ListItem", "position": 2, "name": "Remote Jobs", "item": "https://uhirable.com/remote-jobs.html"},
        {"@type": "ListItem", "position": 3, "name": "Remote expert work", "item": URL}]}]}
head = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: '<script type="application/ld+json">' + json.dumps(ld) + "</script>", head, count=1, flags=re.S)
track = '  <script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-src]");if(!a)return;try{if(window.goatcounter&&goatcounter.count)goatcounter.count({path:"out/"+a.dataset.src,title:"Referral click: "+a.dataset.src,event:true});}catch(x){}});</script>\n'
tail = tail.replace('  <script data-goatcounter', track + '  <script data-goatcounter', 1)
out = head + MAIN.lstrip(" ").join(["  ", ""]) if False else head + MAIN + tail.lstrip("\n")
assert "Beginners" not in out.split("<main>")[0].split("<header")[0], "old head text left"
open(OUT, "w", encoding="utf-8").write(out)
print("wrote", OUT, len(out))
