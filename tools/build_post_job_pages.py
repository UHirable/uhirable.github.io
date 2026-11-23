"""Builds the pages of the free "Post a Job" feature (worker/jobpost.js):
  post-a-job.html   the employer's form, from the shell of apply.html
  posted-job.html   the template the Worker fills for /job-post-<id>.html, from a job page
  jobs-admin.html   the owner's review page, from talent-admin.html
Run from the repository root:  python3 tools/build_post_job_pages.py
"""
import re

def read(p): return open(p, encoding="utf8").read()
def write(p, s): open(p, "w", encoding="utf8").write(s)

# ---------- post-a-job.html ----------
a = read("apply.html")
TITLE = "Post a Job for Free – Reach Job Seekers Worldwide | U Hirable"
DESC = "Post your job on U Hirable for free. No fees and no account. We review every post, list it for 30 days, and candidates apply to you directly."
head = f'''  <title>{TITLE}</title>
  <meta name="description" content="{DESC}">
  <link rel="canonical" href="https://uhirable.com/post-a-job.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="U Hirable">
  <meta property="og:title" content="Post a job for free on U Hirable">
  <meta property="og:description" content="{DESC}">
  <meta property="og:url" content="https://uhirable.com/post-a-job.html">
  <meta property="og:image" content="https://uhirable.com/og-image.png">
  <meta name="twitter:card" content="summary_large_image">'''
a, n = re.subn(r'  <title>.*?</title>\s*<meta name="description"[^>]*>\s*<meta name="robots"[^>]*>', lambda m: head, a, count=1, flags=re.S)
assert n == 1
a = a.replace("</style>", ".ap-f select{width:100%;box-sizing:border-box;border:1.5px solid #d5d9ff;border-radius:12px;padding:11px 12px;font:inherit;font-size:1rem;color:#0b1170;background:#fff}\n"
  "#pj-form .ap-ck{display:flex!important;flex-direction:row!important;align-items:flex-start}#pj-form .ap-ck input{width:20px!important;flex:0 0 20px}#pj-form .ap-ck span{flex:1}\n"
  ".ap-info{background:#eef0ff;border:1.5px solid #d5d9ff;border-radius:14px;padding:12px 14px;color:#0b1170;font-size:.92rem;line-height:1.5;margin:0 0 6px}\n"
  ".ap-terms{margin:8px 0 0;padding-left:20px;color:#0b1170;font-size:.9rem;line-height:1.6}.ap-terms li{margin:0 0 6px}\n"
  ".pj-how{max-width:680px;margin:26px auto 0;color:#0b1170}.pj-how h2{font-size:1.15rem;margin:0 0 8px}.pj-how ol{margin:0;padding-left:20px;line-height:1.7}\n</style>", 1)

FORM = '''<div class="ap-card" id="pj-box">
        <p class="ap-info"><b>Free for employers.</b> Your job is reviewed, then listed on U Hirable for 30 days. Candidates apply to you directly.</p>
        <form id="pj-form" novalidate>
          <h2>Your company</h2>
          <div class="ap-f"><label class="ap-l" for="pj-company">Company name</label><input id="pj-company" name="company" maxlength="80" autocomplete="organization" required></div>
          <div class="ap-f"><label class="ap-l" for="pj-website">Company website (optional)</label><input id="pj-website" name="website" type="url" placeholder="https://" maxlength="300"></div>
          <div class="ap-f"><label class="ap-l" for="pj-contact">Your work email</label><input id="pj-contact" name="contactEmail" type="email" autocomplete="email" maxlength="120" required><small>Only for us to confirm the post. Not shown on the site.</small></div>
          <h2>The job</h2>
          <div class="ap-f"><label class="ap-l" for="pj-title">Job title</label><input id="pj-title" name="title" maxlength="100" required></div>
          <div class="ap-f"><label class="ap-l" for="pj-country">Country</label><input id="pj-country" name="country" maxlength="60" autocomplete="country-name" required><small>For a remote job, the country candidates must be based in.</small></div>
          <div class="ap-f"><label class="ap-l" for="pj-city">City</label><input id="pj-city" name="city" maxlength="60"><small>Leave empty for a fully remote job.</small></div>
          <div class="ap-f"><span class="ap-l">Workplace</span><div class="ap-yn" role="radiogroup" aria-label="Workplace"><label><input type="radio" name="workplace" value="On-site" required><span>On-site</span></label><label><input type="radio" name="workplace" value="Hybrid"><span>Hybrid</span></label><label><input type="radio" name="workplace" value="Remote"><span>Remote</span></label></div></div>
          <div class="ap-f"><label class="ap-l" for="pj-type">Job type</label><select id="pj-type" name="type" required><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
          <div class="ap-f"><label class="ap-l" for="pj-desc">Job description and requirements</label><textarea id="pj-desc" name="description" maxlength="6000" style="min-height:190px" required></textarea><small>What the person will do and what you need from them. At least 150 characters.</small></div>
          <div class="ap-f"><label class="ap-l" for="pj-salary">Salary (optional)</label><input id="pj-salary" name="salary" maxlength="80" placeholder="e.g. USD 1,500 to 2,000 a month"></div>
          <h2>How candidates apply</h2>
          <div class="ap-f"><label class="ap-l" for="pj-url">Application link</label><input id="pj-url" name="applyUrl" type="url" placeholder="https://company.com/careers/job" maxlength="300"></div>
          <p class="ap-or">or</p>
          <div class="ap-f"><label class="ap-l" for="pj-email">Application email</label><input id="pj-email" name="applyEmail" type="email" placeholder="jobs@company.com" maxlength="120"><small>This email is shown publicly on the job page.</small></div>
          <h2>Before you post</h2>
          <ul class="ap-terms">
            <li>U Hirable is a free listing service. We are not a recruitment agency, and we do not screen, interview or recommend candidates.</li>
            <li>Applications go straight to you. We do not receive, store or forward them.</li>
            <li>If you enter an email address, it will be shown publicly on the job page. Expect unsolicited messages. Use an application link if you prefer to keep your email private.</li>
            <li>Every post is reviewed before it goes live. We may edit, decline or remove any post without notice.</li>
            <li>You confirm the job is real, you are authorised to post it, and candidates will never be asked to pay any fee.</li>
          </ul>
          <input name="fax" class="ap-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="ap-ck"><input type="checkbox" name="agree" required><span>I have read and agree to the above. See the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a>.</span></label>
          <div id="ap-ts"></div>
          <p id="pj-msg" class="ap-msg" role="status" hidden></p>
          <button class="btn btn-gold btn-full" id="pj-send" type="submit">Send for review</button>
          <p class="ap-fine">We usually review posts within one business day.</p>
        </form>
        <noscript><p class="ap-note">Please turn on JavaScript to post a job.</p></noscript>
      </div>
      <div class="pj-how"><h2>What happens next</h2><ol><li>We review your post, usually within one business day.</li><li>Once approved, it appears on our <a href="jobs.html">Jobs page</a> with its own page you can share.</li><li>Candidates apply through your link or your email. The post stays live for 30 days.</li></ol></div>'''
a, n = re.subn(r'<div class="ap-card" id="ap-box">.*?</div></div></div>', lambda m: FORM + "</div></div>", a, count=1, flags=re.S)
assert n == 1
a = a.replace('<h1 id="ap-title">Apply</h1>', "<h1>Post a job for free</h1>").replace('<p id="ap-where"></p>', "<p>Reach job seekers in the US, UK, Canada, the Gulf and Egypt. No fees, no account.</p>").replace(" Application</span>", " For Employers</span>")
a, n = re.subn(r'<script[^>]*src="apply\.js[^"]*"[^>]*></script>', '<script src="postjob.js?v=2"></script>', a)
assert n == 1, n
write("post-a-job.html", a)

# ---------- posted-job.html ----------
j = read("job-traba-product-engineer.html")
j, n = re.subn(r'<link rel="canonical"[^>]*>', '<link rel="canonical" href="https://uhirable.com/jobs.html">', j, count=1); assert n == 1
j, n = re.subn(r"<title>.*?</title>", "<title>Job | U Hirable</title>", j, count=1, flags=re.S); assert n == 1
j, n = re.subn(r'<meta name="description"[^>]*>', '<meta name="description" content="A job posted on U Hirable.">\n  <meta name="robots" content="noindex, follow">', j, count=1); assert n == 1
j = re.sub(r'<meta property="og:title"[^>]*>', '<meta property="og:title" content="Job on U Hirable">', j, count=1)
j = re.sub(r'<meta property="og:description"[^>]*>', '<meta property="og:description" content="A job posted on U Hirable.">', j, count=1)
j = re.sub(r'<meta property="og:url"[^>]*>', '<meta property="og:url" content="https://uhirable.com/jobs.html">', j, count=1)
j = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="https://uhirable.com/og-image.png">', j, count=1)
j, n = re.subn(r'\s*<script type="application/ld\+json" id="ld-schema">.*?</script>', '\n  <script type="application/ld+json" id="pj-ld">{}</script>', j, count=1, flags=re.S); assert n == 1
j, n = re.subn(r'\s*<script type="application/ld\+json" id="ld-crumbs">.*?</script>', "", j, count=1, flags=re.S); assert n == 1
j, n = re.subn(r'<script>window\.JOB_ID = "[^"]*";</script>\s*<script src="jobs\.js[^"]*"></script>', '<script id="pj-data"></script>', j, count=1); assert n == 1
assert "raba" not in re.sub(r"<svg.*?</svg>", "", j, flags=re.S), [m.group(0) for m in re.finditer(r".{40}raba.{40}", j)][:5]
write("posted-job.html", j)

# ---------- jobs-admin.html ----------
t = read("talent-admin.html")
t = t.replace("<title>Open to Work review | U Hirable</title>", "<title>Job posts review | U Hirable</title>").replace("<h1>Open to Work review</h1>", "<h1>Job posts review</h1>")
t = t.replace('"/api/talent/admin"', '"/api/jobpost/admin"').replace("all = d.talent || []; draw();", "all = d.jobs || []; draw();")
t = t.replace('[["pending", "Waiting"], ["approved", "Live"], ["rejected", "Rejected"]]', '[["pending", "Waiting"], ["approved", "Live"], ["expired", "Expired"], ["rejected", "Rejected"]]')
t = t.replace(".pending{background:#fff3cf;color:#6b4a00}", ".pending{background:#fff3cf;color:#6b4a00}.expired{background:#eceef5;color:#4a4f6b}")
start = t.index('$("#rows").innerHTML = rows.length ? rows.map((t) => `'); end = t.index("'<div class=\"box\">Nothing here.</div>';", start)
ROWS = '''$("#rows").innerHTML = rows.length ? rows.map((t) => `<div class="box"><div class="row"><div><p class="n">${esc(t.title)}</p><p class="m">${esc(t.company)}${t.website ? ` · <a href="${esc(t.website)}" target="_blank" rel="noopener noreferrer">${esc(t.website)}</a>` : ""}</p>
      <p class="m">${esc([t.city, t.country].filter(Boolean).join(", "))} · ${esc(t.workplace)} · ${esc(t.type)}${t.salary ? " · " + esc(t.salary) : ""}</p>
      <p class="m">Candidates apply by: ${t.applyUrl ? `<a href="${esc(t.applyUrl)}" target="_blank" rel="noopener noreferrer">${esc(t.applyUrl)}</a>` : esc(t.applyEmail)}</p>
      <p class="m">Sent by: ${esc(t.contactEmail)}</p>${t.status === "approved" ? `<p class="m"><a href="/job-post-${esc(t.id)}.html" target="_blank" rel="noopener">Open the live page</a> · listed until ${esc(t.expires)}</p>` : ""}</div><div><span class="st ${t.status}">${t.status}</span><p class="m">Sent ${esc(t.created)}</p></div></div>
      <p class="s">${esc(t.description)}</p><div class="acts">${t.status !== "approved" ? `<button class="g" data-act="approve" data-id="${esc(t.id)}">${t.status === "expired" ? "List for 30 more days" : "Approve"}</button>` : ""}${t.status !== "rejected" ? `<button class="r" data-act="reject" data-id="${esc(t.id)}">${t.status === "approved" ? "Take down" : "Reject"}</button>` : ""}<button class="q" data-act="delete" data-id="${esc(t.id)}">Delete for good</button></div></div>`).join("") : '''
t = t[:start] + ROWS + t[end:]
write("jobs-admin.html", t)
print("built")
