# Builds the Ireland (employment permits issued to companies, DETE) and Netherlands (IND public register of
# recognised sponsors, work) pages from data/ie and data/nl. Run from the repo root.
# data/ie/all.txt: "Employer name<TAB>permits issued this year"   (from the DETE "permits issued to companies" xlsx)
# data/nl/all.txt: "Organisation<TAB>KVK number"                    (from ind.nl public register Work)
# Reuses the page shell and helpers at the top of tools/build_sponsor_pages.py.
import json, os, re

_src = open(os.path.join(os.path.dirname(__file__), "build_sponsor_pages.py"), encoding="utf-8").read()
exec(_src[:_src.index("# ---------------------------------------------------------------- United Kingdom")])

SWITCH_ALL = [("United Kingdom", "uk-visa-sponsors.html"), ("Canada", "canada-lmia-employers.html"), ("United States", "us-h1b-sponsors.html"),
              ("Ireland", "ireland-work-permit-companies.html"), ("Netherlands", "netherlands-recognised-sponsors.html")]


def switch(on):
    return ('          <p class="sp-switch">' + "".join(f'<span class="on">{n}</span>' if u == on else f'<a href="{u}">{n}</a>' for n, u in SWITCH_ALL) + "</p>\n")


SEARCH_CSS = ('<style>.xs-q{width:100%;box-sizing:border-box;background:#fff;border:1.5px solid #0112ff;border-radius:16px;padding:14px 18px;font:inherit;font-size:1rem;color:#141a52;margin:6px 0 10px}'
              '.xs-q:focus{outline:none;box-shadow:0 0 0 3px rgba(1,18,255,.15)}.xs-st{font-weight:700;color:#5b6290;margin:0 0 8px}.xs-row{display:flex;gap:10px;align-items:center;margin:6px 0 10px}.xs-row .xs-q{margin:0;flex:1;min-width:0}.xs-live{display:flex;align-items:center;justify-content:center;padding:14px 18px;border-radius:16px;white-space:nowrap}@media(max-width:560px){.xs-row{flex-direction:column;align-items:stretch}}</style>\n')


def search_box(data, unit, placeholder, jobs=None):
    # unit: "" (no count column) or e.g. "permit"
    return (SEARCH_CSS +
            f'          <label for="xs-q" class="xs-st">Search by company name</label>\n'
            '          <div class="xs-row">' + f'<input id="xs-q" class="xs-q" type="search" placeholder="{esc(placeholder)}" autocomplete="off">' +
            (f'<a class="btn btn-gold xs-live" href="{jobs}">See live jobs</a>' if jobs else '') + '</div>\n'
            '          <p class="xs-st" id="xs-st" aria-live="polite"></p>\n          <ul class="spc-list" id="xs-list"></ul>\n'
            '          <script>(function(){var q=document.getElementById("xs-q"),st=document.getElementById("xs-st"),ul=document.getElementById("xs-list"),rows=null,t;'
            'var f=function(s){return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();};'
            'var e=function(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;"}[c];});};'
            f'var U="{unit}";'
            'function show(){var v=f(q.value.trim());if(v.length<2){ul.innerHTML="";st.textContent=v?"Type at least 2 letters.":"";return;}'
            'var hit=rows.filter(function(r){return r[2].indexOf(v)>-1;});'
            """var L=function(n){var s=n.replace(/\\b(ltd|limited|unlimited company|unlimited|uc|dac|plc|b\\.v\\.|bv|n\\.v\\.|nv|llp|inc)\\.?$/i,"").replace(/[ .,]+$/,"")||n;return '<a class="xs-co" href="https://www.google.com/search?q='+encodeURIComponent(s+" careers")+'" target="_blank" rel="noopener nofollow">'+e(n)+' <span aria-hidden="true">&#8599;</span></a>';};"""
            'ul.innerHTML=hit.slice(0,100).map(function(r){return "<li>"+L(r[0])+(U?" <i>"+r[1]+" "+U+(r[1]==="1"?"":"s")+"</i>":"")+"</li>";}).join("");'
            'st.textContent=hit.length?(hit.length>100?"Showing 100 of "+hit.length.toLocaleString()+" matches. Type more of the name to narrow it down.":hit.length+(hit.length===1?" match":" matches")):"No company with that name on the list. Try part of the name or the legal name.";}'
            f'function load(){{if(rows)return show();st.textContent="Loading the official list…";fetch("{data}").then(function(r){{return r.text();}}).then(function(s){{rows=s.split("\\n").filter(Boolean).map(function(l){{var p=l.split("\\t");return[p[0],p[1],f(p[0])];}});show();}}).catch(function(){{st.textContent="Could not load the list. Please refresh the page.";}});}}'
            'q.addEventListener("input",function(){clearTimeout(t);t=setTimeout(load,150);});})();</script>\n')


def co(name):
    short = re.sub(r"\b(ltd|limited|unlimited company|unlimited|uc|dac|plc|b\.v\.|bv|n\.v\.|nv|llp|inc)\.?$", "", name, flags=re.I).strip(" .,") or name
    q = short.replace("&", "%26").replace(" ", "+")
    return (f'<a class="xs-co" href="https://www.google.com/search?q={esc(q)}+careers" target="_blank" rel="noopener nofollow">{esc(name)} '
            '<span aria-hidden="true">↗</span></a>')


def li(name, extra=""):
    return f"<li>{co(name)}" + (f" <i>{esc(extra)}</i>" if extra else "") + "</li>"


def update_sitemap(pages):
    s = open("sitemap.xml", encoding="utf-8").read()
    for fname, date in sorted(pages.items()):
        loc = SITE + fname
        line = f"  <url><loc>{loc}</loc><lastmod>{date}</lastmod><priority>0.7</priority></url>"
        rx = re.compile(r"  <url><loc>" + re.escape(loc) + r"</loc>.*?</url>")
        s = rx.sub(lambda m: line, s) if rx.search(s) else s.replace("</urlset>", line + "\n</urlset>")
    open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(s)
    if os.path.exists("sitemap-pages.xml"):
        open("sitemap-pages.xml", "w", encoding="utf-8", newline="\n").write(s)


# ---------------------------------------------------------------- Ireland
IE_HUB = "ireland-work-permit-companies.html"
IE_GROUPS = [
    ("healthcare", "Hospitals, Nursing Homes and Care Providers", "hospitals, nursing homes and care providers", "nurse",
     r"hospital|nursing home|\bcare\b|caring|carers|healthcare|\bhealth|medical|clinic|nursing|\bhse\b|doctor|dental|pharmacy|homecare|home care|hospice|disabilit"),
    ("meat-food", "Meat, Food and Drink Companies", "meat, food and drink companies", "meat processing",
     r"\bmeats?\b|beef|\bpork|poultry|chicken|\bfoods?\b|dairy|\bfish|seafood|bakery|bakeries|mushroom|\bfarms?\b|agri|drinks|brewer|distill|abp\b|kepak|dawn"),
    ("technology", "Technology and Software Companies", "technology and software companies", "software",
     r"software|technolog|digital|\bdata\b|systems|cyber|\bit\b|computing|\btech|\bai\b|google|amazon|microsoft|meta platforms|salesforce|\bintel\b|apple|oracle|\bibm\b|workday|stripe|tiktok|linkedin|analytics|cloud|games"),
    ("hotels-restaurants", "Hotels, Restaurants and Catering", "hotels, restaurants and catering companies", "chef",
     r"hotel|restaurant|catering|\bcafe|\bbar\b|kitchen|takeaway|hospitality|\binn\b|pizza|grill|tandoori|curry|spice|bistro|tavern"),
    ("construction-engineering", "Construction and Engineering Companies", "construction and engineering companies", "engineer",
     r"construct|engineer|\bbuild|contract|civil|electrical|mechanical|plumb|roof|steel|fabricat|infrastructure"),
    ("pharma", "Pharma, Biotech and Medical Device Companies", "pharma, biotech and medical device companies", "pharmaceutical",
     r"pharmaceutic|biotech|\bbio|medical device|therapeutics|life sciences|laborator|diagnostic|pfizer|abbvie|eli lilly|janssen|regeneron|amgen|boston scientific|medtronic|stryker|takeda|\bmsd\b|merck|astrazeneca|novartis|\bicon\b"),
    ("universities-research", "Universities, Colleges and Research", "universities, colleges and research organisations", "research",
     r"universit|college|institute of technology|\btrinity|school|research|academy|education|\btus\b|\batu\b|\bmtu\b"),
    ("finance", "Banks, Finance and Accounting Firms", "banks, finance and accounting firms", "finance",
     r"\bbank|financ|capital|insurance|accountan|\bfunds?\b|invest|payments|\basset|credit|deloitte|kpmg|\bpwc\b|pricewaterhouse|ernst|accenture|\bfx\b"),
]
IE_SRC = ('<h2>Sources</h2><ul class="gd-src">'
          '<li><a href="https://www.gov.ie/en/department-of-enterprise-tourism-and-employment/publications/employment-permit-statistics-2026/" target="_blank" rel="noopener">gov.ie: Employment permit statistics 2026 (Department of Enterprise, Tourism and Employment)</a></li>'
          '<li><a href="https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/general-employment-permit/" target="_blank" rel="noopener">enterprise.gov.ie: General Employment Permit</a></li>'
          '<li><a href="https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/" target="_blank" rel="noopener">enterprise.gov.ie: Critical Skills Employment Permit</a></li></ul>\n'
          '          <p class="gd-src">U Hirable is not connected to the Irish government. The figures come from the official file of permits issued to companies, so always confirm with the employer and on enterprise.gov.ie before you rely on them.</p>\n')
IE_NOTE = ('          <p class="gd-note"><b>A permit record is not a job offer.</b> This list shows employers that received employment permits for workers from outside the EEA this year. '
           'It does not mean they are hiring now, or that a particular job comes with a permit. Always check the job ad or ask the employer.</p>\n')


def build_ie(sm):
    meta = json.load(open("data/ie/meta.json"))
    rows = [l.rstrip("\n").split("\t") for l in open("data/ie/all.txt", encoding="utf-8") if l.strip()]
    rows = [(a, int(b)) for a, b in rows]
    date, period = nice_date(meta["updated"]), meta["months"]
    sh = shell("uk-visa-sponsors.html")
    by_n = sorted(rows, key=lambda r: (-r[1], r[0].lower()))
    plural = lambda n: f"{num(n)} permit" + ("" if n == 1 else "s")
    groups = []
    for sl, lab, phrase, kw, pat in IE_GROUPS:
        rx = re.compile(pat, re.I)
        g = [r for r in by_n if rx.search(r[0])]
        groups.append((sl, lab, phrase, kw, g))
    glinks = link_list([(f"{lab} ({num(len(g))})", f"ireland-work-permit-companies-{sl}.html") for sl, lab, _, _, g in groups])
    # sector pages
    for sl, lab, phrase, kw, g in groups:
        fname = f"ireland-work-permit-companies-{sl}.html"
        n, p = len(g), sum(r[1] for r in g)
        top = g[:3]
        body = (GD +
                f'          <p class="gd-answer">{num(n)} {esc(phrase)} received Irish employment permits for workers from outside the EEA from {esc(period)}, {num(p)} permits in total. This page lists them all, with the number of permits each one received, from the official file published on {date}.</p>\n'
                + switch(IE_HUB) +
                f'          <h2>The {min(10, n)} that received the most permits</h2>\n'
                '          <div class="gd-tw spc-tw"><table><thead><tr><th>Employer</th><th>Permits issued</th></tr></thead><tbody>' +
                "".join(f"<tr><td>{co(a)}</td><td>{num(b)}</td></tr>" for a, b in g[:10]) + "</tbody></table></div>\n"
                '          <p>We group employers by words in their registered name, so this is a practical list and not an official classification. A few names may match by coincidence, and employers that trade under a different name will be missing. <a href="ireland-work-permit-companies.html">Search the full list</a> to check any company.</p>\n'
                + IE_NOTE +
                f'          <h2>All {num(n)} employers, by number of permits</h2>\n'
                '          <ul class="spc-list">' + "".join(li(a, plural(b)) for a, b in g) + "</ul>\n"
                f'          {{FAQ}}\n          <h2>Other sectors</h2>\n          {link_list([(l2, f"ireland-work-permit-companies-{s2}.html") for s2, l2, _, _, _ in groups if s2 != sl])}\n          ' + IE_SRC + GD_END)
        faq = [
            (f"Which {phrase} in Ireland hire workers from abroad?", f"{num(n)} of them received employment permits from {period}. The ones with the most were " + ", ".join(a for a, _ in top) + "."),
            ("Does a company on this list have a job for me?", "Not necessarily. The list shows permits already issued. It does not show vacancies, so check each employer's careers page and the job ad."),
            ("Who applies for the employment permit?", "Either the employer or the worker can apply to the Department of Enterprise, Tourism and Employment, and an application must be made at least 12 weeks before the job starts."),
        ]
        out = render(sh, fname, f"{lab} in Ireland That Sponsor Work Permits ({YEAR})",
                     f"List of {num(n)} {phrase} in Ireland that received employment permits for non-EEA workers in {YEAR}, with permit counts. Free, from the official DETE file updated {date}.",
                     "Official Irish government data", f"{lab} in Ireland that sponsor work permits", f"Employers that received employment permits from {period}.", body, faq,
                     [("Home", ""), ("Ireland work permit companies", IE_HUB), (lab, fname)], meta["updated"], "2026-11-15")
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sm[fname] = "2026-11-15"
    # hub
    total = meta["permits"]
    body = (GD +
            f'          <p class="gd-answer">{num(meta["companies"])} employers in Ireland received employment permits for workers from outside the EEA from {esc(period)}, {num(total)} permits in total. Search them all here by company name. The list comes from the official file of the Department of Enterprise, Tourism and Employment, published on {date}.</p>\n'
            + switch(IE_HUB) + search_box("data/ie/all.txt", "permit", "e.g. HSE, Dawn Meats, Google") + IE_NOTE + GD_END +
            GD +
            '          <h2>Browse employers by sector</h2>\n          ' + glinks + "\n"
            '          <h2>The 25 employers with the most permits this year</h2>\n'
            '          <div class="gd-tw spc-tw"><table><thead><tr><th>Employer</th><th>Permits issued</th></tr></thead><tbody>' +
            "".join(f"<tr><td>{co(a)}</td><td>{num(b)}</td></tr>" for a, b in by_n[:25]) + "</tbody></table></div>\n"
            '          <h2>The two main work permits</h2>\n'
            '          <ul>\n'
            '            <li><b>General Employment Permit.</b> Covers most jobs, unless the job is on the official list of ineligible occupations. It can be granted for a 12-month contract.</li>\n'
            '            <li><b>Critical Skills Employment Permit.</b> For jobs on the Critical Skills Occupations List, such as ICT, engineering, science and medicine, and for some other well-paid jobs. It needs a job offer of at least 2 years.</li>\n'
            '          </ul>\n'
            '          <p>Either you or the employer can apply, and the application must be made at least 12 weeks before the job starts. Salary rules and the occupation lists change, so check the current rules on enterprise.gov.ie.</p>\n'
            '          <h2>How to use this list in your job search</h2>\n          <ol class="gd-steps">\n'
            '            <li><b>Start with your sector.</b> Open the sector that matches your job and note the employers with the most permits. They hire from abroad again and again.</li>\n'
            '            <li><b>Go to their careers page.</b> Apply on the employer\'s own site, and look for the words "employment permit" or "visa sponsorship" in the ad.</li>\n'
            '            <li><b>Check the permit type.</b> Make sure your job and salary fit a General or Critical Skills permit before you apply.</li>\n'
            '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a permit.</li>\n          </ol>\n'
            '          {FAQ}\n          ' + IE_SRC + GD_END)
    faq = [
        ("Which companies in Ireland sponsor work permits?", f"{num(meta['companies'])} employers received employment permits from {period}. You can search all of them on this page by company name."),
        ("Which employers get the most permits?", "This year the most permits went to " + ", ".join(a for a, _ in by_n[:3]) + "."),
        ("Does being on this list mean the company is hiring?", "No. It shows permits already issued this year. It does not show vacancies, so always check the employer's current jobs."),
        ("Who applies for an Irish employment permit?", "Either the employer or the worker can apply to the Department of Enterprise, Tourism and Employment, at least 12 weeks before the job starts."),
        ("How often is the list updated?", "The Department publishes a new file every month, covering the year so far. We refresh this page from it."),
    ]
    out = render(sh, IE_HUB, f"Companies in Ireland That Sponsor Work Permits ({YEAR}): Search {num(meta['companies'])}",
                 f"Search {num(meta['companies'])} employers in Ireland that received employment permits for non-EEA workers in {YEAR}, with permit counts and sectors. Free, from the official DETE file updated {date}.",
                 "Official Irish government data", "Companies in Ireland that sponsor work permits", "Check if an employer in Ireland has hired workers from abroad.", body, faq,
                 [("Home", ""), ("Ireland work permit companies", IE_HUB)], meta["updated"], "2026-11-15")
    open(IE_HUB, "w", encoding="utf-8", newline="\n").write(out)
    sm[IE_HUB] = "2026-11-15"
    print("Ireland: hub +", len(groups), "sector pages")


# ---------------------------------------------------------------- Netherlands
NL_HUB = "netherlands-recognised-sponsors.html"
NL_GROUPS = [
    ("technology", "Technology and Software Companies", "technology and software companies", "software",
     r"software|technolog|digital|\bdata\b|systems|cyber|\bit\b|\bict\b|computing|\btech|\bai\b|google|amazon|microsoft|booking\.com|adyen|analytics|cloud|\bapps?\b|games"),
    ("engineering", "Engineering and Manufacturing Companies", "engineering and manufacturing companies", "engineer",
     r"engineer|techniek|machine|industr|manufactur|staal|metaal|automation|automatiser|semiconductor|asml|robot|fabriek|\bsteel"),
    ("universities-research", "Universities and Research Institutes", "universities and research institutes", "research",
     r"universit|hogeschool|research|onderzoek|instituut|institute|academ|school|college|\btno\b|stichting.*(onderzoek|wetenschap)"),
    ("healthcare-life-sciences", "Hospitals, Healthcare and Life Sciences", "hospitals, healthcare and life sciences organisations", "healthcare",
     r"ziekenhuis|hospital|medisch|medical|health|\bzorg|pharma|biotech|\bbio|therapeut|clinic|kliniek|\bumc\b|diagnost|life sciences|\blab"),
    ("finance", "Banks, Finance and Accounting Firms", "banks, finance and accounting firms", "finance",
     r"\bbank|financ|capital|insurance|verzeker|invest|payments|\basset|\bfunds?\b|accountan|trading|deloitte|kpmg|\bpwc\b|ernst"),
    ("consulting-recruitment", "Consulting, Recruitment and Payroll Companies", "consulting, recruitment and payroll companies", "consultant",
     r"consult|recruit|staffing|payroll|detacher|uitzend|talent|employ|interim|werving|\bhr\b|human resources"),
    ("logistics", "Logistics and Transport Companies", "logistics and transport companies", "logistics",
     r"logistic|transport|shipping|cargo|freight|airline|\bklm\b|maritime|vervoer|expeditie|supply chain"),
    ("food-hospitality", "Food, Restaurants and Hotels", "food, restaurant and hotel companies", "chef",
     r"restaurant|hotel|catering|\bfoods?\b|horeca|cuisine|kitchen|keuken|sushi|bakker|\bchef"),
]
NL_SRC = ('<h2>Sources</h2><ul class="gd-src">'
          '<li><a href="https://ind.nl/en/public-register-recognised-sponsors/public-register-work" target="_blank" rel="noopener">IND: Public register Work (recognised sponsors)</a></li>'
          '<li><a href="https://ind.nl/en/news/fees-and-required-amounts-for-2026-known" target="_blank" rel="noopener">IND: Fees and required amounts for 2026</a></li></ul>\n'
          '          <p class="gd-src">U Hirable is not connected to the IND. The IND updates its register once a month, so always confirm a company on ind.nl before you rely on it.</p>\n')
NL_NOTE = ('          <p class="gd-note"><b>Recognition is not a job offer.</b> Being on the register means the organisation is allowed to apply for residence permits for highly skilled migrants and other workers. '
           'It does not mean it is hiring now. Always check the job ad or ask the employer.</p>\n')


def build_nl(sm):
    meta = json.load(open("data/nl/meta.json"))
    rows = [l.rstrip("\n").split("\t") for l in open("data/nl/all.txt", encoding="utf-8") if l.strip()]
    date, n_all = nice_date(meta["updated"]), meta["orgs"]
    sh = shell("uk-visa-sponsors.html")
    groups = []
    for sl, lab, phrase, kw, pat in NL_GROUPS:
        rx = re.compile(pat, re.I)
        groups.append((sl, lab, phrase, kw, [r for r in rows if rx.search(r[0])]))
    glinks = link_list([(f"{lab} ({num(len(g))})", f"netherlands-recognised-sponsors-{sl}.html") for sl, lab, _, _, g in groups])
    for sl, lab, phrase, kw, g in groups:
        fname = f"netherlands-recognised-sponsors-{sl}.html"
        n = len(g)
        body = (GD +
                f'          <p class="gd-answer">{num(n)} {esc(phrase)} are recognised sponsors of the IND for work and highly skilled migrants. That means they can hire people from outside the EU through the faster IND procedure. This page lists them all, from the official register updated on {date}.</p>\n'
                + switch(NL_HUB) +
                '          <p>We group organisations by words in their registered name, so this is a practical list and not an official classification. A few names may match by coincidence, and companies that trade under a different name will be missing. <a href="netherlands-recognised-sponsors.html">Search the full register</a> to check any company.</p>\n'
                + NL_NOTE +
                f'          <h2>All {num(n)} recognised sponsors, A to Z</h2>\n'
                '          <ul class="spc-list">' + "".join(li(a) for a, _ in g) + "</ul>\n"
                f'          {{FAQ}}\n          <h2>Other sectors</h2>\n          {link_list([(l2, f"netherlands-recognised-sponsors-{s2}.html") for s2, l2, _, _, _ in groups if s2 != sl])}\n          ' + NL_SRC + GD_END)
        faq = [
            (f"Which {phrase} in the Netherlands sponsor highly skilled migrants?", f"{num(n)} of them are on the IND public register of recognised sponsors for work, updated on {date}. This page lists them all."),
            ("Does a company on this list have a job for me?", "Not necessarily. The register shows who is allowed to sponsor. It does not show vacancies, so check each employer's careers page."),
            ("Why does the employer need to be a recognised sponsor?", "For the highly skilled migrant permit, only an IND-recognised sponsor can apply for you. If the company is not on the register, it cannot hire you on that permit."),
        ]
        out = render(sh, fname, f"{lab} in the Netherlands That Sponsor Visas ({YEAR})",
                     f"List of {num(n)} {phrase} that are IND recognised sponsors for highly skilled migrants in the Netherlands. Free, from the official IND register updated {date}.",
                     "Official IND register", f"{lab} in the Netherlands that sponsor visas", f"IND recognised sponsors for work, {date}.", body, faq,
                     [("Home", ""), ("Netherlands recognised sponsors", NL_HUB), (lab, fname)], meta["updated"], "2026-11-15")
        open(fname, "w", encoding="utf-8", newline="\n").write(out)
        sm[fname] = "2026-11-15"
    body = (GD +
            f'          <p class="gd-answer">To hire you as a highly skilled migrant (kennismigrant), a Dutch employer must be a recognised sponsor of the IND. Search all {num(n_all)} recognised sponsors for work here by company name. The list comes from the official IND register, updated on {date}.</p>\n'
            + switch(NL_HUB) + search_box("data/nl/all.txt", "", "e.g. ASML, Booking.com, Philips") + NL_NOTE +
            '          <h2>Browse recognised sponsors by sector</h2>\n          ' + glinks + "\n"
            '          <h2>Minimum salary for a highly skilled migrant in 2026</h2>\n'
            '          <div class="gd-tw spc-tw"><table><thead><tr><th>Who</th><th>Gross salary per month</th></tr></thead><tbody>'
            '<tr><td>30 years or older</td><td>€5,942</td></tr><tr><td>Under 30</td><td>€4,357</td></tr><tr><td>Reduced criterion (for example, recent graduates in the Netherlands)</td><td>€3,122</td></tr>'
            '</tbody></table></div>\n'
            '          <p>The IND updates these amounts every January. Check the current figures on ind.nl before you negotiate an offer.</p>\n'
            '          <h2>How to use the register in your job search</h2>\n          <ol class="gd-steps">\n'
            '            <li><b>Check the employer before you apply.</b> If a company offers you a highly skilled migrant job and it is not on the register, it cannot apply for your permit.</li>\n'
            '            <li><b>Start with your sector.</b> Open the sector that matches your job, then look for vacancies on each employer\'s own careers page.</li>\n'
            '            <li><b>Check the salary.</b> The offer must meet the IND salary criterion for your age.</li>\n'
            '            <li><b>Never pay for a job.</b> A real employer does not charge you for a job offer or a permit.</li>\n          </ol>\n'
            '          {FAQ}\n          ' + NL_SRC + GD_END)
    faq = [
        ("Which companies in the Netherlands can sponsor a work visa?", f"Organisations recognised by the IND. There are {num(n_all)} recognised sponsors for work on the public register updated on {date}, and you can search them all on this page."),
        ("What is a recognised sponsor (erkend referent)?", "A company, school or organisation that the IND has recognised. For the highly skilled migrant permit, only a recognised sponsor can apply for you."),
        ("Does being on the register mean the company is hiring?", "No. The register shows who is allowed to sponsor. It does not show vacancies, so always check the employer's current jobs."),
        ("How often is the register updated?", "The IND updates its public registers once a month."),
    ]
    out = render(sh, NL_HUB, f"Netherlands Recognised Sponsors List ({YEAR}): Search {num(n_all)} IND Sponsors",
                 f"Search all {num(n_all)} IND recognised sponsors that can hire highly skilled migrants in the Netherlands, by company name and sector. Free, from the official register updated {date}.",
                 "Official IND register", "Netherlands recognised sponsors (IND)", "Check if a Dutch employer can sponsor your highly skilled migrant visa.", body, faq,
                 [("Home", ""), ("Netherlands recognised sponsors", NL_HUB)], meta["updated"], "2026-11-15")
    open(NL_HUB, "w", encoding="utf-8", newline="\n").write(out)
    sm[NL_HUB] = "2026-11-15"
    print("Netherlands: hub +", len(groups), "sector pages")


sm = {}
build_ie(sm)
build_nl(sm)
update_sitemap(sm)
