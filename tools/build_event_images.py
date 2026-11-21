import asyncio, math, re, sys
SITE='/home/claude/uhirable.github.io'
def star(cx,cy,r,fill,pts=5,inner=.4,rot=-90):
    p=[]
    for i in range(pts*2):
        a=math.radians(rot+i*180/pts); rr=r if i%2==0 else r*inner
        p.append(f"{cx+rr*math.cos(a):.2f},{cy+rr*math.sin(a):.2f}")
    return f'<polygon points="{" ".join(p)}" fill="{fill}"/>'
def us():
    s='<rect width="190" height="100" fill="#fff"/>'+''.join(f'<rect y="{i*100/13:.2f}" width="190" height="{100/13:.2f}" fill="#b22234"/>' for i in range(0,13,2))
    s+='<rect width="76" height="53.85" fill="#3c3b6e"/>'
    for r in range(9):
        n=6 if r%2==0 else 5; off=6.3 if r%2==0 else 12.6
        for c in range(n): s+=star(off+c*12.6,5.4+r*5.4,2.1,'#fff')
    return ('0 0 190 100',s)
def ae():
    return ('0 0 120 60','<rect width="120" height="20" fill="#00732f"/><rect y="20" width="120" height="20" fill="#fff"/><rect y="40" width="120" height="20" fill="#000"/><rect width="30" height="60" fill="#ff0000"/>')
def my():
    s='<rect width="280" height="140" fill="#fff"/>'+''.join(f'<rect y="{i*10}" width="280" height="10" fill="#cc0001"/>' for i in range(0,14,2))
    s+='<rect width="140" height="80" fill="#010066"/><circle cx="52" cy="40" r="26" fill="#ffcc00"/><circle cx="60" cy="40" r="22.5" fill="#010066"/>'+star(92,40,22,'#ffcc00',pts=14,inner=.45)
    return ('0 0 280 140',s)
FL={'us':us(),'ae':ae(),'my':my()}
def flag(k,w,h,r=6):
    vb,body=FL[k]
    return f'<svg viewBox="{vb}" width="{w}" height="{h}" preserveAspectRatio="none" style="border-radius:{r}px;display:block;box-shadow:0 0 0 2px rgba(255,255,255,.9)">{body}</svg>'
EV=[
 dict(slug='employee-well-being-2026',name='Employee Well-Being 2026',date='7–9 Dec 2026',mon='DEC',day='7–9',city='Orlando, FL, USA',country='United States',flag='us'),
 dict(slug='hr-tech-innovation-conference-penang',name='HR Tech & Innovation Conference Penang',date='7 Dec 2026',mon='DEC',day='7',city='Penang, Malaysia',country='Malaysia',flag='my'),
 dict(slug='shrm-mena-annual-conference-expo',name='SHRM MENA Annual Conference & Expo',date='16–17 Dec 2026',mon='DEC',day='16–17',city='Dubai, UAE',country='United Arab Emirates',flag='ae'),
]
BASE='''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-family:PJ;src:url(../plus-jakarta-sans.woff2) format("woff2");font-weight:200 800}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:PJ,Arial;color:#fff;position:relative;overflow:hidden}
'''
def og(e):
    n=e['name'].replace('&','&amp;'); fs=58 if len(e['name'])<30 else 50
    dfs=92 if len(e['day'])<3 else 64 if len(e['day'])<5 else 52
    return BASE+f'''body{{width:1200px;height:627px;background:radial-gradient(700px 520px at 82% 35%,#2a3cff,transparent 70%),linear-gradient(160deg,#0112ff,#0009c9)}}
.l{{position:absolute;left:64px;top:56px;width:720px}}.l img{{height:44px}}
.pill{{display:inline-flex;align-items:center;gap:10px;margin-top:30px;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);color:#ffc93c;font-weight:800;font-size:19px;letter-spacing:2px;padding:8px 20px;border-radius:999px}}
.pill i{{width:12px;height:12px;border-radius:50%;background:#ffc93c}}
h1{{font-size:{fs}px;font-weight:800;line-height:1.08;margin-top:18px;letter-spacing:-1.5px}}
.chips{{display:flex;gap:12px;margin-top:22px;align-items:center}}
.c{{font-weight:800;font-size:23px;padding:9px 18px;border-radius:12px;display:flex;align-items:center;gap:10px}}
.c.d{{background:#ffc93c;color:#0b1170}}.c.p{{background:#fff;color:#0b1170}}
.s{{margin-top:20px;font-size:20px;font-weight:600;color:#cfd6ff}}
.cal{{position:absolute;right:78px;top:150px;width:250px;height:260px;border-radius:34px;background:#fff;transform:rotate(5deg);box-shadow:0 30px 60px rgba(0,0,40,.35);overflow:hidden;text-align:center}}
.cal b{{display:block;background:#ffc93c;color:#0b1170;font-size:34px;letter-spacing:5px;font-weight:800;padding:14px 0}}
.cal span{{display:flex;align-items:center;justify-content:center;height:186px;color:#0112ff;font-weight:800;font-size:{dfs}px;letter-spacing:-2px}}
</style></head><body><div class="l"><img src="../logo-white.png"><br><span class="pill"><i></i>HIRING EVENT</span>
<h1>{n}</h1><div class="chips"><span class="c d">{e['date']}</span><span class="c p">{flag(e['flag'],36,24,4)}{e['city']}</span></div>
<div class="s">For companies &amp; HR · In person</div></div>
<div class="cal"><b>{e['mon']}</b><span>{e['day']}</span></div></body></html>'''
def li():
    rows=''.join(f'''<div class="row"><div class="f">{flag(e['flag'],150,96,12)}</div>
<div class="t"><div class="co">{e['country']}</div><div class="nm">{e['name'].replace('&','&amp;')}</div><div class="ct">{e['city']}</div></div>
<div class="dt"><b>{e['day']}</b><span>DEC 2026</span></div></div>''' for e in sorted(EV,key=lambda e:int(re.match(r'\d+',e['day']).group())))
    return BASE+f'''body{{width:1080px;height:1080px;background:radial-gradient(800px 600px at 85% 8%,#2a3cff,transparent 70%),linear-gradient(165deg,#0112ff,#0008b8)}}
.top{{position:absolute;left:70px;top:60px;right:70px;display:flex;justify-content:space-between;align-items:center}}.top img{{height:46px}}
.tag{{background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);font-weight:800;font-size:20px;letter-spacing:2px;padding:9px 22px;border-radius:999px}}
h1{{position:absolute;left:66px;top:140px;font-size:168px;font-weight:800;letter-spacing:-7px;color:#ffc93c;line-height:1}}
.sub{{position:absolute;left:74px;top:322px;font-size:34px;font-weight:700}}
.list{{position:absolute;left:70px;right:70px;top:404px;display:flex;flex-direction:column;gap:24px}}
.row{{background:#fff;border-radius:28px;height:176px;display:flex;align-items:center;padding:0 30px;gap:28px;box-shadow:0 8px 0 #ffc93c}}
.f svg{{box-shadow:0 0 0 2px #e3e6f5!important}}
.t{{flex:1;color:#0b1170;min-width:0}}.co{{font-size:21px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#0112ff}}
.nm{{font-size:31px;font-weight:800;line-height:1.12;margin-top:6px;letter-spacing:-.6px}}.ct{{font-size:22px;font-weight:600;color:#4a5080;margin-top:6px}}
.dt{{width:170px;height:128px;border-radius:20px;background:#0112ff;display:flex;flex-direction:column;align-items:center;justify-content:center}}
.dt b{{font-size:50px;font-weight:800;line-height:1;letter-spacing:-1.5px}}.dt span{{font-size:19px;font-weight:800;letter-spacing:2px;color:#ffc93c;margin-top:8px}}
.ft{{position:absolute;left:70px;right:70px;bottom:44px;text-align:center;font-size:25px;font-weight:700;color:#dfe4ff}}
</style></head><body><div class="top"><img src="../logo-white.png"><span class="tag">FOR HR &amp; TALENT TEAMS</span></div>
<h1>Events</h1><div class="sub">HR events around the world in December 2026</div>
<div class="list">{rows}</div><div class="ft">Links to all three events are in the post</div></body></html>'''
from playwright.async_api import async_playwright
async def shot(b,htmltxt,w,h,out):
    open('ev/p.html','w').write(htmltxt)
    pg=await b.new_page(viewport={"width":w,"height":h}); await pg.goto("file:///home/claude/gen/ev/p.html"); await pg.wait_for_timeout(600)
    await pg.screenshot(path=out); await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for e in EV: await shot(b,og(e),1200,627,f"{SITE}/og-event-{e['slug']}.png")
        await shot(b,li(),1080,1080,"/home/claude/gen/ev/linkedin-hr-events-december-2026.png")
        await b.close()
asyncio.run(main())
