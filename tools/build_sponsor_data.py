# Builds the search data for uk-visa-sponsors.html and canada-lmia-employers.html
# from the two official sources. Run by .github/workflows/sponsor-data.yml.
# It only writes files under data/. If a source looks wrong, that country is skipped
# and its existing data is left untouched.
import csv, io, json, os, re, sys, collections, datetime, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (uhirable.github.io monthly data refresh)"}
TODAY = datetime.date.today().isoformat()
UK_PAGE = "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
CA_PAGE = "https://open.canada.ca/data/en/dataset/90fed587-1364-4f33-a9ee-208181dc0b97"


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r:
        return r.read()


def clean(s):
    return re.sub(r"\s+", " ", str(s or "").replace("\t", " ")).strip()


def nice_place(s):
    s = clean(s)
    return s.title() if s and (s.isupper() or s.islower()) else s


def shard_key(ch):
    return ch if "a" <= ch <= "z" else "0"


def write_dir(path, files):
    os.makedirs(path, exist_ok=True)
    for old in os.listdir(path):
        if old not in files:
            os.remove(os.path.join(path, old))
    for name, text in files.items():
        with open(os.path.join(path, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(text)


# ---------------------------------------------------------------- United Kingdom
STOP = {"ltd", "limited", "the", "plc", "llp", "and", "of", "uk", "t/a", "ta", "co", "company", "&"}


def build_uk():
    page = json.loads(get("https://www.gov.uk/api/content/government/publications/register-of-licensed-sponsors-workers"))
    att = [a for a in page["details"]["attachments"] if a["url"].lower().endswith(".csv")][0]
    rows = list(csv.reader(io.StringIO(get(att["url"]).decode("utf-8-sig", errors="replace"))))
    head = [clean(h).lower() for h in rows[0]]
    if head[:5] != ["organisation name", "town/city", "county", "type & rating", "route"] or len(rows) < 50000:
        raise RuntimeError("UK register has an unexpected shape: %r, %d rows" % (head, len(rows)))
    routes, orgs = [], {}
    for r in rows[1:]:
        if len(r) < 5:
            continue
        name, city, rating, route = clean(r[0]), nice_place(r[1]), clean(r[3]), clean(r[4])
        if not name:
            continue
        if route not in routes:
            routes.append(route)
        o = orgs.setdefault((name.lower(), city.lower()), {"n": name, "c": city, "r": set(), "g": "A"})
        o["r"].add(routes.index(route))
        if "(B" in rating:
            o["g"] = "B"
        elif "Provisional" in rating and o["g"] != "B":
            o["g"] = "P"
    by_name, by_city, cities = collections.defaultdict(list), collections.defaultdict(list), collections.Counter()
    for key in sorted(orgs):
        o = orgs[key]
        line = "\t".join([o["n"], o["c"], o["g"], ",".join(str(i) for i in sorted(o["r"]))])
        initials = {shard_key(w[0]) for w in re.findall(r"[a-z0-9][a-z0-9'&/.-]*", o["n"].lower()) if w not in STOP}
        for k in initials or {"0"}:
            by_name[k].append(line)
        if o["c"]:
            by_city[shard_key(o["c"][0].lower())].append(line)
            cities[o["c"]] += 1
    files = {"n-%s.txt" % k: "\n".join(v) + "\n" for k, v in by_name.items()}
    files.update({"c-%s.txt" % k: "\n".join(v) + "\n" for k, v in by_city.items()})
    files["meta.json"] = json.dumps({
        "updated": page.get("public_updated_at", "")[:10], "built": TODAY, "source": UK_PAGE,
        "orgs": len(orgs), "routes": routes, "top_cities": [c for c, _ in cities.most_common(12)],
    }, ensure_ascii=False, indent=1)
    write_dir("data/uk", files)
    print("UK: %d organisations, %d files, register dated %s" % (len(orgs), len(files), page.get("public_updated_at", "")[:10]))


# ---------------------------------------------------------------- Canada
PROV = {"newfoundland and labrador": "NL", "prince edward island": "PE", "nova scotia": "NS", "new brunswick": "NB",
        "quebec": "QC", "québec": "QC", "ontario": "ON", "manitoba": "MB", "saskatchewan": "SK", "alberta": "AB",
        "british columbia": "BC", "yukon": "YT", "northwest territories": "NT", "nunavut": "NU"}


def build_ca():
    import openpyxl
    pkg = json.loads(get("https://open.canada.ca/data/api/3/action/package_show?id=90fed587-1364-4f33-a9ee-208181dc0b97"))["result"]
    found = {}
    for r in pkg["resources"]:
        m = re.match(r"\s*(\d{4})\s*Q([1-4])\b", r.get("name") or "")
        if m and "en" in (r.get("language") or []) and (r.get("format") or "").upper() == "XLSX":
            found[(int(m.group(1)), int(m.group(2)))] = r
    quarters = sorted(found)[-4:]
    if len(quarters) < 4:
        raise RuntimeError("Canada list: fewer than four quarterly files found")
    emp, total_rows = {}, 0
    for q in quarters:
        label = "%dQ%d" % q
        wb = openpyxl.load_workbook(io.BytesIO(get(found[q]["url"])), read_only=True)
        rows = list(wb.worksheets[0].iter_rows(values_only=True))
        hi = next(i for i, r in enumerate(rows[:10]) if r and clean(r[2]).lower() == "employer")
        head = [clean(c).lower() for c in rows[hi][:8]]
        if head != ["province/territory", "program stream", "employer", "address", "occupation", "incorporate status", "approved lmias", "approved positions"]:
            raise RuntimeError("Canada list %s has unexpected columns: %r" % (label, head))
        for r in rows[hi + 1:]:
            if not r or len(r) < 8 or not clean(r[2]) or not isinstance(r[7], (int, float)):
                continue
            name, prov = clean(r[2]), PROV.get(clean(r[0]).lower(), "")
            if not prov:
                continue
            city = nice_place(clean(r[3]).split(",")[0])
            occ = re.sub(r"^\d+\s*-\s*", "", clean(r[4]))
            key = (re.sub(r"[.,]+$", "", name.lower()), city.lower(), prov)
            e = emp.setdefault(key, {"n": name, "c": city, "p": prov, "pos": 0, "occ": collections.Counter(), "q": label})
            e["pos"] += int(r[7])
            if occ:
                e["occ"][occ] += int(r[7])
            e["q"] = max(e["q"], label)
            total_rows += 1
    if total_rows < 5000:
        raise RuntimeError("Canada list: only %d rows" % total_rows)
    lines = []
    for key in sorted(emp):
        e = emp[key]
        lines.append("\t".join([e["n"], e["c"], e["p"], str(e["pos"]), "; ".join(o for o, _ in e["occ"].most_common(3)), e["q"]]))
    newest = found[quarters[-1]]
    files = {"all.txt": "\n".join(lines) + "\n", "meta.json": json.dumps({
        "quarters": ["%dQ%d" % q for q in quarters], "published": (newest.get("last_modified") or newest.get("created") or "")[:10],
        "built": TODAY, "source": CA_PAGE, "employers": len(emp), "positions": sum(e["pos"] for e in emp.values()),
    }, ensure_ascii=False, indent=1)}
    write_dir("data/ca", files)
    print("Canada: %d employers, quarters %s" % (len(emp), ", ".join("%dQ%d" % q for q in quarters)))


failed = 0
for fn in (build_uk, build_ca):
    try:
        fn()
    except Exception as e:  # keep the other country's refresh and the old data for this one
        failed += 1
        print("SKIPPED %s: %r" % (fn.__name__, e))
sys.exit(1 if failed == 2 else 0)
