"""Builds care-homes-with-visa-sponsorship-uk.html from the UK nurse guide page (same header, footer and styles).
Run from the repo root: python3 tools/build_care_sponsorship_page.py"""
import re, json

SRC = "uk-nurse-visa-sponsorship-jobs.html"
OUT = "care-homes-with-visa-sponsorship-uk.html"
DATE = "2026-11-22"
TITLE = "Care Homes with Visa Sponsorship UK (2026): Rules and Search by Town"
DESC = "Care homes with visa sponsorship in 2026: who can still be sponsored, the 2028 deadline, and how to search licensed sponsors by town, like Portsmouth, Bolton or Hull."
H1 = "Care homes with visa sponsorship in the UK"

FAQ = [
 ("Can a care home in the UK sponsor a care worker from abroad?",
  "No. Since 22 July 2025 new visa applications from outside the UK are closed for care worker and senior care worker jobs."),
 ("I am already in the UK. Can a care home still sponsor me?",
  "It can until 22 July 2028 if you have been legally employed by that sponsor for at least three months before you apply. The 2028 date is under review, so confirm it on GOV.UK."),
 ("Which health jobs can still be sponsored from outside the UK?",
  "Registered nurses, midwives, doctors and other eligible health professionals can still apply for the Health and Care Worker visa with a job offer from an approved sponsor."),
 ("How do I check that a care home holds a sponsor licence?",
  "Search the Home Office register of licensed sponsors. A licence shows the employer is allowed to sponsor. It does not mean it is sponsoring for every job."),
]

BODY = f'''
          <p class="gd-note"><b>Last checked: November 2026.</b> Visa rules change. This page is a general guide, not legal or immigration advice. Confirm every detail on the official site before you apply or pay for anything: <a href="https://www.gov.uk/health-care-worker-visa/your-job" target="_blank" rel="noopener">GOV.UK: Health and Care Worker visa</a></p>
          <p class="gd-answer">If you are outside the UK: no. Since 22 July 2025 the UK does not accept new visa applications from overseas for care worker and senior care worker jobs. If you are already in the UK and have been legally employed by a sponsoring care provider for at least three months, you can still apply until 22 July 2028. Registered nurses and other eligible health professionals can still be sponsored from abroad.</p>
          <p class="gd-warn"><b>Be careful with offers.</b> A care worker or senior care worker job cannot be used for a new visa application from outside the UK. Treat any offer that says otherwise, or that asks you to pay for a job or for sponsorship, with great care.</p>

          <h2>Where you stand</h2>
          <div class="gd-tw"><table>
            <tr><th>Your situation</th><th>What applies</th></tr>
            <tr><td>Outside the UK, care worker or senior care worker (occupation codes 6135 and 6136)</td><td>Closed. New visa applications have not been accepted since 22 July 2025.</td></tr>
            <tr><td>In the UK and working for a sponsoring care provider</td><td>You can still apply until 22 July 2028 if you have been legally employed by that sponsor for at least three months before you apply. The 2028 date is under review.</td></tr>
            <tr><td>Registered nurse or midwife, in or outside the UK</td><td>Open. See <a href="uk-nurse-visa-sponsorship-jobs.html">UK nursing jobs with visa sponsorship</a> for the visa, NMC steps, costs and pay.</td></tr>
            <tr><td>Doctor or other health professional</td><td>The Health and Care Worker visa is still open for eligible health jobs. Check your job on the GOV.UK page above.</td></tr>
          </table></div>

          <h2>If you are already in the UK</h2>
          <ul>
            <li>Ask the care provider in writing whether it will sponsor you, and from what date.</li>
            <li>Check that the provider is on the Home Office register. <a href="uk-visa-sponsors.html">Search the official list of UK employers licensed to sponsor visas</a></li>
            <li>Keep proof of your employment dates. The three months with the sponsor are counted before you apply.</li>
            <li>Plan around 22 July 2028 and check GOV.UK for any change to that date.</li>
          </ul>

          <h2>If you are outside the UK</h2>
          <ul>
            <li>A care worker or senior care worker job is not a route into the UK at the moment.</li>
            <li>If you are a registered nurse or midwife, the route is open. Start with the <a href="uk-nurse-visa-sponsorship-jobs.html">UK nursing guide</a>.</li>
            <li>For other jobs, see <a href="visa-sponsorship-jobs.html">jobs with visa sponsorship</a> and the <a href="uk-visa-sponsors.html">list of licensed UK sponsors</a>.</li>
          </ul>

          <h2>Protect yourself</h2>
          <ul>
            <li>Check the employer on the Home Office <a href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" target="_blank" rel="noopener">register of licensed sponsors</a> before you accept an offer.</li>
            <li>Be careful with anyone who asks you to pay for a job offer or for sponsorship.</li>
            <li>A sponsor licence shows that an employer is allowed to sponsor. It does not mean it is sponsoring for the job you see.</li>
          </ul>
        </div>
        <section id="cv-jobs" aria-label="Live jobs" data-cc="uk" data-q="nurse visa sponsorship" data-title="Live UK nursing jobs that mention visa sponsorship" data-sub="Current openings from our job-search partner. Some adverts are posted by recruiters or job sites, not by the employer. Read each advert and check the employer on the official register before you apply." data-page="uk-care"></section>
        <div class="gd">
          <h2>Questions people ask</h2>''' + "".join(f"<h3>{q}</h3><p>{a}</p>" for q, a in FAQ) + '''
          <h2>More for the UK</h2>
          <p><a href="uk-nurse-visa-sponsorship-jobs.html">UK nursing jobs with visa sponsorship</a> · <a href="uk-visa-sponsors.html">UK licensed sponsors</a> · <a href="uk-cv-format.html">UK CV format</a> · <a href="guides.html">All career guides</a></p>
          <h2>Sources</h2><ul class="gd-src"><li><a href="https://www.gov.uk/health-care-worker-visa/your-job" target="_blank" rel="noopener">GOV.UK: Health and Care Worker visa, your job</a></li><li><a href="https://www.nhsemployers.org/articles/immigration-rule-changes-announced" target="_blank" rel="noopener">NHS Employers: Immigration rule changes announced (care workers and senior care workers)</a></li><li><a href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" target="_blank" rel="noopener">GOV.UK: Register of licensed sponsors</a></li></ul>
        </div>
      </div>
    </section>
  </main>'''

s = open(SRC, encoding="utf-8").read()
esc = lambda t: t.replace("&", "&amp;")
old_title = re.search(r"<title>(.*?)</title>", s).group(1)
old_desc = re.search(r'<meta name="description" content="(.*?)">', s).group(1)
s = s.replace(old_title, esc(TITLE)).replace(old_desc, DESC)
s = s.replace("uk-nurse-visa-sponsorship-jobs.html", "\0SELF\0", )
# JSON-LD
m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
ld = json.loads(m.group(1).replace("\0SELF\0", OUT))
for n in ld["@graph"]:
    if n["@type"] == "Article":
        n.update(headline=H1, description=DESC, datePublished=DATE, dateModified=DATE)
    if n["@type"] == "BreadcrumbList":
        n["itemListElement"][-1]["name"] = H1
ld["@graph"] = [n for n in ld["@graph"] if n["@type"] != "FAQPage"]
ld["@graph"].append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]})
s = s[:m.start(1)] + json.dumps(ld, ensure_ascii=False) + s[m.end(1):]
# hero + body
s = re.sub(r"<h1>.*?</h1>\s*<p>.*?</p>", f"<h1>{H1}</h1>\n        <p>What changed on 22 July 2025, who can still be sponsored, and where to look instead.</p>", s, count=1, flags=re.S)
a = s.index('<div class="gd">') + len('<div class="gd">'); b = s.index("</main>") + len("</main>")
s = s[:a] + BODY + s[b:]
# head/self links use the new file; links inside BODY to the nurse page were written literally
s = s.replace("\0SELF\0", OUT)
assert "\0" not in s
open(OUT, "w", encoding="utf-8").write(s)

# sitemap (both files) and site search
line = f'  <url><loc>https://uhirable.com/{OUT}</loc><lastmod>{DATE}</lastmod><priority>0.9</priority></url>\n'
for f in ("sitemap.xml", "sitemap-pages.xml"):
    x = open(f, encoding="utf-8").read()
    if OUT not in x:
        k = x.index("  <url><loc>https://uhirable.com/uk-nurse-visa-sponsorship-jobs.html")
        x = x[:k] + line + x[k:]; open(f, "w", encoding="utf-8").write(x)
x = open("search-index.js", encoding="utf-8").read()
if OUT not in x:
    e = json.dumps({"t": "Care Homes with Visa Sponsorship (UK)", "d": "Closed for overseas applicants since July 2025: who can still be sponsored", "u": OUT, "k": "Page"}, ensure_ascii=False)
    x = x.replace("window.SEARCH_INDEX=[", "window.SEARCH_INDEX=[" + e + ",", 1); open("search-index.js", "w", encoding="utf-8").write(x)
print("ok")
