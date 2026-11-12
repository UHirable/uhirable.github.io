# Builds data/us from the US Department of Labor's public LCA disclosure files (H-1B).
# Source page: https://www.dol.gov/agencies/eta/foreign-labor/performance (US government work, public domain).
# Run by the GitHub Action "Sponsor data". It writes only files under data/us.
# Only employer name, city, state, job category, pay and counts are kept. Contact names, e-mails,
# phone numbers and street addresses in the source files are never read into the output.
import collections, datetime, io, json, os, re, statistics, sys, tempfile, urllib.request

PAGE = "https://www.dol.gov/agencies/eta/foreign-labor/performance"
OUT = "data/us"
TODAY = datetime.date.today().isoformat()
STATES = {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
          "DC": "Washington DC", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
          "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
          "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
          "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island",
          "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
          "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"}
STOP = {"the", "of", "and", "inc", "llc", "ltd", "corp", "co", "company", "corporation", "limited", "lp", "llp", "pllc", "pc", "us", "usa", "a", "for", "at"}
NEED = ["CASE_NUMBER", "CASE_STATUS", "DECISION_DATE", "VISA_CLASS", "SOC_TITLE", "TOTAL_WORKER_POSITIONS", "EMPLOYER_NAME", "EMPLOYER_CITY",
        "EMPLOYER_STATE", "WORKSITE_CITY", "WORKSITE_STATE", "WAGE_RATE_OF_PAY_FROM", "WAGE_UNIT_OF_PAY"]


def fetch(url, to=None):
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0", "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=600) as r:
        if to is None:
            return r.read()
        with open(to, "wb") as f:
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)


def clean(v):
    return re.sub(r"\s+", " ", str(v)).strip() if v is not None else ""


def nice_place(s):
    s = clean(s)
    return " ".join(w.capitalize() if not re.match(r"^(Mc|O')", w) else w for w in s.lower().split()) if s.isupper() or s.islower() else s


def nice_name(s):
    s = clean(s)
    if not s.isupper():
        return s
    keep = {"LLC", "LLP", "LP", "PLLC", "PC", "USA", "US", "IBM", "HCL", "TCS", "UST", "NTT", "KPMG", "PWC", "EY", "LTI", "IT", "AI", "II", "III", "IV", "NA", "N.A.", "L.P.", "L.L.C.", "P.C.", "DBA"}
    return " ".join(w if w in keep or re.search(r"\d", w) else w.capitalize() for w in s.split())


def key_of(name):
    k = re.sub(r"[^A-Z0-9 ]", "", name.upper())
    k = re.sub(r"\b(INC|INCORPORATED|LLC|LLP|LP|CORP|CORPORATION|CO|COMPANY|LTD|LIMITED|PLLC|PC)\b", "", k)
    return re.sub(r"\s+", " ", k).strip() or name.upper()


def files_on_page(html):
    found = {}
    for m in re.finditer(r'href="([^"]*LCA_Disclosure_Data_FY(\d{4})_Q([1-4])\.xlsx)"', html):
        url = m.group(1)
        if url.startswith("/"):
            url = "https://www.dol.gov" + url
        found[(int(m.group(2)), int(m.group(3)))] = url
    return found


def read_rows(path):
    import openpyxl
    wb = openpyxl.load_workbook(path, read_only=True)
    it = wb.worksheets[0].iter_rows(values_only=True)
    head = [clean(h).upper() for h in next(it)]
    missing = [c for c in NEED if c not in head]
    if missing:
        raise RuntimeError("columns missing: %r" % missing)
    ix = [head.index(c) for c in NEED]
    for r in it:
        if r and len(r) > max(ix):
            yield [r[i] for i in ix]


def main(paths=None):
    if paths is None:
        found = files_on_page(fetch(PAGE).decode("utf-8", "replace"))
        if not found:
            raise RuntimeError("no LCA disclosure files found on the DOL page")
        newest_fy = max(found)[0]
        picked = sorted(k for k in found if k[0] >= newest_fy - 1)[-6:]
        tmp = tempfile.mkdtemp()
        paths = []
        for k in picked:
            p = os.path.join(tmp, "lca_%d_q%d.xlsx" % k)
            try:
                fetch(found[k], p)
                paths.append(p)
                print("downloaded FY%d Q%d (%d MB)" % (k[0], k[1], os.path.getsize(p) >> 20))
            except Exception as e:
                print("could not download FY%d Q%d: %r" % (k[0], k[1], e))
        if not paths:
            raise RuntimeError("no file could be downloaded")
    # pass 1: keep certified H-1B cases, one row per case number
    cases = {}
    for p in paths:
        n = 0
        for num, status, dec, visa, soc, pos, name, ecity, estate, wcity, wstate, wage, unit in read_rows(p):
            n += 1
            if clean(status) != "Certified" or clean(visa) != "H-1B" or not clean(name):
                continue
            d = dec.date() if isinstance(dec, datetime.datetime) else dec if isinstance(dec, datetime.date) else None
            if d is None:
                continue
            pos = 1  # count certified applications, one per case. The 'worker positions' field is unreliable (a few filings claim thousands)
            pay = None
            if clean(unit).lower() == "year":
                try:
                    pay = float(wage)
                except (TypeError, ValueError):
                    pay = None
                if pay is not None and not (15000 <= pay <= 2000000):
                    pay = None
            cases[clean(num)] = (d, clean(name), nice_place(ecity), clean(estate).upper(), nice_place(wcity), clean(wstate).upper(), re.sub(r"\s+", " ", clean(soc)), pos, pay)
        print("read %s: %d rows" % (os.path.basename(p), n))
    if len(cases) < 50000:
        raise RuntimeError("only %d certified H-1B cases, expected far more" % len(cases))
    last = max(c[0] for c in cases.values())
    start = (last.replace(day=1) - datetime.timedelta(days=335)).replace(day=1)  # the latest 12 calendar months
    rows = [c for c in cases.values() if c[0] >= start]
    first = min(c[0] for c in rows)
    emp = {}
    by_state, by_city, by_job = collections.defaultdict(collections.Counter), collections.defaultdict(collections.Counter), collections.defaultdict(collections.Counter)
    job_state = collections.defaultdict(collections.Counter)
    state_tot, city_tot, job_tot = collections.Counter(), collections.Counter(), collections.Counter()
    for d, name, ecity, estate, wcity, wstate, soc, pos, pay in rows:
        k = key_of(name)
        e = emp.setdefault(k, {"names": collections.Counter(), "hq": collections.Counter(), "n": 0, "soc": collections.Counter(), "pay": [], "ws": collections.Counter()})
        e["names"][name] += 1
        if ecity and estate in STATES:
            e["hq"][(ecity, estate)] += 1
        e["n"] += pos
        if soc:
            e["soc"][soc] += pos
            by_job[soc][k] += pos
            job_tot[soc] += pos
            if wstate in STATES:
                job_state[soc][wstate] += pos
        if pay:
            e["pay"].append(pay)
        if wstate in STATES:
            e["ws"][wstate] += pos
            by_state[wstate][k] += pos
            state_tot[wstate] += pos
            if wcity:
                by_city[(wcity, wstate)][k] += pos
                city_tot[(wcity, wstate)] += pos

    def line(k, n=None):
        e = emp[k]
        nm = nice_name(e["names"].most_common(1)[0][0])
        hq = e["hq"].most_common(1)[0][0] if e["hq"] else ("", "")
        med = str(int(round(statistics.median(e["pay"]), -2))) if len(e["pay"]) >= 3 else ""
        return "\t".join([nm, hq[0], hq[1], str(n if n is not None else e["n"]), "; ".join(s for s, _ in e["soc"].most_common(3)), med, ",".join(s for s, _ in e["ws"].most_common(3))])

    order = sorted(emp, key=lambda k: (-emp[k]["n"], k))
    shards = collections.defaultdict(list)
    for k in sorted(emp, key=lambda k: nice_name(emp[k]["names"].most_common(1)[0][0]).lower()):
        l = line(k)
        words = [w for w in re.findall(r"[a-z0-9][a-z0-9'&/.-]*", l.split("\t")[0].lower()) if w not in STOP][:4]
        for ch in {(w[0] if "a" <= w[0] <= "z" else "0") for w in words} or {"0"}:
            shards[ch].append(l)
    files = {"n-%s.txt" % ch: "\n".join(v) + "\n" for ch, v in shards.items()}
    files["top.txt"] = "\n".join(line(k) for k in order[:30]) + "\n"
    files["all-top.txt"] = "\n".join(line(k) for k in order[:300]) + "\n"
    files["by-state.txt"] = "".join("%s\t%s\n" % (st, line(k, n)) for st in sorted(by_state) for k, n in by_state[st].most_common(250))
    top_cities = [c for c, _ in city_tot.most_common(60)]
    files["by-city.txt"] = "".join("%s|%s\t%s\n" % (c[0], c[1], line(k, n)) for c in top_cities for k, n in by_city[c].most_common(200))
    top_jobs = [j for j, _ in job_tot.most_common(40)]
    files["by-job.txt"] = "".join("%s\t%s\n" % (j, line(k, n)) for j in top_jobs for k, n in by_job[j].most_common(200))
    meta = {
        "built": TODAY, "source": PAGE, "from": first.isoformat(), "to": last.isoformat(), "employers": len(emp), "positions": sum(e["n"] for e in emp.values()),
        "states": {s: [state_tot[s], len(by_state[s])] for s in sorted(state_tot)},
        "cities": [[c[0], c[1], city_tot[c], len(by_city[c])] for c in top_cities],
        "jobs": [[j, job_tot[j], len(by_job[j]), [[s, n] for s, n in job_state[j].most_common(8)]] for j in top_jobs],
        "state_names": STATES,
    }
    files["meta.json"] = json.dumps(meta, ensure_ascii=False, indent=1)
    os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(OUT):
        if old not in files:
            os.remove(os.path.join(OUT, old))
    for name, text in files.items():
        with open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
    print("US: %d employers, %d positions, %s to %s, %d files" % (len(emp), meta["positions"], first, last, len(files)))


if __name__ == "__main__":
    try:
        main(sys.argv[1:] or None)
    except Exception as e:  # keep last month's data if anything looks wrong
        print("US data skipped: %r" % (e,))
        sys.exit(0)
