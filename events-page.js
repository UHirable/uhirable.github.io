// Renders the Hiring Events page (and single-event pages)
(function(){
const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now=new Date().toISOString().slice(0,7);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const BASE="https://uhirable.com/";
const pageUrl=e=>BASE+"event-"+slug(e.name)+".html";
const one=window.EVENT_ID;
const LI='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>';
const WA='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>';
const CP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';
function card(e){
  const u=pageUrl(e);
  return `<article class="ev"><span class="d">${esc(e.date)}</span><h3>${esc(e.name)}</h3><div class="loc">${esc(e.city)}</div><p>${esc(e.desc)}</p>
  <div class="tags">${e.audience==="seekers"?'<span class="s">FOR JOB SEEKERS</span>':'<span class="h">FOR COMPANIES &amp; HR</span>'}<span>${esc(e.format.toUpperCase())}</span></div>
  ${e.perk?`<div class="perk">${esc(e.perk)}</div>`:""}
  <div class="share-row"><small>SHARE</small>
   <a class="sb li" target="_blank" rel="noopener" aria-label="Share on LinkedIn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}">${LI}</a>
   <a class="sb wa" target="_blank" rel="noopener" aria-label="Share on WhatsApp" href="https://wa.me/?text=${encodeURIComponent(e.name+" | "+e.date+" | "+u)}">${WA}</a>
   <button class="sb cp" type="button" aria-label="Copy link" data-u="${esc(u)}">${CP}</button></div>
  <a class="go" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">Visit event website →</a></article>`;
}
const grid=document.getElementById("grid"),sel=document.getElementById("region");
// The filter is by country: the last part of the event's place ("Leeds, UK" -> "UK"; an online event with no country -> "Online").
const country=e=>e.city.split(",").pop().trim();
sel.setAttribute("aria-label","Filter by country");
sel.innerHTML=["All countries"].concat([...new Set(EVENTS.filter(e=>!e.month||e.month>=now).map(country))].sort((a,b)=>a.localeCompare(b))).map(c=>"<option>"+esc(c)+"</option>").join("");
// A text box next to the country list: type an event name, a city or a month.
if(!document.getElementById("evq")){
  const st=document.createElement("style");st.textContent=".ev-bar #evq{font:inherit;font-weight:600;padding:12px 14px;border-radius:12px;border:2px solid #e3e6ff;color:#050b3f;background:#fff;flex:1 1 220px;min-width:0}.ev-bar #evq:focus,.ev-bar select:focus{outline:none;border-color:#0112ff}.ev-bar select{cursor:pointer}@media(max-width:560px){.ev-bar select,.ev-bar #evq{flex:1 1 100%}.ev-bar .count{margin-left:0}}";document.head.appendChild(st);
  sel.insertAdjacentHTML("afterend",'<input type="search" id="evq" placeholder="Search by event, city or month" aria-label="Search events" autocomplete="off">');
}
const box=document.getElementById("evq");
// A link can open the page already on one country: /events/uk, /events/saudi-arabia (the old form events.html?country=UK still works). ?q=toronto fills the search box.
const cslug=c=>c.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
try{const ps=new URLSearchParams(location.search),pm=location.pathname.match(/^\/events\/([^\/]+)/),c=cslug(pm?decodeURIComponent(pm[1]):ps.get("country")||""),o=[...sel.options].find(x=>cslug(x.value)===c);if(o)sel.value=o.value;if(ps.get("q"))box.value=ps.get("q")}catch(e){}
// Picking a country puts it in the address (/events/uk), so the address bar always holds a link to what is on screen.
if(!one)sel.addEventListener("change",()=>{try{history.replaceState(null,"",sel.value==="All countries"?"/events.html":"/events/"+cslug(sel.value))}catch(e){}});
function render(){
  const r=sel.value,q=(box.value||"").trim().toLowerCase();
  let list=EVENTS.filter(e=>(!e.month||e.month>=now)&&(r==="All countries"||country(e)===r)&&(!q||(e.name+" "+e.city+" "+e.date+" "+e.desc).toLowerCase().includes(q))).sort((x,y)=>(x.month||"9999").localeCompare(y.month||"9999"));
  if(one) list=EVENTS.filter(e=>slug(e.name)===one);
  document.getElementById("count").textContent=list.length+(list.length===1?" event":" events");
  grid.innerHTML=list.map(card).join("");
}
if(one){document.querySelector(".ev-bar").style.display="none";grid.classList.add("single");
  grid.insertAdjacentHTML("afterend",'<div style="text-align:center"><a class="backall" href="events.html">← See all hiring events</a></div>');
  // On an event for companies and HR teams: a short block for employers (post a job for free, or browse candidates).
  const cur=EVENTS.find(e=>slug(e.name)===one);
  // On a job fair for job seekers in the UK or Canada: live jobs in the same city, under the event (same list as the job pages).
  const cc=cur&&cur.audience==="seekers"&&cur.format!=="Online"?(/, UK$/.test(cur.city)?"uk":/, Canada$/.test(cur.city)?"ca":""):"";
  if(cc){const town=cur.city.split(",")[0].trim(),country=cc==="uk"?"United Kingdom":"Canada";
    document.querySelector(".ev-wrap").insertAdjacentHTML("afterend",'<section class="container pj-body" id="ev-jobs" style="max-width:900px;margin:6px auto 44px"><h2 style="color:#0112ff;font-size:1.45rem;margin:0 0 4px">Jobs in '+esc(town)+' right now</h2><p style="color:#0b1170;opacity:.8;margin:0 0 14px">Not waiting for the fair? These openings in '+esc(town)+' are live today.</p><div class="js-bar" id="pj-status">Loading live jobs…</div><div id="pj-list" class="jobs-list" data-q="" data-cc="'+cc+'" data-country="'+esc(town)+", "+country+'" data-l="'+esc(town)+'"></div><div class="js-more" id="pj-more" hidden><button class="btn btn-soft" id="pj-next">Load more jobs</button></div></section>');
    // no jobs came back: take the whole block away instead of showing an empty list
    document.addEventListener("uh:jobs",()=>{if(!document.querySelector("#pj-list .job-card"))document.getElementById("ev-jobs").hidden=true});
    const add=(src,then)=>{const sc=document.createElement("script");sc.src=src;sc.onload=then;document.body.appendChild(sc)};
    add("wjfeed.js?v=5",()=>add("pagejobs.js?v=7"));}
  if(cur&&cur.audience!=="seekers") document.querySelector(".ev-wrap").insertAdjacentHTML("afterend",'<section class="container" style="max-width:760px;margin:26px auto 40px"><div style="background:#0b1170;border-radius:22px;padding:24px 22px;color:#fff;box-shadow:0 14px 34px rgba(5,11,63,.28)"><span style="display:inline-block;background:#ffc93c;color:#0b1170;font-weight:800;font-size:.72rem;letter-spacing:.08em;border-radius:999px;padding:4px 10px">FOR EMPLOYERS</span><h2 style="color:#fff;font-size:1.35rem;margin:12px 0 6px">Hiring right now?</h2><p style="margin:0 0 16px;color:#dfe2ff;line-height:1.55">Post your job on U Hirable for free, or browse candidates who are open to work.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a href="post-a-job.html" style="flex:1 1 200px;text-align:center;background:#ffc93c;color:#0b1170;font-weight:800;border-radius:12px;padding:12px 16px;text-decoration:none">Post a job for free</a><a href="open-to-work.html" style="flex:1 1 200px;text-align:center;border:1.5px solid rgba(255,255,255,.55);color:#fff;font-weight:700;border-radius:12px;padding:12px 16px;text-decoration:none">Browse candidates</a></div></div></section>');}
sel.addEventListener("change",render);box.addEventListener("input",render);
document.addEventListener("click",ev=>{const b=ev.target.closest(".ev .cp");if(b){try{navigator.clipboard.writeText(b.dataset.u)}catch(e){};b.style.background="#08a35a";}});
render();
})();
