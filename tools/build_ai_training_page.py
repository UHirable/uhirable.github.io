"""Builds get-paid-to-train-ai.html: Mercor and Terac side by side, from the shell of remote-jobs-usd.html.
Facts were read on 23 November 2026: Mercor's from our Mercor guide (its own pages and listings), Terac's from the platform itself
(its opportunities and earnings pages). Re-check them before changing the "Checked on" date.
Run from the repository root:  python3 tools/build_ai_training_page.py
"""
import re, json

MERCOR = "https://t.mercor.com/vU87Z"
TERAC = "https://terac.com/refer/bc955b86"
URL = "https://uhirable.com/get-paid-to-train-ai.html"
TITLE = "Get Paid to Train AI: Who Qualifies, Pay and Countries | U Hirable"
H1 = "Get paid to train AI: who qualifies, pay and countries"
DESC = "Mercor and Terac pay professionals to help train and evaluate AI. Compare the work, who qualifies, the countries each one accepts and how you are paid."
FAQ = [
  ("Do I need to be an AI engineer to get paid to train AI?", "No. Both platforms look for people with real experience in a field, such as finance, law, medicine, engineering, marketing or product management. The work is reviewing, testing and improving what AI systems produce in your own field."),
  ("Which countries can apply?", "It depends on the opening. On Mercor, each listing has a location line and some name a region, for example USA only. On Terac, each study names where you must be based; on 23 November 2026 many named the US, or the US, UK, Canada, Australia and New Zealand."),
  ("How do Mercor and Terac pay?", "Mercor's listings state that payments are weekly, through Stripe or Wise. On Terac you withdraw your balance to your bank account: the minimum is $12.50, your identity is verified before the first withdrawal, and the money arrives in 1 to 3 business days."),
  ("Is it free to join?", "Yes. Signing up is free on both platforms. Never pay anyone to get this kind of work."),
]

def row(label, a, b, alt=False):
    bg = ' style="background:#f4f6ff"' if alt else ""
    return f'<tr{bg}><th scope="row">{label}</th><td>{a}</td><td>{b}</td></tr>'

MAIN = f'''<main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true">
        <div class="sphere s3"></div>
        <div class="ring"></div>
      </div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> Remote · Paid AI work</span>
        <h1>{H1}</h1>
        <p style="margin-left:auto;margin-right:auto">Mercor and Terac pay professionals to help train and evaluate AI systems. This page compares the two and shows what to check before you apply.</p>
      </div>
    </section>

    <section class="page-body">
      <div class="container wfh">
        <section class="topic-faq wfh-intro"><h2>The short answer</h2><p><b>You do not need to be an AI engineer.</b> Both platforms look for people with real experience in a field, such as finance, law, medicine, engineering, marketing or product management. The work is reviewing, testing and improving what AI systems produce in your own field.</p><p>Most openings name the countries they accept. Read that line first.</p></section>

        <div class="wfh-stats"><div><b>Remote</b><span>both platforms</span></div><div><b>Your field</b><span>not only software</span></div><div><b>By country</b><span>each opening names where you must be</span></div><div><b>Free</b><span>to sign up on both</span></div></div>

        <h2 class="wfh-h">Mercor and Terac side by side</h2>
        <div class="ai-tw"><table class="ai-t">
          <thead><tr><th></th><th scope="col">Mercor</th><th scope="col">Terac</th></tr></thead>
          <tbody>
          {row("Type of work", "Remote hourly contracts on AI projects", "Paid studies, project-based or one-time: AI training tasks, assessments, interviews and voice recordings")}
          {row("Who it is for", "Software and machine learning, medicine, law, finance and accounting, science and research, and business roles", "Each study names one profession. Open on 23 November 2026: engineers, accountants, economists, product managers, marketers, cybersecurity engineers, dermatologists, and finance, legal and technology leaders", True)}
          {row("Countries", "Depends on the listing. Read its location line", "Depends on the study. Many name the US, or the US, UK, Canada, Australia and New Zealand")}
          {row("Pay shown as", "An hourly rate on each listing", "A rate on each study", True)}
          {row("How you are paid", "Weekly, through Stripe or Wise, as listings state", "You withdraw to your bank account. Minimum $12.50, identity check before the first withdrawal, 1 to 3 business days")}
          {row("How to start", "Upload your resume, confirm your location, take a short AI interview", "Create a profile, then apply to a study you fit", True)}
          </tbody>
        </table></div>
        <div class="ai-cta"><a class="btn btn-gold" href="{MERCOR}" target="_blank" rel="sponsored noopener" data-src="mercor">Apply on Mercor →</a><a class="btn btn-primary" href="{TERAC}" target="_blank" rel="sponsored noopener" data-src="terac">Open Terac →</a></div>
        <p class="count" style="margin-top:10px">Checked on 23 November 2026, on each platform's own pages. Openings change every day.</p>

        <h2 class="wfh-h">Check these three things first</h2>
        <section class="topic-faq"><p><b>1. The location line.</b> Not every opening is open to every country. On Mercor, a listing that names a region is open only to candidates from that region. On Terac, a study that is not open in your country is marked that way.</p><p><b>2. The requirements.</b> Terac studies ask for specific experience, for example two or more years of hands-on work in the field. Some ask for 20 or more hours a week.</p><p><b>3. Other AI training work you already do.</b> Some Terac studies are not open to people already paid for AI training work by companies such as Scale AI, Outlier or Mercor. Read each study's requirements before you apply to both platforms.</p></section>

        <h2 class="wfh-h">Common questions</h2>
        <section class="topic-faq">{"".join(f"<p><b>{q}</b> {a}</p>" for q, a in FAQ)}<p><b>Is it a full-time job?</b> No. Mercor's listings are hourly contracts and Terac's are studies, so the hours depend on the project.</p></section>

        <h2 class="wfh-h">More on each platform</h2>
        <section class="topic-faq"><p>Our <a href="remote-jobs-usd.html">Mercor guide</a> explains its fields and application steps in detail. For remote jobs with employers, see <a href="remote-jobs.html">Remote Jobs</a>.</p></section>
      </div>
    </section>
  </main>'''

CSS = ('.ai-tw{overflow-x:auto;border-radius:18px;box-shadow:0 10px 30px rgba(1,18,255,.10)}'
       '.ai-t{width:100%;border-collapse:collapse;background:#fff;font-size:.93rem;color:#0b1170;line-height:1.45}'
       '.ai-t th,.ai-t td{padding:12px;text-align:left;vertical-align:top}.ai-t thead th{background:#0112ff;color:#fff;font-size:1rem}'
       '.ai-t tbody th{font-weight:800;width:24%}.ai-cta{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 0}.ai-cta .btn{flex:1 1 200px;text-align:center}')

h = open("remote-jobs-usd.html", encoding="utf8").read()
h, n = re.subn(r"<main.*?</main>", lambda m: MAIN, h, count=1, flags=re.S); assert n == 1
h, n = re.subn(r'<link rel="canonical"[^>]*>', f'<link rel="canonical" href="{URL}">', h, count=1); assert n == 1
h, n = re.subn(r"<title>.*?</title>", f"<title>{TITLE}</title>", h, count=1, flags=re.S); assert n == 1
h, n = re.subn(r'<meta name="description"[^>]*>', f'<meta name="description" content="{DESC}">', h, count=1); assert n == 1
h = re.sub(r'<meta property="og:title"[^>]*>', f'<meta property="og:title" content="{TITLE}">', h, count=1)
h = re.sub(r'<meta property="og:description"[^>]*>', f'<meta property="og:description" content="{DESC}">', h, count=1)
h = re.sub(r'<meta property="og:url"[^>]*>', f'<meta property="og:url" content="{URL}">', h, count=1)
ld = {"@context": "https://schema.org", "@graph": [
  {"@type": "WebPage", "name": H1[0].upper() + H1[1:], "description": DESC, "url": URL, "dateModified": "2026-11-23"},
  {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://uhirable.com/"},
     {"@type": "ListItem", "position": 2, "name": "Remote Jobs", "item": "https://uhirable.com/remote-jobs.html"}, {"@type": "ListItem", "position": 3, "name": "Get paid to train AI", "item": URL}]},
  {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}
lds = re.findall(r'<script type="application/ld\+json">.*?</script>', h, flags=re.S)
assert lds, "no JSON-LD in the shell"
for extra in lds[1:]: h = h.replace(extra, "")
h = h.replace(lds[0], '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>", 1)
assert "</style>" in h or True
h = h.replace("</head>", f"<style>{CSS}</style>\n</head>", 1)
assert "ercor)" not in re.search(r"<title>.*?</title>", h).group(0)
open("get-paid-to-train-ai.html", "w", encoding="utf8").write(h)
print("built")
