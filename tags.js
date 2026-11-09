// =========================================================
//  Feature tags: one color per category, used on every card.
//  AI (purple) · Hiring (orange) · Payroll & HR (blue)
//  Talent (pink) · Tools (green) · Perks & Support (yellow)
//  Tags starting with "AI " are always purple with an AI badge.
// =========================================================
const TAG_CATS = {
  ai:     "AI",
  hire:   "Hiring",
  hr:     "Payroll & HR",
  talent: "Talent",
  tools:  "Tools",
  perk:   "Perks & Support"
};
function tagCat(t) {
  const s = t.toLowerCase();
  if (/^ai /.test(s)) return "ai";
  if (/\bfree\b|no setup|24\/7|money-back/.test(s)) return "perk";
  if (/^(administrative|lead generation|sales|social media|marketing|accounting|customer|virtual assistants|data entry|technical support|legal assistants|finance & accounting|web developers|engineering support|custom role)/.test(s)) return "talent";
  if (/payroll|employer of record|\beor\b|contractor|contract|benefit|insurance|leave|time off|expense|onboarding|wps|payout|self-service|performance|hr expert/.test(s)) return "hr";
  if (/tracker|checker|scanner|template|scheduling|analytics|engagement|reports|dashboard|job boards|builder|score|keyword|extension/.test(s)) return "tools";
  if (/\bats\b|applicant|crm|candidate|recruit|sourcing|resume parsing|email sequence/.test(s)) return "hire";
  if (/support/.test(s)) return "perk";
  return "tools";
}
const tagEsc = (s = "") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function tagHTML(t) {
  const c = tagCat(t);
  return c === "ai"
    ? `<span class="tg tg-ai"><i>AI</i> ${tagEsc(t.replace(/^AI /, ""))}</span>`
    : `<span class="tg tg-${c}">${tagEsc(t)}</span>`;
}
function tagLegend(items, el) {
  const used = new Set(items.flatMap(p => p.roles.map(tagCat)));
  el.innerHTML = Object.keys(TAG_CATS).filter(k => used.has(k))
    .map(k => `<span class="tg tg-${k}">${k === "ai" ? "<i>AI</i> " : ""}${TAG_CATS[k]}</span>`).join("");
}
