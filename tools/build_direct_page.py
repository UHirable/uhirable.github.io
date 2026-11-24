# Builds direct-from-employers.html: every job that employers posted themselves (approved posts), newest first.
# The shell (head, header, footer) comes from post-a-job.html. Run from the repo root.
import re
t = open('post-a-job.html', encoding='utf-8').read()
TITLE = "Jobs Posted Directly by Employers | U Hirable"
DESC = "Jobs that employers posted on U Hirable themselves. Each one is reviewed before it goes live, and you apply straight to the employer."
t = re.sub(r"<title>.*?</title>", f"<title>{TITLE}</title>", t)
t = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{DESC}">', t)
t = re.sub(r'<meta property="og:title" content=".*?">', '<meta property="og:title" content="Jobs posted directly by employers">', t)
t = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{DESC}">', t)
t = t.replace("https://uhirable.com/post-a-job.html", "https://uhirable.com/direct-from-employers.html")
t = re.sub(r"<style>.*?</style>", """<style>
.de-wrap{max-width:860px;margin:0 auto}
.de-top{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:#fff8e1;border:1.5px solid #ffc93c;border-radius:18px;padding:16px 18px;margin:0 0 18px}
.de-top p{margin:0;color:#0b1170;font-weight:700;line-height:1.5}
.de-list{display:grid;gap:14px}
.de-card{display:block;background:#fff;border:1.5px solid #dde1ff;border-radius:18px;padding:18px 20px;text-decoration:none;color:#0b1170;box-shadow:0 10px 30px rgba(1,18,255,.08)}
.de-card:hover{border-color:#0112ff}
.de-card h2{margin:0 0 4px;font-size:1.15rem;color:#0112ff;line-height:1.3}
.de-card .co{font-weight:800;margin:0 0 10px}
.de-tags{display:flex;gap:8px;flex-wrap:wrap}
.de-tags span{background:#eef1ff;border-radius:999px;padding:4px 12px;font-size:.84rem;font-weight:700}
.de-tags span.d{background:#ffc93c}
.de-card p.s{margin:10px 0 0;color:#5b6290;font-size:.92rem;line-height:1.55}
.de-msg{background:#fff;border-radius:18px;padding:22px;text-align:center;color:#5b6290}
.de-red{display:flex;gap:12px;align-items:flex-start;background:#a32d2d;color:#fff;border-radius:16px;padding:14px 18px;margin:0 0 16px;line-height:1.55;font-size:.95rem}.de-red b{flex:none;width:24px;height:24px;border-radius:50%;background:#fff;color:#a32d2d;display:flex;align-items:center;justify-content:center;font-weight:800;margin-top:1px}
.de-note{margin:18px 0 0;color:#5b6290;font-size:.88rem;line-height:1.55;text-align:center}
</style>""", t, count=1, flags=re.S)
main = """<main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true"><div class="sphere gold s1"></div><div class="sphere s3"></div><div class="ring"></div></div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> For Job Seekers</span>
        <h1>Direct from employers</h1>
        <p class="lead">Jobs that employers posted on U Hirable themselves. You apply straight to the employer.</p>
      </div>
    </section>
    <section class="page-body">
      <div class="container"><div class="de-wrap">
        <p class="de-red"><b>!</b>Free listing service. These jobs are posted by employers and you apply straight to them. U Hirable is not a recruitment agency: we do not screen, interview or recommend candidates, and we do not receive or forward applications. We review each post and require every employer to provide a company website as a source of credibility, but we cannot verify every detail. Never pay any fee to apply for a job.</p>
        <div class="de-top"><p>Hiring? Your job can be listed here too.</p><a class="btn btn-gold" href="post-a-job.html">Post a job for free</a></div>
        <div class="de-list" id="de-list"><p class="de-msg">Loading jobs&hellip;</p></div>
      </div></div>
    </section>
  </main>"""
t = re.sub(r"<main>.*?</main>", lambda m: main, t, count=1, flags=re.S)
script = """<script>
(() => {
  const list = document.getElementById("de-list");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const place = (j) => (j.workplace === "Remote" ? "Remote, " + j.country : [j.city, j.country].filter(Boolean).join(", "));
  const short = (s) => { s = String(s || "").replace(/\\s+/g, " ").trim(); return s.length > 190 ? s.slice(0, 190).replace(/\\s+\\S*$/, "") + "…" : s; };
  fetch("/api/jobpost").then((r) => r.json()).then((d) => {
    const jobs = d.jobs || [];
    if (!jobs.length) { list.innerHTML = '<p class="de-msg">No employer posts are live right now. Please check back soon.</p>'; return; }
    list.innerHTML = jobs.map((j) => `<a class="de-card" href="job-post-${esc(j.id)}.html"><h2>${esc(j.title)}</h2><p class="co">${esc(j.company)}</p>
      <div class="de-tags"><span class="d">Direct from employer</span><span>${esc(place(j))}</span><span>${esc(j.workplace)}</span><span>${esc(j.type)}</span>${j.salary ? `<span>${esc(j.salary)}</span>` : ""}</div>
      <p class="s">${esc(short(j.description))}</p></a>`).join("");
  }).catch(() => { list.innerHTML = '<p class="de-msg">Could not load the jobs right now. Please try again in a moment.</p>'; });
})();
</script>"""
t = re.sub(r'\s*<script src="postjob\.js\?v=\d+"></script>', lambda m: "\n  " + script, t)
t = re.sub(r'\s*<script[^>]*challenges\.cloudflare\.com[^>]*></script>', "", t)
assert "pj-form" not in t and "de-list" in t
open('direct-from-employers.html', 'w', encoding='utf-8').write(t)
print("built")
