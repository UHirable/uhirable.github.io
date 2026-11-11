import json, urllib.request, io, csv, sys
UA={'User-Agent':'Mozilla/5.0 (uhirable.github.io data refresh)'}
def get(u, n=None):
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120) as r:
        return r.read() if n is None else r.read(n)
# UK
j=json.loads(get('https://www.gov.uk/api/content/government/publications/register-of-licensed-sponsors-workers'))
print('UK updated',j.get('public_updated_at'))
for a in j['details'].get('attachments',[]): print('UK att',a.get('title'),a.get('url'),a.get('content_type'),a.get('file_size'))
url=[a['url'] for a in j['details']['attachments'] if a['url'].lower().endswith('.csv')][0]
b=get(url); print('UK bytes',len(b))
t=b.decode('utf-8-sig',errors='replace'); rows=list(csv.reader(io.StringIO(t)))
print('UK rows',len(rows)); [print(r) for r in rows[:6]]
import collections
print(collections.Counter(r[3] for r in rows[1:] if len(r)>4).most_common(12))
print(collections.Counter(r[4] for r in rows[1:] if len(r)>4).most_common(40))
print('unique orgs',len(set(r[0] for r in rows[1:])))
# Canada
j=json.loads(get('https://open.canada.ca/data/api/3/action/package_show?id=90fed587-1364-4f33-a9ee-208181dc0b97'))['result']
print('CA modified',j.get('metadata_modified'))
res=j['resources']
for r in res[-14:]: print('CA res',r.get('name'),'|',r.get('format'),'|',r.get('language'),'|',r.get('url'),'|',r.get('last_modified') or r.get('created'))
print('CA n resources',len(res))
en=[r for r in res if 'en' in (r.get('language') or []) and (r.get('format') or '').upper() in('CSV','XLSX')]
for r in en[-3:]:
    try:
        b=get(r['url']); print('CA file',r['name'],r['format'],len(b))
        if r['format'].upper()=='CSV':
            for enc in('utf-8-sig','cp1252'):
                try: t=b.decode(enc); break
                except Exception as e: pass
            for line in t.splitlines()[:14]: print('  ',line[:300])
            print('   lines',len(t.splitlines()))
        else:
            import openpyxl
            wb=openpyxl.load_workbook(io.BytesIO(b),read_only=True)
            for ws in wb.worksheets:
                print('  sheet',ws.title,ws.max_row,ws.max_column)
                for i,row in enumerate(ws.iter_rows(values_only=True)):
                    if i>=14: break
                    print('  ',row)
    except Exception as e: print('CA err',r.get('url'),repr(e))
