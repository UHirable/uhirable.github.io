// Renders the Hiring Events page (and single-event pages)
(function(){
const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now=new Date().toISOString().slice(0,7);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const BASE="https://uhirable.github.io/";
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
function render(){
  const r=sel.value;
  let list=EVENTS.filter(e=>(!e.month||e.month>=now)&&(r==="All regions"||e.region===r)).sort((x,y)=>(x.month||"9999").localeCompare(y.month||"9999"));
  if(one) list=EVENTS.filter(e=>slug(e.name)===one);
  document.getElementById("count").textContent=list.length+(list.length===1?" event":" events");
  grid.innerHTML=list.map(card).join("");
}
if(one){document.querySelector(".ev-bar").style.display="none";grid.classList.add("single");
  grid.insertAdjacentHTML("afterend",'<div style="text-align:center"><a class="backall" href="events.html">← See all hiring events</a></div>');}
sel.addEventListener("change",render);
document.addEventListener("click",ev=>{const b=ev.target.closest(".ev .cp");if(b){try{navigator.clipboard.writeText(b.dataset.u)}catch(e){};b.style.background="#08a35a";}});
render();
})();
