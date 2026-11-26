# Compares the UK sponsor register before and after the monthly refresh and writes data/uk/changes.json:
# organisations added to the register, and organisations no longer on it, since the last refresh.
# Usage (GitHub Action "Sponsor data"): copy data/uk to a folder before tools/build_sponsor_data.py runs,
# then run:  python3 tools/uk_changes.py <old folder>
# It keeps the previous changes.json when the register date did not change.
import glob, json, os, sys


def load(folder):
    rows = {}
    for f in glob.glob(os.path.join(folder, "c-*.txt")):
        for l in open(f, encoding="utf-8"):
            p = l.rstrip("\n").split("\t")
            if len(p) >= 4:
                rows[(p[0].strip().lower(), p[1].strip().lower())] = p[:4]
    meta = json.load(open(os.path.join(folder, "meta.json"), encoding="utf-8"))
    return rows, meta


old_dir = sys.argv[1]
old, old_meta = load(old_dir)
new, new_meta = load("data/uk")
if old_meta.get("updated") == new_meta.get("updated"):
    print("UK changes: register date unchanged (%s), keeping the last changes file" % new_meta.get("updated"))
    sys.exit(0)
if len(old) < 50000 or len(new) < 50000:
    print("UK changes: data looks too small (%d / %d rows), skipped" % (len(old), len(new)))
    sys.exit(0)
key = lambda r: (not r[0][:1].isalpha(), r[0].lower())
added = sorted((new[k] for k in new.keys() - old.keys()), key=key)
removed = sorted((old[k] for k in old.keys() - new.keys()), key=key)
out = {"from": old_meta["updated"], "to": new_meta["updated"], "routes": new_meta["routes"], "added": added, "removed": removed}
json.dump(out, open("data/uk/changes.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("UK changes %s to %s: %d added, %d no longer listed" % (out["from"], out["to"], len(added), len(removed)))
