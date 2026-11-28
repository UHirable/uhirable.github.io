// One partner card, used on the For Companies page, on Browse Talents and after a job is posted, so all three always look the same.
// Needs tags.js (tagHTML). Links that start with mailto: open the "get your code" box (mailbox.js) and carry data-mail.
window.partnerCardHTML = function (p) {
  const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const mail = /^mailto:/i.test(p.link);
  return `
 <article class="partner${p.popular ? " is-pop" : ""}">${p.popular ? `<span class="pop-rib">★ Most popular</span>` : ""}
  <div class="p-head">${p.logo ? `<img class="p-logo img" src="${esc(p.logo)}" alt="${esc(p.name)} logo" loading="lazy" width="62" height="62">` : `<div class="p-logo">${esc((p.name.match(/[A-Z]/g) || [p.name[0]]).slice(0, 2).join(""))}</div>`}
   <div><span class="p-tag">${esc(p.tag || "Partner")}</span><h2>${esc(p.name)}</h2><p>${esc(p.tagline)}</p></div></div>
  ${p.deal ? `<div class="p-deal"><div class="d-ic"><svg viewBox="0 0 24 24"><path d="M20 12v9H4v-9"/><rect x="2" y="7" width="20" height="5" rx="1"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg></div><div class="d-tx"><span class="d-lb">${esc(p.dealLabel || "U Hirable Perk")}</span> <b>${esc(p.deal)}</b> ${p.perk ? `<span class="d-sub">${esc(p.perk)}</span>` : ""}</div></div>` : ""}
  <div class="p-roles">${p.roles.map(tagHTML).join("")}</div>
  <div class="p-foot">${p.perk && !p.deal ? `<span class="p-perk">🎁 ${esc(p.perk)}</span>` : ""}<a class="btn btn-gold" data-n="${esc(p.name)}" href="${esc(p.link)}"${mail ? ` data-mail="${esc(p.name)}"` : ` target="_blank" rel="sponsored noopener noreferrer" referrerpolicy="no-referrer"`}>${esc(p.cta || "Hire Now")} →</a></div>
 </article>`;
};
