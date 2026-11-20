# Builds the Australia pages (current labour agreements, Department of Home Affairs) from data/au. Run from the repo root.
# data/au/agreements.txt: "Company<TAB>LA type<TAB>start<TAB>end"  (as published on immi.homeaffairs.gov.au)
# data/au/all.txt: "Company<TAB>number of agreements"            (unique names, for the search box)
# Reuses the shell and search helpers at the top of tools/build_ie_nl_pages.py.
import json, os, re, collections

_src = open(os.path.join(os.path.dirname(__file__), "build_ie_nl_pages.py"), encoding="utf-8").read()
exec(_src[:_src.index("# ---------------------------------------------------------------- Ireland")])

AU_HUB = "australia-labour-agreement-sponsors.html"
TODAY = "2026-11-20"
LIST = "https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/labour-agreements/list-of-current-labour-agreements"
AU_SRC = ('<h2>Sources</h2><ul class="gd-src">'
          f'<li><a href="{LIST}" target="_blank" rel="noopener">Department of Home Affairs: List of current labour agreements</a></li>'
          '<li><a href="https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/labour-agreements" target="_blank" rel="noopener">Department of Home Affairs: Labour agreements</a></li></ul>\n'
          '          <p class="gd-src">U Hirable is not connected to the Department of Home Affairs. The department updates the list from time to time, so always confirm a company on immi.homeaffairs.gov.au before you rely on it.</p>\n')
AU_NOTE = ('          <p class="gd-note"><b>An agreement is not a job offer.</b> A labour agreement lets the business sponsor skilled workers from overseas. It does not mean it is hiring now. '
           'This is the list of labour agreements only. It is not a list of every employer that can sponsor a visa in Australia.</p>\n')


def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower().replace("industry - ", "")).strip("-")


def label(t):  # readable label, built only from the published type name
    if t.startswith("Industry - "):
        return t[11:] + " Industry"
    return t


def co(name):  # Australian company forms dropped from the search link only
    short = re.sub(r"[ ,]+((pty\.?|proprietary)\s+)?(ltd|limited|inc|incorporated)\.?$", "", name, flags=re.I).strip(" .,") or name
    q = short.replace("&", "%26").replace(" ", "+")
    return (f'<a class="xs-co" href="https://www.google.com/search?q={esc(q)}+careers" target="_blank" rel="noopener nofollow">{esc(name)} '
            '<span aria-hidden="true">↗</span></a>')


def when(d):  # 22-Jul-2030 -> 22 Jul 2030
    return d.replace("-", " ")


meta = json.load(open("data/au/meta.json"))
rows = [l.rstrip("\n").split("\t") for l in open("data/au/agreements.txt", encoding="utf-8") if l.strip()]
date, n_ag, n_co = nice_date(meta["updated"]), len(rows), meta["orgs"]
by = collections.defaultdict(list)
for r in rows:
    by[r[1]].append(r)
types = sorted(by, key=lambda t: -len(by[t]))
page = lambda t: f"australia-labour-agreements-{slug(t)}.html"
fam = lambda t: "dama" if "DAMA" in t else "industry" if t.startswith("Industry") else "other"
links = lambda f, skip=None: link_list([(f"{label(t)} ({num(len(by[t]))})", page(t)) for t in types if fam(t) == f and t != skip])
pages = {AU_HUB: TODAY}
VISAS = ('          <div class="gd-tw spc-tw"><table><thead><tr><th>Visa</th><th>Subclass</th></tr></thead><tbody>'
         '<tr><td>Skills in Demand visa</td><td>482</td></tr><tr><td>Employer Nomination Scheme visa</td><td>186</td></tr>'
         '<tr><td>Skilled Employer Sponsored Regional (Provisional) visa</td><td>494</td></tr></tbody></table></div>\n')
for t in types:
    g = sorted(by[t], key=lambda r: r[0].lower())
    k, lab, fname = len(g), label(t), page(t)
    what = ("A DAMA is a formal agreement between the Australian Government and a state, territory or regional authority. It gives employers in that area access to more occupations than the standard skilled migration programme. "
            if fam(t) == "dama" else
            "An industry labour agreement covers one industry, with fixed terms and conditions. " if fam(t) == "industry" else "")
    body = (GD +
            f'          <p class="gd-answer">{num(k)} current labour agreements in Australia are of the type "{esc(t)}". Each one lets the business sponsor skilled workers from overseas. This page lists them all with their end dates, from the official Home Affairs list dated {date}.</p>\n'
            + switch(AU_HUB) +
            f'          <p>{what}Labour agreements are generally in effect for five years. <a href="{AU_HUB}">Search the full list</a> to check any company.</p>\n'
            + AU_NOTE +
            f'          <h2>All {num(k)} agreements, A to Z</h2>\n'
            '          <ul class="spc-list">' + "".join(li(r[0], "until " + when(r[3])) for r in g) + "</ul>\n"
            '          {FAQ}\n'
            + (f'          <h2>Other DAMA regions</h2>\n          {links("dama", t)}\n' if fam(t) == "dama" else f'          <h2>Other industry agreements</h2>\n          {links("industry", t)}\n' if fam(t) == "industry" else "")
            + f'          <p><a href="{AU_HUB}">All labour agreement types</a></p>\n          ' + AU_SRC + GD_END)
    faq = [
        (f"Which employers in Australia have a {t} labour agreement?", f"{num(k)} agreements of this type are on the Department of Home Affairs list dated {date}. This page lists them all."),
        ("Does a company on this list have a job for me?", "Not necessarily. The list shows who holds an agreement. It does not show vacancies, so check each employer's careers page."),
        ("Which visas can be granted under a labour agreement?", "The Skills in Demand visa (subclass 482), the Employer Nomination Scheme visa (subclass 186) and the Skilled Employer Sponsored Regional (Provisional) visa (subclass 494)."),
    ]
    out = render(shell("uk-visa-sponsors.html"), fname, f"{lab} Labour Agreement Employers in Australia ({num(k)})",
                 f"{num(k)} current {t} labour agreements in Australia, with end dates. From the official Home Affairs list dated {date}.",
                 "Official Home Affairs list", f"{lab} labour agreement employers in Australia", f"Current labour agreements, {date}.", body, faq,
                 [("Home", ""), ("Australia labour agreements", AU_HUB), (lab, fname)], meta["updated"], TODAY)
    open(fname, "w", encoding="utf-8", newline="\n").write(out)
    pages[fname] = TODAY

body = (GD +
        f'          <p class="gd-answer">Australia publishes the businesses that hold a labour agreement, which lets them sponsor skilled workers from overseas. The official list has {num(n_ag)} current agreements held by {num(n_co)} employers, dated {date}. Search them here by company name, or browse by agreement type.</p>\n'
        + switch(AU_HUB) + search_box("data/au/all.txt", "", "e.g. JBS Australia, Estia, Qube") + AU_NOTE +
        '          <h2>Designated Area Migration Agreements (DAMA)</h2>\n'
        '          <p>A DAMA is a formal agreement between the Australian Government and a state, territory or regional authority. It gives employers in that area access to more occupations than the standard skilled migration programme.</p>\n          ' + links("dama") + "\n"
        '          <h2>Industry labour agreements</h2>\n'
        '          <p>An industry labour agreement covers one industry, with fixed terms and conditions.</p>\n          ' + links("industry") + "\n"
        '          <h2>Other agreement types</h2>\n          ' + links("other") + "\n"
        '          <h2>What a labour agreement is</h2>\n'
        '          <p>Labour agreements let approved businesses sponsor skilled overseas workers when there is a workforce need that the Australian labour market cannot meet and the standard visa programmes are not available. Agreements are generally in effect for five years. Three visas can be granted under one.</p>\n'
        + VISAS +
        '          <h2>How to use the list in your job search</h2>\n          <ol class="gd-steps">\n'
        '            <li><b>Start with your industry or region.</b> Open the agreement type that matches your work, then look for vacancies on each employer\'s own careers page.</li>\n'
        '            <li><b>Check the end date.</b> Each type page shows when the agreement ends.</li>\n'
        '            <li><b>Confirm on the official site.</b> Search the company on the Home Affairs list before you rely on it.</li>\n'
        '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a visa.</li>\n          </ol>\n'
        '          {FAQ}\n          ' + AU_SRC + GD_END)
faq = [
    ("Which companies in Australia have a labour agreement to sponsor overseas workers?", f"The Department of Home Affairs publishes them. Its list dated {date} has {num(n_ag)} current agreements held by {num(n_co)} employers, and you can search them all on this page."),
    ("What is a labour agreement?", "An agreement that lets an approved business sponsor skilled overseas workers when the Australian labour market cannot meet the need and the standard visa programmes are not available."),
    ("How long does a labour agreement last?", "Agreements are generally in effect for five years."),
    ("Is this every employer that can sponsor a visa in Australia?", "No. It is the list of labour agreements only."),
    ("Does being on the list mean the company is hiring?", "No. The list shows who holds an agreement. It does not show vacancies, so always check the employer's current jobs."),
]
out = render(shell("uk-visa-sponsors.html"), AU_HUB, f"Australia Labour Agreement Employers List ({YEAR}): {num(n_co)} Sponsors",
             f"Search {num(n_co)} employers in Australia with a current labour agreement to sponsor overseas workers, by name, industry and DAMA region. Official list dated {date}.",
             "Official Home Affairs list", "Australia labour agreement employers", "Check if an Australian employer holds a labour agreement to sponsor workers from overseas.", body, faq,
             [("Home", ""), ("Australia labour agreements", AU_HUB)], meta["updated"], TODAY)
open(AU_HUB, "w", encoding="utf-8", newline="\n").write(out)
update_sitemap(pages)
print("Australia: hub +", len(types), "type pages,", n_ag, "agreements,", n_co, "employers")
