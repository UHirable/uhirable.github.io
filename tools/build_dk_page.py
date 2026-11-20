# Builds the Denmark page (companies certified by SIRI for the Fast-track Scheme) from data/dk. Run from the repo root.
# data/dk/all.txt: "Company name<TAB>CVR number"  (from nyidanmark.dk "Certified companies", copied as published)
# Reuses the shell and search helpers at the top of tools/build_ie_nl_pages.py.
import json, os, re

_src = open(os.path.join(os.path.dirname(__file__), "build_ie_nl_pages.py"), encoding="utf-8").read()
exec(_src[:_src.index("# ---------------------------------------------------------------- Ireland")])

DK_HUB = "denmark-fast-track-certified-companies.html"


def co(name):  # Danish company forms dropped from the search link only
    short = re.sub(r"\s+(a/s|aps|p/s|i/s|k/s|a\.m\.b\.a\.|amba)$", "", name, flags=re.I).strip(" .,") or name
    q = short.replace("&", "%26").replace(" ", "+")
    return (f'<a class="xs-co" href="https://www.google.com/search?q={esc(q)}+careers" target="_blank" rel="noopener nofollow">{esc(name)} '
            '<span aria-hidden="true">↗</span></a>')

TODAY = "2026-11-20"
DK_SRC = ('<h2>Sources</h2><ul class="gd-src">'
          '<li><a href="https://www.nyidanmark.dk/en-GB/Words-and-concepts/SIRI/Certified-companies" target="_blank" rel="noopener">New to Denmark (SIRI): Certified companies</a></li>'
          '<li><a href="https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Fast-track" target="_blank" rel="noopener">New to Denmark (SIRI): the Fast-track Scheme</a></li>'
          '<li><a href="https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Certification" target="_blank" rel="noopener">New to Denmark (SIRI): certification of companies</a></li></ul>\n'
          '          <p class="gd-src">U Hirable is not connected to SIRI. The list changes when SIRI certifies or removes a company, so always confirm a company on nyidanmark.dk before you rely on it.</p>\n')
DK_NOTE = ('          <p class="gd-note"><b>Certification is not a job offer.</b> Being on the list means the company may hire from abroad through the Fast-track Scheme. '
           'It does not mean it is hiring now. Always check the job ad or ask the employer.</p>\n')

meta = json.load(open("data/dk/meta.json"))
rows = [l.rstrip("\n").split("\t") for l in open("data/dk/all.txt", encoding="utf-8") if l.strip()]
date, n = nice_date(meta["updated"]), len(rows)
assert n == meta["orgs"]

pages = {DK_HUB: TODAY}
body = (GD +
        f'          <p class="gd-answer">Denmark publishes the companies it has certified to hire workers from outside the EU through the Fast-track Scheme. There are {num(n)} of them on the official list, updated on {date}. Search them here by name, or scroll the full list below. The scheme makes it faster for certified companies to recruit foreign employees.</p>\n'
        + switch(DK_HUB) + search_box("data/dk/all.txt", "", "e.g. Novo Nordisk, Maersk, LEGO") + DK_NOTE +
        '          <h2>What the Fast-track Scheme is</h2>\n'
        '          <p>The Fast-track Scheme lets certified companies recruit foreign employees faster. Your employer submits the application for you, so you give them a power of attorney. Your job must fit one of five tracks.</p>\n'
        '          <div class="gd-tw spc-tw"><table><thead><tr><th>Track</th><th>Main condition in 2026</th></tr></thead><tbody>'
        '<tr><td>Pay limit</td><td>Salary of at least DKK 552,000 a year</td></tr>'
        '<tr><td>Supplementary pay limit</td><td>Salary of at least DKK 446,000 a year, plus extra conditions such as advertising the job first</td></tr>'
        '<tr><td>Short-term</td><td>A stay of up to 90 days</td></tr>'
        '<tr><td>Researcher</td><td>A research position</td></tr>'
        '<tr><td>Educational</td><td>A highly qualified training stay at the certified company</td></tr>'
        '</tbody></table></div>\n'
        '          <p>SIRI adjusts the salary amounts every 1 January. The application fee is DKK 6,810, and your spouse or partner and children under 18 can get a permit to come with you. Check the current figures on nyidanmark.dk before you negotiate an offer.</p>\n'
        '          <h2>How to use the list in your job search</h2>\n          <ol class="gd-steps">\n'
        '            <li><b>Look for vacancies on the company\'s own careers page.</b> Tap any name in the list to search for it.</li>\n'
        '            <li><b>Check the salary.</b> The offer must meet the amount for your track.</li>\n'
        '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a permit.</li>\n          </ol>\n'
        f'          <h2>All {num(n)} certified companies</h2>\n'
        '          <ul class="spc-list">' + "".join(li(a) for a, _ in rows) + "</ul>\n"
        '          {FAQ}\n          ' + DK_SRC + GD_END)
faq = [
    ("Which companies in Denmark can hire foreign workers through the Fast-track Scheme?", f"Companies certified by SIRI, the Danish Agency for International Recruitment and Integration. There are {num(n)} on the official list updated on {date}, and this page lists them all."),
    ("What salary do I need for the Fast-track Scheme in 2026?", "At least DKK 552,000 a year on the pay limit track, or DKK 446,000 a year on the supplementary pay limit track, which has extra conditions."),
    ("Who applies for the permit?", "Your employer. Under the Fast-track Scheme the certified company submits the application, using a power of attorney from you."),
    ("Does being on the list mean the company is hiring?", "No. The list shows who is certified. It does not show vacancies, so always check the employer's current jobs."),
]
out = render(shell("uk-visa-sponsors.html"), DK_HUB, f"Denmark Fast-Track Certified Companies List ({YEAR}): {num(n)} Employers",
             f"Search all {num(n)} companies certified by SIRI to hire foreign workers through Denmark's Fast-track Scheme. From the official list updated {date}.",
             "Official SIRI list", "Denmark Fast-track certified companies", "Check if a Danish employer can hire you from abroad through the Fast-track Scheme.", body, faq,
             [("Home", ""), ("Denmark certified companies", DK_HUB)], meta["updated"], TODAY)
open(DK_HUB, "w", encoding="utf-8", newline="\n").write(out)
update_sitemap(pages)
print("Denmark:", n, "companies")
