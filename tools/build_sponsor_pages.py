# Builds the static "by city / by province / by job" pages from the sponsor data in data/uk and data/ca.
# Run after tools/build_sponsor_data.py (GitHub Action "Sponsor data"), from the repo root.
# The two hub pages (uk-visa-sponsors.html, canada-lmia-employers.html) are used as the page shell,
# so the menu and footer always match the rest of the site.
# It writes only: uk-visa-sponsors-*.html, canada-lmia-employers-*.html, the "browse" block inside
# the two hub pages, and the matching lines in sitemap.xml.
import collections, glob, html, json, os, re, sys, unicodedata

SITE = "https://uhirable.github.io/"
CSS_V = "77"
esc = html.escape
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def nice_date(iso):
    p = (iso or "").split("-")
    return "%d %s %s" % (int(p[2]), MONTHS[int(p[1]) - 1], p[0]) if len(p) == 3 else iso


def nice_q(q):
    m = re.match(r"(\d{4})Q(\d)$", q or "")
    return "%s %s" % (["January to March", "April to June", "July to September", "October to December"][int(m.group(2)) - 1], m.group(1)) if m else q


def num(n):
    return "{:,}".format(int(n))


def fold(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower().strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", fold(s)).strip("-")


# ---------------------------------------------------------------- page shell
def shell(hub):
    s = open(hub, encoding="utf-8").read()
    head_top = s[:s.index("<head>") + 6]
    rest = s[s.index("</head>"):]
    top = rest[:rest.index("<main>")]
    bottom = rest[rest.index("</main>"):]
    bottom = re.sub(r'\s*<script src="sponsors\.js[^"]*"></script>', "", bottom)
    return head_top, top, bottom


def render(sh, fname, title, desc, eyebrow, h1, sub, body, faq, crumbs, modified, published="2026-11-12"):
    head_top, top, bottom = sh
    url = SITE + fname
    graph = [
        {"@type": "Article", "headline": h1, "description": desc, "url": url, "datePublished": published, "dateModified": max(modified, published),
         "author": {"@type": "Organization", "name": "U Hirable", "url": SITE},
         "publisher": {"@type": "Organization", "name": "U Hirable", "url": SITE, "logo": {"@type": "ImageObject", "url": SITE + "favicon.png"}},
         "mainEntityOfPage": url, "inLanguage": "en"},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(crumbs)]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
    ]
    head = f'''
  <meta charset="UTF-8">
  <link rel="canonical" href="{url}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="U Hirable">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="627">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="favicon.png">
  <link rel="preload" href="fonts/plus-jakarta-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="style.css?v={CSS_V}">
  <script type="application/ld+json">{json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)}</script>
'''
    faq_html = "<h2>Common questions</h2>" + "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in faq)
    main = f'''<main>
    <section class="page-hero">
      <div class="shapes" aria-hidden="true"><div class="sphere gold s1"></div><div class="sphere s3"></div><div class="ring"></div></div>
      <div class="container">
        <span class="eyebrow"><span class="dot"></span> {esc(eyebrow)}</span>
        <h1>{esc(h1)}</h1>
        <p>{esc(sub)}</p>
      </div>
    </section>
    <section class="page-body">
      <div class="container">
{body.replace("{FAQ}", faq_html)}
      </div>
    </section>
  '''
    return head_top + head + top + main + bottom


def jobs_block(cc, q, loc, title, sub, page):
    return (f'        <section id="cv-jobs" aria-label="Live jobs" data-cc="{cc}" data-q="{esc(q)}"' + (f' data-l="{esc(loc)}"' if loc else "") +
            f' data-title="{esc(title)}" data-sub="{esc(sub)}" data-page="{page}"></section>\n')


GD = '        <div class="gd sp" style="max-width:1160px">\n'
GD_END = '        </div>\n'


def link_list(items):
    return '<p class="spc-links">' + "".join(f'<a href="{u}">{esc(n)}</a>' for n, u in items) + "</p>"


# ---------------------------------------------------------------- United Kingdom
UK_CITIES = ["London", "Birmingham", "Manchester", "Leicester", "Glasgow", "Bristol", "Edinburgh", "Leeds", "Nottingham", "Reading",
             "Coventry", "Slough", "Cambridge", "Milton Keynes", "Liverpool", "Bradford", "Luton", "Sheffield", "Oxford", "Cardiff",
             "Bolton", "Southampton", "Belfast", "Croydon", "Derby", "Northampton", "Aberdeen", "Wolverhampton", "Newcastle upon Tyne", "Brighton"]
UK_ALIAS = {"newcastle upon tyne": {"newcastle upon tyne", "newcastle-upon-tyne", "newcastle"}, "brighton": {"brighton", "brighton and hove", "brighton & hove"}}
UK_GROUPS = [
    ("NHS, hospitals and health", r"\bnhs\b|hospital|health board|healthcare|\bhealth\b|medical|clinic|pharmac|dental"),
    ("Care homes and home care", r"\bcare\b|\bcaring\b|nursing home|homecare|care home|residential home"),
    ("Universities, colleges and schools", r"universit|college|school|academy|education"),
    ("Technology and software", r"software|technolog|digital|\bdata\b|systems|cyber|\bit\b|computing|\btech\b|\bai\b"),
    ("Hotels, restaurants and food", r"hotel|restaurant|kitchen|grill|pizza|takeaway|catering|cafe|\bfoods?\b|bakery"),
    ("Engineering and construction", r"engineer|construction|builders|building|contractors"),
    ("Law, finance and accounting", r"solicitor|\blaw\b|legal|accountan|financ|\bbank|capital|insurance"),
]
UK_SRC = "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
FULL_LIST_MAX = 3200


def uk_item(r, routes, sw):
    extra = []
    if r[2] == "B":
        extra.append("B rating")
    elif r[2] == "P":
        extra.append("Provisional")
    rs = [int(i) for i in r[3].split(",") if i != ""]
    if sw not in rs:
        extra.append(", ".join(routes[i] for i in rs[:2]))
    return "<li>" + esc(r[0]) + (f" <i>{esc('; '.join(extra))}</i>" if extra else "") + "</li>"


UK_SECTORS = [
    ("nhs-hospitals", "NHS trusts and hospitals", "NHS trusts, health boards and hospitals", r"\bnhs\b|health board|\bhospitals?\b", "nurse"),
    ("care-homes", "Care homes and home care", "care homes and home care providers", r"care home|nursing home|residential (care|home)|homecare|home care|domiciliary", "care assistant"),
    ("universities", "Universities", "universities", r"universit", "lecturer"),
    ("schools-colleges", "Schools and colleges", "schools, colleges and academies", r"\bschools?\b|college|\bacademy\b", "teacher"),
    ("technology", "Technology and software companies", "technology and software companies", r"software|technolog|\bdigital\b|cyber|\bdata\b|\bai\b|computing", "software engineer"),
    ("hotels", "Hotels", "hotels, inns and resorts", r"\bhotels?\b|\binn\b|resort", "hotel"),
    ("restaurants", "Restaurants and takeaways", "restaurants, takeaways and kitchens", r"restaurant|takeaway|\bgrill\b|pizza|kitchen|\bcafe\b|tandoori|kebab", "chef"),
    ("pharmacies", "Pharmacies", "pharmacies and pharmaceutical companies", r"pharmac|chemist", "pharmacist"),
    ("dental-practices", "Dental practices", "dental practices", r"dental|dentist", "dentist"),
    ("law-firms", "Law firms", "solicitors and law firms", r"solicitor|\blaw\b|legal", "solicitor"),
    ("accountants", "Accountancy firms", "accountancy, audit and tax firms", r"accountan|accounting|audit|\btax\b", "accountant"),
    ("engineering", "Engineering companies", "engineering companies", r"engineer", "engineer"),
    ("construction", "Construction companies", "construction and building companies", r"construction|builders|building|contractors|scaffold|roofing", "construction"),
    ("sports-clubs", "Football, cricket and rugby clubs", "football, cricket and rugby clubs", r"football|\bfc\b|cricket|rugby", "coach"),
]
AZ_PAGE = 2000


def uk_item_city(r, routes, sw):
    extra = [r[1]] if r[1] else []
    if r[2] == "B":
        extra.append("B rating")
    elif r[2] == "P":
        extra.append("Provisional")
    rs = [int(i) for i in r[3].split(",") if i != ""]
    if sw not in rs:
        extra.append(", ".join(routes[i] for i in rs[:2]))
    return "<li>" + esc(r[0]) + (f" <i>{esc(' · '.join(extra))}</i>" if extra else "") + "</li>"


UK_FOOT = (f'          <h2>Sources</h2><ul class="gd-src"><li><a href="{UK_SRC}" target="_blank" rel="noopener">GOV.UK: Register of licensed sponsors: workers (Home Office)</a></li><li><a href="https://www.gov.uk/skilled-worker-visa" target="_blank" rel="noopener">GOV.UK: Skilled Worker visa</a></li></ul>\n'
           f'          <p class="gd-src">Contains public sector information licensed under the Open Government Licence v3.0. U Hirable is not connected to the Home Office. We refresh this page from the official file at the start of every month, so always confirm on GOV.UK before you rely on it.</p>\n')
UK_NOTE = '          <p class="gd-note"><b>A licence is not a job offer.</b> Being on the register means the employer is allowed to sponsor. It does not mean it is hiring now, or that a particular vacancy comes with sponsorship. Always check the job ad or ask the employer.</p>\n'


def uk_sectors(rows, routes, sw, meta, sh, sitemap, city_pages):
    date = nice_date(meta["updated"])
    has = lambda r, i: str(i) in r[3].split(",")
    pages = [(lab, "uk-visa-sponsors-%s.html" % sl) for sl, lab, _, _, _ in UK_SECTORS]
    city_file = {fold(c): f for c, f, _ in city_pages}
    done = []
    for sl, lab, phrase, pat, kw in UK_SECTORS:
        fname = "uk-visa-sponsors-%s.html" % sl
        rx = re.compile(pat, re.I)
        lst = sorted((r for r in rows if rx.search(r[0])), key=lambda r: (not r[0][:1].isalpha(), r[0].lower()))
        n = len(lst)
        if n < 50:
            continue
        n_sw = sum(1 for r in lst if has(r, sw))
        cc = collections.Counter(r[1] for r in lst if r[1])
        city_rows = "".join(f"<tr><td>{('<a href=' + chr(34) + city_file[fold(c)] + chr(34) + '>' + esc(c) + '</a>') if fold(c) in city_file else esc(c)}</td><td>{num(v)}</td></tr>" for c, v in cc.most_common(12))
        top3 = [c for c, _ in cc.most_common(3)]
        others = link_list([("All UK sponsors (search)", "uk-visa-sponsors.html")] + [(l, f) for l, f in pages if f != fname])
        body = (GD +
                f'          <p class="gd-answer">{num(n)} {esc(phrase)} hold a Home Office licence to sponsor work visas, and {num(n_sw)} of them are licensed for the Skilled Worker route. This page lists them all, from the official register dated {date}.</p>\n'
                f'          <p class="sp-switch"><a href="uk-visa-sponsors.html">Search all of the UK</a><a href="canada-lmia-employers.html">Canada</a></p>\n'
                f'          <h2>Where they are</h2>\n          <div class="gd-tw spc-tw"><table><thead><tr><th>Town or city</th><th>Licensed sponsors</th></tr></thead><tbody>{city_rows}</tbody></table></div>\n'
                f'          <p>We group organisations by words in their registered name, so this is a practical list and not an official classification. A few names may match by coincidence, and organisations that trade under a different brand name will be missing.</p>\n' + UK_NOTE + GD_END +
                jobs_block("uk", kw, "", f"Live {kw} jobs in the UK", "Current openings from our job-search partners. Check each advert for visa sponsorship before you apply.", "uk-sponsors-sector") + GD +
                f'          <h2>All {num(n)} licensed sponsors, A to Z</h2>\n          <p>The town or city is shown in italics after each name, with a note when the rating is not A or the route is not Skilled Worker.</p>\n'
                f'          <ul class="spc-list">' + "".join(uk_item_city(r, routes, sw) for r in lst) + "</ul>\n"
                f'          <div class="gd-cta"><a class="btn btn-primary" href="uk-visa-sponsors.html">Search the full register</a><a class="btn btn-soft" href="visa-sponsorship-jobs.html">Visa sponsorship jobs</a><a class="btn btn-soft" href="uk-cv-format.html">UK CV format</a></div>\n'
                f'          {{FAQ}}\n          <h2>Sponsors in other sectors</h2>\n          {others}\n' + UK_FOOT + GD_END)
        faq = [
            (f"How many {phrase} can sponsor a UK work visa?", f"{num(n)} organisations in this group are on the Home Office register of licensed sponsors dated {date}. {num(n_sw)} are licensed for the Skilled Worker route."),
            ("Where are most of them?", f"The towns and cities with the most are {top3[0]}, {top3[1]} and {top3[2]}."),
            ("Does a place on this list mean there is a job for me?", "No. The register shows who is allowed to sponsor workers. It does not show vacancies, and a licensed employer can advertise jobs that do not come with sponsorship."),
        ]
        out = render(sh, fname, f"{lab} That Sponsor UK Visas: {num(n)} Licensed Sponsors", f"{num(n)} {phrase} licensed to sponsor UK work visas, with town and rating. From the Home Office register dated {date}.",
                     "Official Home Office register", f"{lab} that sponsor UK work visas", f"Licensed sponsors on the Home Office register, {date}.", body, faq,
                     [("Home", ""), ("UK visa sponsorship companies", "uk-visa-sponsors.html"), (lab, fname)], meta["updated"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sitemap[fname] = max(meta["updated"], "2026-11-12")
        done.append((lab, fname, n))
    return done


def uk_az(rows, routes, sw, meta, sh, sitemap):
    date = nice_date(meta["updated"])
    for old in glob.glob("uk-visa-sponsors-az-*.html"):
        os.remove(old)
    groups = collections.OrderedDict()
    key = lambda r: r[0][:1].upper() if (r[0][:1].isascii() and r[0][:1].isalpha()) else "0"
    for r in sorted(rows, key=lambda r: (key(r), r[0].lower())):
        groups.setdefault(key(r), []).append(r)
    plan = []
    for k in sorted(groups, key=lambda x: (x == "0", x)):
        lst = groups[k]
        parts = max(1, -(-len(lst) // AZ_PAGE))
        size = -(-len(lst) // parts)
        for i in range(parts):
            plan.append((k, i + 1, parts, lst[i * size:(i + 1) * size]))
    fn = lambda k, i: "uk-visa-sponsors-az-%s%s.html" % ("0-9" if k == "0" else k.lower(), "" if i == 1 else "-%d" % i)
    letters = []
    for k, i, parts, chunk in plan:
        if i == 1:
            letters.append(("0-9" if k == "0" else k, fn(k, 1)))
    nav = link_list(letters)
    for idx, (k, i, parts, chunk) in enumerate(plan):
        fname = fn(k, i)
        name = "numbers and symbols" if k == "0" else "the letter " + k
        short = "0-9" if k == "0" else k
        total = len(groups[k])
        part_txt = f" (page {i} of {parts})" if parts > 1 else ""
        pager = ""
        if parts > 1:
            pager = '<p class="spc-links">' + "".join((f'<a href="{fn(k, j)}">Page {j}</a>' if j != i else f'<a href="{fn(k, j)}" aria-current="page"><b>Page {j}</b></a>') for j in range(1, parts + 1)) + "</p>"
        first, last = chunk[0][0], chunk[-1][0]
        body = (GD +
                f'          <p class="gd-answer">{num(total)} organisations whose registered name starts with {esc(name)} hold a Home Office licence to sponsor UK work visas. This page shows {num(len(chunk))} of them{part_txt}, from the official register dated {date}.</p>\n'
                f'          <p class="sp-switch"><a href="uk-visa-sponsors.html">Search the register by name or city</a><a href="canada-lmia-employers.html">Canada</a></p>\n'
                f'          <h2>Browse the register A to Z</h2>\n          {nav}\n' + UK_NOTE +
                f'          <h2>Licensed sponsors: {esc(first[:28])} to {esc(last[:28])}</h2>\n          {pager}\n'
                f'          <p>Names are shown as the Home Office lists them, which is the legal name and not always the brand name. The town or city is in italics, with a note when the rating is not A or the route is not Skilled Worker.</p>\n'
                f'          <ul class="spc-list">' + "".join(uk_item_city(r, routes, sw) for r in chunk) + f"</ul>\n          {pager}\n"
                f'          <div class="gd-cta"><a class="btn btn-primary" href="uk-visa-sponsors.html">Search the full register</a><a class="btn btn-soft" href="jobs.html?country=United%20Kingdom">Search live UK jobs</a></div>\n'
                f'          {{FAQ}}\n' + UK_FOOT + GD_END)
        faq = [
            ("How do I check if a company can sponsor my UK visa?", "Find its legal name on this A to Z list or type it into the register search. If it is listed with the Skilled Worker route, it is licensed to sponsor that visa."),
            ("Why is a company I know missing?", "The register uses legal names, not brand names. Search for part of the name, or look up the company's registered name on Companies House first."),
            ("Does being on the list mean the company is hiring?", "No. It means the company is allowed to sponsor workers. Check its current vacancies and whether each one offers sponsorship."),
        ]
        out = render(sh, fname, f"UK Visa Sponsors Starting With {short}{part_txt}: Licensed Sponsor List", f"Licensed UK visa sponsors from {first[:40]} to {last[:40]}, with town and rating. Home Office register dated {date}.",
                     "Official Home Office register", f"UK visa sponsors starting with {short}{part_txt}", f"The register of licensed sponsors, A to Z.", body, faq,
                     [("Home", ""), ("UK visa sponsorship companies", "uk-visa-sponsors.html"), (f"Sponsors: {short}", fn(k, 1))], meta["updated"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sitemap[fname] = max(meta["updated"], "2026-11-12")
    return letters, len(plan)



def build_uk(sitemap):
    meta = json.load(open("data/uk/meta.json", encoding="utf-8"))
    routes = meta["routes"]
    sw = routes.index("Skilled Worker")
    rows = []
    for f in sorted(glob.glob("data/uk/c-*.txt")):
        for l in open(f, encoding="utf-8"):
            p = l.rstrip("\n").split("\t")
            if len(p) >= 4:
                rows.append(p)
    if len(rows) < 50000:
        raise RuntimeError("UK data looks too small: %d rows" % len(rows))
    by_city = collections.defaultdict(list)
    for r in rows:
        by_city[fold(r[1])].append(r)
    sh = shell("uk-visa-sponsors.html")
    date = nice_date(meta["updated"])
    pages = [(c, "uk-visa-sponsors-%s.html" % slug(c)) for c in UK_CITIES]
    done = []
    for city, fname in pages:
        short = "Newcastle" if city.startswith("Newcastle") else city
        lst = []
        for k in UK_ALIAS.get(city.lower(), {city.lower()}):
            lst += by_city.get(k, [])
        lst.sort(key=lambda r: (not r[0][:1].isalpha(), r[0].lower()))
        n = len(lst)
        if n < 100:
            print("UK: skipped %s (%d rows)" % (city, n))
            continue
        has = lambda r, i: str(i) in r[3].split(",")
        n_sw = sum(1 for r in lst if has(r, sw))
        n_a = sum(1 for r in lst if r[2] == "A")
        rc = collections.Counter()
        for r in lst:
            for i in r[3].split(","):
                if i != "":
                    rc[routes[int(i)]] += 1
        route_rows = "".join(f"<tr><td>{esc(k)}</td><td>{num(v)}</td></tr>" for k, v in rc.most_common(8))
        groups, group_counts = "", []
        cap = 60 if n > FULL_LIST_MAX else 40
        for label, pat in UK_GROUPS:
            rx = re.compile(pat, re.I)
            g = [r for r in lst if r[2] == "A" and has(r, sw) and r[0][:1].isalpha() and rx.search(r[0])]
            if len(g) < 5:
                continue
            group_counts.append((label, len(g)))
            groups += (f'          <h3>{esc(label)} ({num(len(g))})</h3>\n          <ul class="spc-list">' + "".join(uk_item(r, routes, sw) for r in g[:cap]) + "</ul>\n" +
                       (f'          <p class="spc-more">Showing the first {cap} of {num(len(g))}, A to Z. <a href="uk-visa-sponsors.html">Search the full register</a> for the rest.</p>\n' if len(g) > cap else ""))
        if n <= FULL_LIST_MAX:
            full = (f'          <h2>All {num(n)} licensed sponsors in {esc(short)}, A to Z</h2>\n          <p>Every organisation on the register with {esc(short)} as its town or city. Names are shown as the Home Office lists them, which is the legal name and not always the brand name. A note in italics shows a rating other than A, or a route other than Skilled Worker.</p>\n'
                    f'          <details class="spc-all"><summary>Show or hide the full list</summary><ul class="spc-list">' + "".join(uk_item(r, routes, sw) for r in lst) + "</ul></details>\n")
        else:
            full = (f'          <h2>The full list for {esc(short)}</h2>\n          <p>{esc(short)} has {num(n)} licensed sponsors, too many to show on one page. Use the <a href="uk-visa-sponsors.html">register search</a>, choose "Town or city" and type {esc(short)}, or type a company name to check it.</p>\n')
        others = link_list([("All UK sponsors (search)", "uk-visa-sponsors.html")] + [(c, f) for c, f in pages if c != city])
        top_group = max(group_counts, key=lambda x: x[1]) if group_counts else None
        body = (GD +
                f'          <p class="gd-answer">{num(n)} organisations in {esc(short)} hold a Home Office licence to sponsor work visas, and {num(n_sw)} of them are licensed for the Skilled Worker route. This page lists them from the official register dated {date}.</p>\n'
                f'          <p class="sp-switch"><a href="uk-visa-sponsors.html">Search all of the UK</a><a href="canada-lmia-employers.html">Canada</a></p>\n'
                f'          <h2>{esc(short)} sponsors in numbers</h2>\n'
                f'          <div class="gd-tw spc-tw"><table><thead><tr><th>Visa route</th><th>Licensed organisations in {esc(short)}</th></tr></thead><tbody>{route_rows}</tbody></table></div>\n'
                f'          <p>{num(n_a)} of the {num(n)} have an A rating, which is the full licence. An organisation can be licensed for more than one route, so the rows add up to more than the total.</p>\n'
                f'          <p class="gd-note"><b>A licence is not a job offer.</b> Being on the register means the employer is allowed to sponsor. It does not mean it is hiring now, or that a particular vacancy comes with sponsorship. Always check the job ad or ask the employer.</p>\n' +
                GD_END +
                jobs_block("uk", "", short, f"Live jobs in {short}", "Type your job title to see current openings. Check each advert for visa sponsorship before you apply.", "uk-sponsors-city") +
                GD +
                f'          <h2>Skilled Worker sponsors in {esc(short)} by sector</h2>\n          <p>A-rated organisations licensed for Skilled Worker, grouped by words in their registered name. The groups are a quick way in, not an official classification, and one organisation can appear in more than one group.</p>\n' +
                groups + full +
                f'          <h2>How to use this list</h2>\n          <ol class="gd-steps">\n'
                f'            <li><b>Find employers in your field.</b> Start with the sector groups above, then look for vacancies on each employer\'s own careers page.</li>\n'
                f'            <li><b>Check the route.</b> For most long-term jobs you need an employer licensed for Skilled Worker.</li>\n'
                f'            <li><b>Check the job too.</b> The job must be eligible and meet the salary rules for the visa, not only the employer.</li>\n'
                f'            <li><b>Confirm on GOV.UK.</b> The register changes often. Check the official file before you rely on a name here.</li>\n          </ol>\n'
                f'          <div class="gd-cta"><a class="btn btn-primary" href="jobs.html?country=United%20Kingdom&amp;q={esc(short.replace(" ", "%20"))}">Search live jobs in {esc(short)}</a><a class="btn btn-soft" href="uk-visa-sponsors.html">Search the full register</a><a class="btn btn-soft" href="uk-cv-format.html">UK CV format</a></div>\n'
                f'          {{FAQ}}\n'
                f'          <h2>Sponsors in other UK cities</h2>\n          {others}\n'
                f'          <h2>Sources</h2><ul class="gd-src"><li><a href="{UK_SRC}" target="_blank" rel="noopener">GOV.UK: Register of licensed sponsors: workers (Home Office)</a></li><li><a href="https://www.gov.uk/skilled-worker-visa" target="_blank" rel="noopener">GOV.UK: Skilled Worker visa</a></li></ul>\n'
                f'          <p class="gd-src">Contains public sector information licensed under the Open Government Licence v3.0. U Hirable is not connected to the Home Office. We refresh this page from the official file at the start of every month, so always confirm on GOV.UK before you rely on it.</p>\n' +
                GD_END)
        faq = [
            (f"How many companies in {short} can sponsor a UK work visa?", f"{num(n)} organisations with {short} as their town or city are on the Home Office register of licensed sponsors dated {date}. {num(n_sw)} of them are licensed for the Skilled Worker route."),
            (f"Does a company on this list have jobs in {short} right now?", "Not necessarily. The register shows who is allowed to sponsor workers. It does not show vacancies, and a licensed employer can advertise jobs that do not come with sponsorship."),
            (f"Which kinds of employers sponsor visas in {short}?", (f"Going by registered names, the largest group among A-rated Skilled Worker sponsors in {short} is {top_group[0].lower()}, with {num(top_group[1])} organisations. " if top_group else "") + "The list also covers many small and medium businesses in other sectors."),
            ("Why can I not find a company I know?", "The register uses legal names, not brand names, and the town is the one the organisation registered with, often its head office. Search the full register by name to check."),
        ]
        out = render(sh, fname, f"Visa Sponsorship Companies in {short}: {num(n)} Licensed Sponsors",
                     f"{num(n)} employers in {short} are licensed to sponsor UK work visas. See them by sector and route, from the Home Office register dated {date}.",
                     "Official Home Office register", f"Visa sponsorship companies in {short}", f"Employers in {short} licensed to sponsor a UK work visa.", body, faq,
                     [("Home", ""), ("UK visa sponsorship companies", "uk-visa-sponsors.html"), (short, fname)], meta["updated"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        done.append((short, fname, n))
        sitemap[fname] = max(meta["updated"], "2026-11-12")
    sectors = uk_sectors(rows, routes, sw, meta, sh, sitemap, done)
    letters, n_az = uk_az(rows, routes, sw, meta, sh, sitemap)
    browse = ('<h2>Browse sponsors by city</h2>\n          <p>Full pages for the UK cities with the most licensed sponsors.</p>\n          ' +
              link_list([(f"{c} ({num(n)})", f) for c, f, n in done]) +
              '\n          <h2>Browse sponsors by sector</h2>\n          ' + link_list([(f"{l} ({num(n)})", f) for l, f, n in sectors]) +
              '\n          <h2>The full register, A to Z</h2>\n          ' + link_list(letters))
    print("UK: %d sector pages, %d A to Z pages" % (len(sectors), n_az))
    set_browse("uk-visa-sponsors.html", browse, "<h2>How to use the register in your job search</h2>")
    print("UK: %d city pages" % len(done))


# ---------------------------------------------------------------- Canada
PROVS = [("ON", "Ontario"), ("QC", "Quebec"), ("BC", "British Columbia"), ("AB", "Alberta"), ("SK", "Saskatchewan"), ("MB", "Manitoba"),
         ("NS", "Nova Scotia"), ("NB", "New Brunswick"), ("PE", "Prince Edward Island"), ("NL", "Newfoundland and Labrador")]
CA_CITIES = [("Toronto", "ON", ["toronto"]), ("Calgary", "AB", ["calgary"]), ("Edmonton", "AB", ["edmonton"]), ("Mississauga", "ON", ["mississauga"]),
             ("Surrey", "BC", ["surrey"]), ("Vancouver", "BC", ["vancouver"]), ("Brampton", "ON", ["brampton"]), ("Montreal", "QC", ["montreal"]),
             ("Quebec City", "QC", ["quebec", "quebec city", "ville de quebec"]), ("Winnipeg", "MB", ["winnipeg"]), ("Ottawa", "ON", ["ottawa"]),
             ("Abbotsford", "BC", ["abbotsford"]), ("Saskatoon", "SK", ["saskatoon"]), ("Halifax", "NS", ["halifax"])]
# (slug, plural label, job-search keyword, words matched in the official occupation title)
CA_JOBS = [
    ("cooks", "cooks and chefs", "cook", ["cooks", "chefs"]),
    ("truck-drivers", "truck drivers", "truck driver", ["transport truck drivers"]),
    ("farm-workers", "farm workers", "farm worker", ["harvesting labourers", "livestock labourers", "nursery and greenhouse labourers", "specialized livestock workers"]),
    ("food-service-supervisors", "food service supervisors", "food service supervisor", ["food service supervisors"]),
    ("caregivers", "caregivers and care aides", "caregiver", ["nurse aides", "home child care providers", "home support workers"]),
    ("carpenters", "carpenters", "carpenter", ["carpenters"]),
    ("welders", "welders", "welder", ["welders"]),
    ("construction-workers", "construction labourers", "construction labourer", ["construction trades helpers and labourers"]),
    ("mechanics", "mechanics", "mechanic", ["automotive service technicians", "heavy-duty equipment mechanics"]),
    ("software-developers", "software developers", "software developer", ["software developers and programmers", "software engineers and designers"]),
    ("administrative-assistants", "administrative assistants", "administrative assistant", ["administrative assistants"]),
    ("early-childhood-educators", "early childhood educators", "early childhood educator", ["early childhood educators"]),
    ("bakers", "bakers", "baker", ["bakers"]),
    ("cleaners", "cleaners", "cleaner", ["light duty cleaners"]),
]
CA_SRC = "https://open.canada.ca/data/en/dataset/90fed587-1364-4f33-a9ee-208181dc0b97"
CA_CAP = 150


def ca_table(rows, show_prov):
    body = "".join(f"<tr><td>{esc(r[0])}</td><td>{esc(r[1] or '-')}{(', ' + esc(r[2])) if show_prov else ''}</td><td>{num(r[3])}</td><td>{esc(r[4])}</td></tr>" for r in rows)
    return ('<div class="gd-tw spc-tw"><table class="spc-table"><thead><tr><th>Employer</th><th>' + ("City" if not show_prov else "City, province") +
            '</th><th>Positions approved</th><th>Main occupations approved</th></tr></thead><tbody>' + body + "</tbody></table></div>")


def ca_tail(what):
    return (f'          <p class="gd-note"><b>A past approval is not an open job.</b> This list shows employers that were approved to hire foreign workers in the period above. Some of those jobs are already filled, and an approval does not mean the employer is hiring now.</p>\n')


def ca_end(others_title, others):
    return (f'          <h2>How to use this list</h2>\n          <ol class="gd-steps">\n'
            f'            <li><b>Pick employers that hired for your job.</b> The last column shows the occupations each employer was approved for.</li>\n'
            f'            <li><b>Go to the employer directly.</b> Look for current vacancies on the employer\'s own site or on a job site, and apply there.</li>\n'
            f'            <li><b>Never pay for an LMIA.</b> The employer applies for it and pays the fee. A recruiter who asks you to pay for one is a warning sign.</li>\n          </ol>\n'
            f'          <div class="gd-cta"><a class="btn btn-primary" href="canada-lmia-employers.html">Search all LMIA employers</a><a class="btn btn-soft" href="jobs-in-canada-for-foreigners.html">Jobs in Canada for foreigners</a><a class="btn btn-soft" href="canadian-resume-format.html">Canadian resume format</a></div>\n'
            f'          {{FAQ}}\n'
            f'          <h2>{others_title}</h2>\n          {others}\n'
            f'          <h2>Sources</h2><ul class="gd-src"><li><a href="{CA_SRC}" target="_blank" rel="noopener">Open Canada: Temporary Foreign Worker Program, Positive LMIA Employers List (Employment and Social Development Canada)</a></li><li><a href="https://www.canada.ca/en/employment-social-development/services/foreign-workers.html" target="_blank" rel="noopener">Canada.ca: Hire a temporary foreign worker (LMIA)</a></li></ul>\n'
            f'          <p class="gd-src">Contains information licensed under the Open Government Licence – Canada. U Hirable is not connected to the Government of Canada. The official list leaves out employers whose business name is a personal name. We refresh this page from the official files at the start of every month.</p>\n')


def build_ca(sitemap):
    meta = json.load(open("data/ca/meta.json", encoding="utf-8"))
    rows = []
    for l in open("data/ca/all.txt", encoding="utf-8"):
        p = l.rstrip("\n").split("\t")
        if len(p) >= 6:
            p[3] = int(p[3])
            rows.append(p)
    if len(rows) < 5000:
        raise RuntimeError("Canada data looks too small: %d rows" % len(rows))
    rows.sort(key=lambda r: (-r[3], r[0].lower()))
    sh = shell("canada-lmia-employers.html")
    period = "%s to %s" % (nice_q(meta["quarters"][0]).split(" to ")[0] + " " + meta["quarters"][0][:4], nice_q(meta["quarters"][-1]).split(" to ")[1])
    pub = nice_date(meta["published"])
    pname = dict(PROVS)
    prov_pages = [(n, "canada-lmia-employers-%s.html" % slug(n), c) for c, n in PROVS]
    city_pages = [(n, "canada-lmia-employers-%s.html" % slug(n), p, keys) for n, p, keys in CA_CITIES]
    job_pages = [(lab, "canada-lmia-employers-%s.html" % s, kw, words) for s, lab, kw, words in CA_JOBS]
    all_links = (lambda skip: link_list([("All of Canada (search)", "canada-lmia-employers.html")] + [(n, f) for n, f, _ in prov_pages if f != skip] +
                                         [(n, f) for n, f, _, _ in city_pages if f != skip] + [(lab.capitalize(), f) for lab, f, _, _ in job_pages if f != skip]))
    switch = '          <p class="sp-switch"><a href="canada-lmia-employers.html">Search all of Canada</a><a href="uk-visa-sponsors.html">United Kingdom</a></p>\n'

    def top_occ(lst, k=10):
        c = collections.Counter()
        for r in lst:
            for o in r[4].split("; "):
                if o:
                    c[o] += 1
        return c.most_common(k)

    def occ_table(lst, where):
        return ('<div class="gd-tw spc-tw"><table><thead><tr><th>Occupation (official title)</th><th>Employers approved in ' + esc(where) + '</th></tr></thead><tbody>' +
                "".join(f"<tr><td>{esc(o)}</td><td>{num(v)}</td></tr>" for o, v in top_occ(lst)) + "</tbody></table></div>")

    def shown_note(lst):
        return (f'          <p class="spc-more">Showing the {CA_CAP} employers with the most approved positions, out of {num(len(lst))}. <a href="canada-lmia-employers.html">Search the full list</a> for the rest.</p>\n' if len(lst) > CA_CAP else "")

    n_prov = n_city = n_job = 0
    # provinces
    for name, fname, code in prov_pages:
        lst = [r for r in rows if r[2] == code]
        if len(lst) < 50:
            continue
        pos = sum(r[3] for r in lst)
        cc = collections.Counter(r[1] for r in lst if r[1])
        city_rows = "".join(f"<tr><td>{esc(c)}</td><td>{num(v)}</td></tr>" for c, v in cc.most_common(10))
        occ = top_occ(lst, 3)
        body = (GD +
                f'          <p class="gd-answer">{num(len(lst))} employers in {esc(name)} were approved to hire foreign workers with a positive LMIA from {period}, for {num(pos)} positions in total. This page lists them from the official Government of Canada list published on {pub}.</p>\n' + switch +
                f'          <h2>Jobs employers in {esc(name)} were approved for</h2>\n          {occ_table(lst, name)}\n          <p>The official list gives up to three main occupations for each employer on this page, so an employer can be counted in more than one row.</p>\n'
                f'          <h2>Cities in {esc(name)} with the most LMIA employers</h2>\n          <div class="gd-tw spc-tw"><table><thead><tr><th>City</th><th>Employers approved</th></tr></thead><tbody>{city_rows}</tbody></table></div>\n' + ca_tail(name) + GD_END +
                jobs_block("ca", "", name, f"Live jobs in {name}", "Type your job title to see current openings. Check each advert for whether the employer hires from abroad.", "ca-lmia-prov") + GD +
                f'          <h2>LMIA employers in {esc(name)} with the most approved positions</h2>\n          {ca_table(lst[:CA_CAP], False)}\n' + shown_note(lst) +
                ca_end("LMIA employers in other places and jobs", all_links(fname)) + GD_END)
        faq = [
            (f"How many employers in {name} have a positive LMIA?", f"{num(len(lst))} employers in {name} appear on the official positive LMIA list for {period}, covering {num(pos)} approved positions."),
            (f"Which jobs get the most LMIA approvals in {name}?", "Counting employers, the most common occupations are " + ", ".join(o.lower() for o, _ in occ) + "."),
            ("Does this list show jobs that are open now?", "No. It is a record of past approvals in the last four published quarters. Always check the employer's current vacancies."),
            ("Who pays for the LMIA?", "The employer applies and pays the processing fee. You should not be asked to pay for an LMIA."),
        ]
        out = render(sh, fname, f"LMIA Employers in {name}: {num(len(lst))} Approved Employers",
                     f"{num(len(lst))} employers in {name} approved to hire foreign workers with a positive LMIA, with cities and jobs. From the official Canada list.",
                     "Official Government of Canada list", f"LMIA employers in {name}", f"Employers in {name} approved to hire foreign workers.", body, faq,
                     [("Home", ""), ("Canada LMIA employers", "canada-lmia-employers.html"), (name, fname)], meta["published"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sitemap[fname] = max(meta["published"], "2026-11-12")
        n_prov += 1
    # cities
    for name, fname, code, keys in city_pages:
        lst = [r for r in rows if r[2] == code and fold(r[1]) in keys]
        if len(lst) < 50:
            continue
        pos = sum(r[3] for r in lst)
        occ = top_occ(lst, 3)
        prov_file = "canada-lmia-employers-%s.html" % slug(pname[code])
        body = (GD +
                f'          <p class="gd-answer">{num(len(lst))} employers in {esc(name)}, {esc(pname[code])} were approved to hire foreign workers with a positive LMIA from {period}, for {num(pos)} positions in total. This page lists them from the official Government of Canada list published on {pub}.</p>\n' + switch +
                f'          <h2>Jobs employers in {esc(name)} were approved for</h2>\n          {occ_table(lst, name)}\n          <p>The official list gives up to three main occupations for each employer on this page, so an employer can be counted in more than one row. Employers are listed under the city in their registered address. See also <a href="{prov_file}">all LMIA employers in {esc(pname[code])}</a>.</p>\n' + ca_tail(name) + GD_END +
                jobs_block("ca", "", name, f"Live jobs in {name}", "Type your job title to see current openings. Check each advert for whether the employer hires from abroad.", "ca-lmia-city") + GD +
                f'          <h2>LMIA employers in {esc(name)} with the most approved positions</h2>\n          {ca_table(lst[:CA_CAP], False)}\n' + shown_note(lst) +
                ca_end("LMIA employers in other places and jobs", all_links(fname)) + GD_END)
        faq = [
            (f"How many employers in {name} have a positive LMIA?", f"{num(len(lst))} employers with an address in {name} appear on the official positive LMIA list for {period}, covering {num(pos)} approved positions."),
            (f"Which jobs get the most LMIA approvals in {name}?", "Counting employers, the most common occupations are " + ", ".join(o.lower() for o, _ in occ) + "."),
            ("Does this list show jobs that are open now?", "No. It is a record of past approvals in the last four published quarters. Always check the employer's current vacancies."),
            ("Who pays for the LMIA?", "The employer applies and pays the processing fee. You should not be asked to pay for an LMIA."),
        ]
        out = render(sh, fname, f"LMIA Employers in {name}: {num(len(lst))} Approved Employers",
                     f"{num(len(lst))} employers in {name} approved to hire foreign workers with a positive LMIA, with the jobs they hired for. From the official Canada list.",
                     "Official Government of Canada list", f"LMIA employers in {name}", f"Employers in {name}, {pname[code]} approved to hire foreign workers.", body, faq,
                     [("Home", ""), ("Canada LMIA employers", "canada-lmia-employers.html"), (name, fname)], meta["published"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sitemap[fname] = max(meta["published"], "2026-11-12")
        n_city += 1
    # jobs
    for lab, fname, kw, words in job_pages:
        lst = [r for r in rows if any(w in r[4].lower() for w in words)]
        # employers whose first (largest) occupation is this job come first, then by approved positions
        pos_of = lambda r: next(i for i, o in enumerate(r[4].split("; ")) if any(w in o.lower() for w in words))
        lst.sort(key=lambda r: (min(pos_of(r), 1), -r[3], r[0].lower()))
        if len(lst) < 50:
            continue
        pc = collections.Counter(r[2] for r in lst)
        prov_rows = "".join(f"<tr><td>{esc(pname.get(c, c))}</td><td>{num(v)}</td></tr>" for c, v in pc.most_common(8))
        top_p = [pname.get(c, c) for c, _ in pc.most_common(3)]
        titles = sorted({o for r in lst for o in r[4].split("; ") if any(w in o.lower() for w in words)})
        body = (GD +
                f'          <p class="gd-answer">{num(len(lst))} employers in Canada were approved to hire foreign {esc(lab)} with a positive LMIA from {period}. Most are in {esc(top_p[0])}, {esc(top_p[1])} and {esc(top_p[2])}. This page lists them from the official Government of Canada list published on {pub}.</p>\n' + switch +
                f'          <h2>Where employers hire foreign {esc(lab)}</h2>\n          <div class="gd-tw spc-tw"><table><thead><tr><th>Province</th><th>Employers approved</th></tr></thead><tbody>{prov_rows}</tbody></table></div>\n'
                f'          <p>An employer is counted here when one of its main approved occupations in the official list is: {esc("; ".join(titles))}.</p>\n' + ca_tail(lab) + GD_END +
                jobs_block("ca", kw, "", f"Live {kw} jobs in Canada", "Current openings from our job-search partners. Check each advert for whether the employer hires from abroad.", "ca-lmia-job") + GD +
                f'          <h2>LMIA employers that hired {esc(lab)}</h2>\n          <p>Employers whose main approved occupation is this job come first. The number is the total positions the employer had approved in the period, across all its jobs.</p>\n          {ca_table(lst[:CA_CAP], True)}\n' + shown_note(lst) +
                ca_end("LMIA employers in other jobs and places", all_links(fname)) + GD_END)
        faq = [
            (f"Which employers in Canada hire foreign {lab} with an LMIA?", f"{num(len(lst))} employers on the official positive LMIA list for {period} had {lab} among their main approved occupations. The table on this page shows those with the most approved positions."),
            (f"Which provinces approve the most LMIAs for {lab}?", f"Counting employers, {top_p[0]} comes first, followed by {top_p[1]} and {top_p[2]}."),
            ("Does this list show jobs that are open now?", "No. It is a record of past approvals in the last four published quarters. Always check the employer's current vacancies."),
            ("Who pays for the LMIA?", "The employer applies and pays the processing fee. You should not be asked to pay for an LMIA."),
        ]
        out = render(sh, fname, f"LMIA Employers Hiring {lab.title().replace(' And ', ' and ')} in Canada",
                     f"{num(len(lst))} employers in Canada approved to hire foreign {lab} with a positive LMIA, by province. From the official government list.",
                     "Official Government of Canada list", f"LMIA employers hiring {lab} in Canada", f"Employers approved to hire foreign {lab}.", body, faq,
                     [("Home", ""), ("Canada LMIA employers", "canada-lmia-employers.html"), (lab.capitalize(), fname)], meta["published"])
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sitemap[fname] = max(meta["published"], "2026-11-12")
        n_job += 1
    ex = lambda f: os.path.exists(f)
    browse = ('<h2>Browse LMIA employers</h2>\n          <h3>By province</h3>\n          ' + link_list([(n, f) for n, f, _ in prov_pages if ex(f)]) +
              '\n          <h3>By city</h3>\n          ' + link_list([(n, f) for n, f, _, _ in city_pages if ex(f)]) +
              '\n          <h3>By job</h3>\n          ' + link_list([(lab.capitalize(), f) for lab, f, _, _ in job_pages if ex(f)]))
    set_browse("canada-lmia-employers.html", browse, "<h2>How to use the list in your job search</h2>")
    print("Canada: %d province, %d city and %d job pages" % (n_prov, n_city, n_job))


# ---------------------------------------------------------------- hub block + sitemap
def set_browse(hub, block, before):
    s = open(hub, encoding="utf-8").read()
    new = "<!--sp-browse-->" + block + "<!--/sp-browse-->"
    if "<!--sp-browse-->" in s:
        s = re.sub(r"<!--sp-browse-->.*?<!--/sp-browse-->", lambda m: new, s, flags=re.S)
    elif before in s:
        s = s.replace(before, new + "\n          " + before, 1)
    else:
        print("hub %s: place for the browse block not found" % hub)
        return
    open(hub, "w", encoding="utf-8", newline="\n").write(s)


def update_sitemap(pages):
    s = open("sitemap.xml", encoding="utf-8").read()
    s = "".join(l for l in s.splitlines(True) if not (m := re.search(r"<loc>" + re.escape(SITE) + r"(uk-visa-sponsors-az-[^<]+)</loc>", l)) or os.path.exists(m.group(1)))
    for fname, date in sorted(pages.items()):
        loc = SITE + fname
        line = f"  <url><loc>{loc}</loc><lastmod>{date}</lastmod><priority>0.7</priority></url>"
        rx = re.compile(r"  <url><loc>" + re.escape(loc) + r"</loc>.*?</url>")
        if rx.search(s):
            s = rx.sub(lambda m: line, s)
        else:
            s = s.replace("</urlset>", line + "\n</urlset>")
    open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(s)
    if os.path.exists("sitemap-pages.xml"):  # same list under a second name (Search Console could not read the first)
        open("sitemap-pages.xml", "w", encoding="utf-8", newline="\n").write(s)


failed, sm = 0, {}
for fn in (build_uk, build_ca):
    try:
        fn(sm)
    except Exception as e:  # keep the other country's pages
        failed += 1
        print("SKIPPED %s: %r" % (fn.__name__, e))
if sm:
    update_sitemap(sm)
sys.exit(1 if failed == 2 else 0)
