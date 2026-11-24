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
TODAY = "2026-11-24"
TEMPLATE = "event-hr-screening-safety-strategy-conference.html"
T = {"name": "HR Screening, Safety & Strategy Conference", "date": "14 Jan 2027",
     "city": "Houston, TX, USA", "slug": "hr-screening-safety-strategy-conference",
     "desc": "One-day conference on background screening, workplace safety and hiring strategy for HR and talent teams."}
MON = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}

# Details confirmed on the organisers' pages on 24 Nov 2026 (job fairs for job seekers, UK and Canada).
NEW = [
    {"name": "Vancouver Career Fair & Newcomer Fair", "date": "9 Dec 2026", "month": "2026-12", "city": "Vancouver, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Pan Pacific Vancouver, with Newcomer Fair Canada at the same venue on the same day. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/vancouver-career-fair-and-training-expo-canada-december-9-2026-tickets-1979397747948"},
    {"name": "Job Fair Toronto (North York)", "date": "10 Dec 2026", "month": "2026-12", "city": "Toronto, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free job fair by Canada Job Expo at North York Memorial Hall, 5110 Yonge Street, 11:00 AM to 3:00 PM. Open to all job seekers, including newcomers, students and recent graduates.", "link": "https://www.eventbrite.com/e/job-fair-toronto-december-10th-2026-free-admission-tickets-1981374247712"},
    {"name": "Toronto Career Fair and Training Expo", "date": "13 Jan 2027", "month": "2027-01", "city": "Toronto, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Metro Toronto Convention Centre. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/toronto-career-fair-and-training-expo-canada-january-13-2027-tickets-2002647359161"},
    {"name": "Edmonton Career Fair and Training Expo", "date": "21 Jan 2027", "month": "2027-01", "city": "Edmonton, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Edmonton Convention Centre. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/edmonton-career-fair-and-training-expo-canada-january-21-2027-tickets-2002623591070"},
    {"name": "Calgary Career Fair and Training Expo", "date": "28 Jan 2027", "month": "2027-01", "city": "Calgary, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at BMO Centre at Stampede Park. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/calgary-career-fair-and-training-expo-canada-january-28-2027-tickets-2002582363758"},
    {"name": "Ottawa Career Fair and Training Expo", "date": "4 Feb 2027", "month": "2027-02", "city": "Ottawa, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Rogers Centre Ottawa. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/ottawa-career-fair-and-training-expo-canada-february-4-2027-tickets-2002639704265"},
    {"name": "Winnipeg Career Fair and Training Expo", "date": "11 Feb 2027", "month": "2027-02", "city": "Winnipeg, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at RBC Convention Centre Winnipeg. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/winnipeg-career-fair-and-training-expo-canada-february-11-2027-tickets-2002653422296"},
    {"name": "Vancouver Career Fair and Training Expo", "date": "18 Feb 2027", "month": "2027-02", "city": "Vancouver, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Pan Pacific Vancouver. Meet employers and training schools in person. 11:00 AM to 3:00 PM.", "link": "https://www.eventbrite.ca/e/vancouver-career-fair-and-training-expo-canada-february-18-2027-tickets-2002649834565"},
    {"name": "Halifax Career Fair and Training Expo", "date": "25 Feb 2027", "month": "2027-02", "city": "Halifax, Canada", "region": "North America", "audience": "seekers", "format": "In person", "desc": "Free career fair and training expo by Career Fair Canada at Halifax Convention Centre. Meet employers and training schools in person. Doors open 10:00 AM.", "link": "https://www.eventbrite.ca/e/halifax-career-fair-and-training-expo-canada-february-25-2027-tickets-2002633929994"},
    {"name": "Northampton Careers Fair", "date": "24 Feb 2027", "month": "2027-02", "city": "Northampton, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Northampton Guildhall, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/northampton-careers-fair-2/"},
    {"name": "Reading Careers Fair", "date": "24 Feb 2027", "month": "2027-02", "city": "Reading, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Pentahotel Reading, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/reading-careers-fair-2/"},
    {"name": "Newport Careers Fair", "date": "25 Feb 2027", "month": "2027-02", "city": "Newport, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Riverfront Theatre, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/newport-careers-fair-2/"},
    {"name": "Wolverhampton Careers Fair", "date": "25 Feb 2027", "month": "2027-02", "city": "Wolverhampton, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at The Darlington, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/wolverhampton-careers-fair-2/"},
    {"name": "Swindon Careers Fair", "date": "26 Feb 2027", "month": "2027-02", "city": "Swindon, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at STEAM Museum, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/swindon-careers-fair-2/"},
    {"name": "Bedford Careers Fair", "date": "3 Mar 2027", "month": "2027-03", "city": "Bedford, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Bedford Corn Exchange, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/bedford-careers-fair-2/"},
    {"name": "Plymouth Careers Fair", "date": "3 Mar 2027", "month": "2027-03", "city": "Plymouth, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Duke of Cornwall Hotel, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/plymouth-careers-fair-2/"},
    {"name": "Exeter Careers Fair", "date": "4 Mar 2027", "month": "2027-03", "city": "Exeter, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Exeter Rougemont Hotel, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/exeter-careers-fair-2/"},
    {"name": "Leicester Careers Fair", "date": "4 Mar 2027", "month": "2027-03", "city": "Leicester, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at The City Rooms, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/leicester-careers-fair-2/"},
    {"name": "Sheffield Careers Fair", "date": "5 Mar 2027", "month": "2027-03", "city": "Sheffield, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Sheffield Town Hall, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/sheffield-careers-fair-2/"},
    {"name": "Stoke Careers Fair", "date": "10 Mar 2027", "month": "2027-03", "city": "Stoke, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Vale Park Stadium, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/stoke-careers-fair/"},
    {"name": "Sunderland Careers Fair", "date": "10 Mar 2027", "month": "2027-03", "city": "Sunderland, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Stadium of Light, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/sunderland-careers-fair-2/"},
    {"name": "Middlesbrough Careers Fair", "date": "11 Mar 2027", "month": "2027-03", "city": "Middlesbrough, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Riverside Stadium, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/middlesbrough-careers-fair-2/"},
    {"name": "Leeds Careers Fair", "date": "11 Mar 2027", "month": "2027-03", "city": "Leeds, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Elland Road, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/leeds-careers-fair-3/"},
    {"name": "Coventry Careers Fair", "date": "12 Mar 2027", "month": "2027-03", "city": "Coventry, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Coventry Transport Museum, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/coventry-careers-fair-2/"},
    {"name": "Derby Careers Fair", "date": "12 Mar 2027", "month": "2027-03", "city": "Derby, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Museum of Making at Derby Silk Mill, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/derby-careers-fair-2/"},
    {"name": "Guildford Careers Fair", "date": "12 Mar 2027", "month": "2027-03", "city": "Guildford, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at G Live, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/guildford-careers-fair-2/"},
    {"name": "Southend Careers Fair", "date": "17 Mar 2027", "month": "2027-03", "city": "Southend, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at The Palace Hotel, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/southend-careers-fair-2/"},
    {"name": "York Careers Fair", "date": "17 Mar 2027", "month": "2027-03", "city": "York, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Novotel York Centre, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/york-careers-fair-2/"},
    {"name": "Colchester Careers Fair", "date": "18 Mar 2027", "month": "2027-03", "city": "Colchester, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Colchester Town Hall, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/colchester-careers-fair-2/"},
    {"name": "Bristol Careers Fair", "date": "19 Mar 2027", "month": "2027-03", "city": "Bristol, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Bristol Beacon, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/bristol-careers-fair-2/"},
    {"name": "Manchester Careers Fair", "date": "19 Mar 2027", "month": "2027-03", "city": "Manchester, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Manchester Conference Centre, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/manchester-careers-fair-2/"},
    {"name": "Dundee Careers Fair", "date": "23 Mar 2027", "month": "2027-03", "city": "Dundee, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Malmaison Dundee, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/dundee-careers-fair/"},
    {"name": "Aberdeen Careers Fair", "date": "24 Mar 2027", "month": "2027-03", "city": "Aberdeen, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Pittodrie Stadium, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/aberdeen-careers-fair-2/"},
    {"name": "Perth Careers Fair", "date": "25 Mar 2027", "month": "2027-03", "city": "Perth, UK", "region": "Europe", "audience": "seekers", "format": "In person", "desc": "Free careers fair by The UK Careers Fair at Perth Theatre and Concert Hall, 10 AM to 2 PM. Meet local employers face to face. Entry is free for candidates.", "link": "https://www.ukcareersfair.com/event/perth-careers-fair/"},
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
        for i, l in zip(mi, blk):  # the month's lines may not sit together, so swap them in place
            lines[i] = l
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
