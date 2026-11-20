# Builds the Finland page (employers certified by the Finnish Immigration Service, Migri) from data/fi. Run from the repo root.
# data/fi/all.txt: "Employer<TAB>Business ID<TAB>date of issue<TAB>date of expiry"  (from migri.fi "Certified employers";
# two obvious date typos on the source page were corrected: "August2023", "Nobember")
import json, os, re

_src = open(os.path.join(os.path.dirname(__file__), "build_ie_nl_pages.py"), encoding="utf-8").read()
exec(_src[:_src.index("# ---------------------------------------------------------------- Ireland")])

FI = "finland-certified-employers.html"
TODAY = "2026-11-20"
SRC = "https://migri.fi/en/certified-employers"


def co(name):  # Finnish company forms dropped from the search link only
    short = re.sub(r"\s+(oyj|oy ab|oy|ab|ry)$", "", name, flags=re.I).strip(" .,") or name
    q = short.replace("&", "%26").replace(" ", "+")
    return (f'<a class="xs-co" href="https://www.google.com/search?q={esc(q)}+careers" target="_blank" rel="noopener nofollow">{esc(name)} '
            '<span aria-hidden="true">↗</span></a>')


meta = json.load(open("data/fi/meta.json"))
rows = sorted([l.rstrip("\n").split("\t") for l in open("data/fi/all.txt", encoding="utf-8") if l.strip()], key=lambda r: r[0].lower())
n, date = len(rows), nice_date(meta["checked"])
assert n == meta["orgs"]
body = (GD +
        f'          <p class="gd-answer">Finland publishes the employers certified by the Finnish Immigration Service (Migri). There are {n} on the official list, checked on {date}. Certification speeds up the residence permit application of a person the company hires from abroad. The full list is below, with the date each certification ends.</p>\n'
        + switch(FI) +
        '          <p class="gd-note"><b>The list is not a job advertisement.</b> Migri says a company\'s name on the list does not mean it has vacancies. Certification is also not required: other employers in Finland can hire from abroad too, the application just takes the normal route.</p>\n'
        f'          <h2>All {n} certified employers, A to Z</h2>\n'
        '          <ul class="spc-list">' + "".join(li(a, "until " + d) for a, _, c, d in rows) + "</ul>\n"
        '          <h2>What employer certification means</h2>\n'
        '          <ul><li>It proves that the company meets certain requirements as an employer.</li>'
        '<li>It speeds up the processing of a residence permit application for an employed person.</li>'
        '<li>You still apply for your residence permit yourself and must meet the requirements for the permit.</li>'
        '<li>It does not change the fee for the residence permit application.</li>'
        '<li>A first certification is granted for two years. After that it can be extended for three years at a time.</li></ul>\n'
        '          <h2>How to use the list in your job search</h2>\n          <ol class="gd-steps">\n'
        '            <li><b>Look for vacancies on the company\'s own careers page.</b> Tap any name in the list to search for it.</li>\n'
        '            <li><b>Use Finland\'s official job sites too.</b> Migri points job seekers to Work in Finland and Job Market Finland.</li>\n'
        '            <li><b>Check the end date.</b> Migri updates the list every week and removes employers whose certification has ended.</li>\n'
        '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a permit.</li>\n          </ol>\n'
        '          {FAQ}\n          '
        '<h2>Sources</h2><ul class="gd-src">'
        f'<li><a href="{SRC}" target="_blank" rel="noopener">Finnish Immigration Service (Migri): Certified employers</a></li>'
        '<li><a href="https://migri.fi/en/employer-certification" target="_blank" rel="noopener">Finnish Immigration Service (Migri): Employer certification</a></li></ul>\n'
        '          <p class="gd-src">U Hirable is not connected to the Finnish Immigration Service. Migri updates the list weekly, so always confirm a company on migri.fi before you rely on it.</p>\n' + GD_END)
faq = [
    ("Which employers in Finland are certified to hire foreign workers?", f"The Finnish Immigration Service publishes them. There were {n} certified employers on its list on {date}, and this page lists them all."),
    ("What does a certified employer mean in Finland?", "The company has shown that it meets certain requirements as an employer. This speeds up the residence permit application of a person it hires."),
    ("Do I still need to apply for a residence permit myself?", "Yes. You apply yourself and must meet the requirements for the permit. Certification only speeds up the processing."),
    ("Does being on the list mean the company is hiring?", "No. The Finnish Immigration Service says the list is not a job advertisement."),
    ("How often is the list updated?", "Every week."),
]
out = render(shell("uk-visa-sponsors.html"), FI, f"Finland Certified Employers List ({YEAR}): All {n} Companies",
             f"All {n} employers certified by the Finnish Immigration Service, with certification dates. Faster residence permits for the people they hire. Checked {date}.",
             "Official Migri list", "Finland certified employers", "Employers certified by the Finnish Immigration Service, with faster permits for the people they hire.", body, faq,
             [("Home", ""), ("Finland certified employers", FI)], meta["checked"], TODAY)
open(FI, "w", encoding="utf-8", newline="\n").write(out)
update_sitemap({FI: TODAY})
print("Finland:", n, "employers")
