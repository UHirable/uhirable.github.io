#!/usr/bin/env python3
"""Add new events: events.js entry, one page per event, sitemap and search index.

Each event page is a copy of an existing event page with its own details swapped in.
The share image og-event-<slug>.png must exist before running.
Usage: python3 tools/add_events.py
"""
import glob, html, json, os, re, sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(SITE)
B = "https://uhirable.com/"
TODAY = "2026-11-21"
TEMPLATE = "event-hr-screening-safety-strategy-conference.html"
T = {"name": "HR Screening, Safety & Strategy Conference", "date": "14 Jan 2027",
     "city": "Houston, TX, USA", "slug": "hr-screening-safety-strategy-conference",
     "desc": "One-day conference on background screening, workplace safety and hiring strategy for HR and talent teams."}
MON = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}

# Details confirmed on the organiser's page or announcement on 21 Nov 2026.
NEW = [
    {"name": "Diversity and Inclusion Virtual Career Fair", "date": "1 Dec 2026", "month": "2026-12",
     "city": "Online, USA", "region": "North America", "audience": "seekers", "format": "Online",
     "desc": "Free online career fair on the CareerEco platform for students, recent graduates and experienced job seekers. Chat live with employers about jobs and internships, 11:00 AM to 3:00 PM ET.",
     "link": "https://www.nhpr.org/community-calendar/event/diversity-and-inclusion-virtual-career-fair-30-10-2026-21-40-16"},
    {"name": "Made in Berlin Job Fair", "date": "3 Dec 2026", "month": "2026-12",
     "city": "Berlin, Germany", "region": "Europe", "audience": "seekers", "format": "In person",
     "desc": "Job and career fair at Ludwig-Erhard-Haus for university students and graduates looking for an internship or a first job. Open 10 a.m. to 4 p.m., free for students and graduates up to 5 years after graduation.",
     "link": "https://www.berlin.de/en/trade-fairs/3687693-7918797-made-in-berlin-job-fair.en.html"},
    {"name": "Hire Canada Virtual Job Fair & Training Expo", "date": "9 Dec 2026", "month": "2026-12",
     "city": "Online, Canada", "region": "North America", "audience": "seekers", "format": "Online",
     "desc": "Free virtual job fair for candidates: meet employers, explore training options and interview live online, 11 AM to 3 PM EST.",
     "link": "https://www.todocanada.ca/city/london/event/hire-canada-virtual-job-fair-training-expo/"},
]

slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
esc = lambda s: html.escape(s, quote=True)


def dates(d):
    m = re.fullmatch(r"(\d{1,2})(?:[–-](\d{1,2}))? (\w{3}) (\d{4})", d)
    a, b, mo, y = m.groups()
    f = lambda x: "%s-%02d-%02d" % (y, MON[mo], int(x))
    return f(a), f(b or a)


def js_line(e):
    q = lambda s: json.dumps(s, ensure_ascii=True)
    return ("  { name:%s, date:%s, month:%s, city:%s, region:%s, audience:%s, format:%s, desc:%s, link:%s },"
            % tuple(q(e[k]) for k in "name date month city region audience format desc link".split()))


def page(e):
    s = open(TEMPLATE, encoding="utf-8").read()
    sl = slug(e["name"])
    lines = s.split("\n")
    out = []
    for ln in lines:
        if 'id="ld-crumbs"' in ln:
            crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": B},
                {"@type": "ListItem", "position": 2, "name": "Events", "item": B + "events.html"},
                {"@type": "ListItem", "position": 3, "name": e["name"], "item": B + "event-" + sl + ".html"}]}
            ln = '  <script type="application/ld+json" id="ld-crumbs">' + json.dumps(crumbs, ensure_ascii=False).replace("</", "<\\/") + "</script>"
        elif 'id="ld-schema"' in ln:
            d = dates(e["date"])
            parts = [p.strip() for p in e["city"].split(",")]
            ld = {"@context": "https://schema.org", "@type": "Event", "name": e["name"], "startDate": d[0], "endDate": d[1],
                  "eventStatus": "https://schema.org/EventScheduled",
                  "eventAttendanceMode": "https://schema.org/" + ("OnlineEventAttendanceMode" if e["format"] == "Online" else "OfflineEventAttendanceMode"),
                  "location": ({"@type": "VirtualLocation", "url": e["link"]} if e["format"] == "Online" else
                               {"@type": "Place", "name": e["city"],
                                "address": {"@type": "PostalAddress", "addressLocality": parts[0], "addressCountry": parts[-1]}}),
                  "description": e["desc"], "image": [B + "og-event-" + sl + ".png"], "url": B + "event-" + sl + ".html",
                  "organizer": {"@type": "Organization", "name": e["name"], "url": e["link"]}}
            ln = '  <script type="application/ld+json" id="ld-schema">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>"
        else:
            ln = (ln.replace(esc(T["name"]), esc(e["name"])).replace(T["name"], esc(e["name"]))
                    .replace(T["desc"], esc(e["desc"])).replace(T["date"], e["date"])
                    .replace(T["city"], esc(e["city"])).replace(T["slug"], sl))
        out.append(ln)
    s = "\n".join(out)
    for left in ("Houston", "HR Screening", "daywithdisa", "14 Jan", "background screening"):
        assert left not in s, (sl, left)
    assert os.path.exists("og-event-" + sl + ".png"), "missing share image for " + sl
    open("event-" + sl + ".html", "w", encoding="utf-8").write(s)
    return sl


def main():
    js = open("events.js", encoding="utf-8").read()
    idx = open("search-index.js", encoding="utf-8").read()
    sm = open("sitemap.xml", encoding="utf-8").read()
    added = []
    for e in NEW:
        if json.dumps(e["name"]) in js:
            continue
        sl = page(e)
        # keep the list in date order: put it before the first event of a later month
        lines = js.split("\n")
        pos = next(i for i, l in enumerate(lines)
                   if (m := re.search(r'month:"([^"]*)"', l)) and (m.group(1) == "" or m.group(1) > e["month"]))
        lines.insert(pos, js_line(e))
        # inside the month, order by the first day
        mi = [i for i, l in enumerate(lines) if 'month:"%s"' % e["month"] in l]
        blk = sorted((lines[i] for i in mi), key=lambda l: int(re.search(r'date:"(\d+)', l).group(1)))
        lines[mi[0]:mi[-1] + 1] = blk
        js = "\n".join(lines)
        entry = json.dumps({"t": e["name"], "d": e["city"] + " · " + e["date"], "u": "event-" + sl + ".html", "k": "Event"},
                           ensure_ascii=False, separators=(",", ":"))
        anchor = '{"t":"HR Screening, Safety & Strategy Conference"'
        assert anchor in idx
        idx = idx.replace(anchor, entry + "," + anchor, 1)
        url = "  <url><loc>%sevent-%s.html</loc><lastmod>%s</lastmod><priority>0.6</priority></url>\n" % (B, sl, TODAY)
        sm = sm.replace("</urlset>", url + "</urlset>")
        added.append(sl)
    if not added:
        print("nothing to add"); return
    open("events.js", "w", encoding="utf-8").write(js)
    open("search-index.js", "w", encoding="utf-8").write(idx)
    sm = re.sub(r"(<loc>%sevents\.html</loc><lastmod>)[^<]*" % re.escape(B), r"\g<1>" + TODAY, sm)
    open("sitemap.xml", "w", encoding="utf-8").write(sm)
    # every page loads events.js with a version number; raise it so browsers fetch the new list
    n = 0
    for f in glob.glob("*.html"):
        s = open(f, encoding="utf-8").read()
        m = re.search(r"events\.js\?v=(\d+)", s)
        if m:
            s2 = re.sub(r"events\.js\?v=\d+", "events.js?v=%d" % VER, s)
            if s2 != s:
                open(f, "w", encoding="utf-8").write(s2); n += 1
    print("added", added, "| pages with new events.js version:", n)


if __name__ == "__main__":
    cur = max(int(m.group(1)) for f in glob.glob("*.html")
              for m in [re.search(r"events\.js\?v=(\d+)", open(f, encoding="utf-8").read())] if m)
    VER = cur + 1 if "--same-version" not in sys.argv else cur
    main()
