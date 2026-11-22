"""Builds apply.html (the application form page) with the site's header and footer, taken from contact.html.
Run from the repo root: python3 tools/build_apply_page.py"""
import re
s = open("contact.html", encoding="utf-8").read()
s = re.sub(r"<title>.*?</title>", "<title>Apply | U Hirable</title>", s, flags=re.S)
s = re.sub(r'<meta name="description" content=".*?">', '<meta name="description" content="Application form for roles posted on U Hirable.">\n  <meta name="robots" content="noindex, follow">', s)
s = re.sub(r'\s*<link rel="canonical"[^>]*>', "", s)
s = re.sub(r'\s*<meta property="og:[^>]*>', "", s)
s = re.sub(r'\s*<meta name="twitter:card"[^>]*>', "", s)
s = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', "", s, flags=re.S)
STYLE = """<style>
.ap-wrap{max-width:680px;margin:0 auto}
.ap-card{background:#fff;border-radius:22px;padding:22px 20px;box-shadow:0 10px 30px rgba(1,18,255,.10)}
.ap-note{background:#fff0ee;border:1.5px solid #ffc4bb;border-radius:14px;padding:12px 14px;color:#7a2318;font-size:.92rem;line-height:1.5;margin:0 0 6px}
.ap-note a{color:#0112ff;font-weight:700}
.ap-card h2{font-size:1.08rem;color:#0112ff;margin:24px 0 4px}
.ap-f{margin:14px 0 0}.ap-l{display:block;font-weight:700;font-size:.92rem;color:#0b1170;margin:0 0 6px;line-height:1.4}
.ap-f input:not([type=radio]),.ap-f textarea{width:100%;box-sizing:border-box;border:1.5px solid #d5d9ff;border-radius:12px;padding:11px 12px;font:inherit;font-size:1rem;color:#0b1170;background:#fff}
.ap-f textarea{min-height:92px;resize:vertical}.ap-f small{display:block;margin-top:5px;color:#5b6290;font-size:.82rem}
.ap-f input:focus,.ap-f textarea:focus{outline:2px solid #0112ff;outline-offset:1px}
.ap-yn{display:flex;gap:8px}.ap-yn label{flex:1;position:relative}.ap-yn input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.ap-yn span{display:block;text-align:center;border:1.5px solid #d5d9ff;border-radius:12px;padding:10px;font-weight:700;color:#0b1170}
.ap-yn input:checked+span{background:#0112ff;border-color:#0112ff;color:#fff}.ap-yn input:focus-visible+span{outline:2px solid #0112ff;outline-offset:2px}
.ap-hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.ap-ck{display:flex;gap:10px;align-items:flex-start;font-size:.86rem;line-height:1.5;color:#0b1170;margin:20px 0 14px}.ap-ck input{flex:0 0 20px;width:20px;height:20px;margin:2px 0 0}.ap-ck a{color:#0112ff}
#ap-ts{margin:0 0 12px;min-height:65px}
.ap-msg{background:#fcebeb;color:#791f1f;font-weight:700;border-radius:12px;padding:10px 12px;margin:0 0 12px;font-size:.92rem}
.ap-fine{font-size:.8rem;color:#5b6290;text-align:center;margin:10px 0 0}
.ap-done{text-align:center}.ap-done h2{font-size:1.3rem}.ap-done p{color:#0b1170;line-height:1.6}
</style>"""
s = re.sub(r"<style>.*?</style>", "", s, count=1, flags=re.S) if "<style>" in s[:s.index("</head>")] else s
s = s.replace("</head>", STYLE + "\n</head>", 1)
MAIN = """<main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true"><div class="sphere gold s1"></div><div class="sphere s3"></div><div class="ring"></div></div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> Application</span>
        <h1 id="ap-title">Apply</h1>
        <p id="ap-where"></p>
      </div>
    </section>
    <section class="page-body">
      <div class="container"><div class="ap-wrap"><div class="ap-card" id="ap-box"><p>Loading the form…</p><noscript>Please turn on JavaScript to apply.</noscript></div></div></div>
    </section>
  </main>"""
a = s.index("<main>"); b = s.index("</main>") + len("</main>")
s = s[:a] + MAIN + s[b:]
# page scripts: the site's own script, then the form
s = re.sub(r'\s*<script>document\.getElementById\("ct-copy"\).*?</script>', '\n  <script src="apply.js?v=1"></script>', s, flags=re.S)
assert 'apply.js?v=1' in s and "ct-copy" not in s
open("apply.html", "w", encoding="utf-8").write(s)
print("ok")
