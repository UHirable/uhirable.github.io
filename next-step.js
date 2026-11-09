// "Your CV is ready" window shown in the middle of the page after a CV download.
// Suggests jobs in the visitor's country, picked from the device time zone (nothing is sent anywhere).
(() => {
  if (window.UHNextStep) return;
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  const MENA = {
    "Africa/Cairo": ["Egypt", "egypt.html"],
    "Asia/Riyadh": ["Saudi Arabia", "saudi-arabia.html"],
    "Asia/Dubai": ["the UAE", "uae.html"],
    "Asia/Qatar": ["Qatar", "qatar.html"],
    "Asia/Kuwait": ["Kuwait", "kuwait.html"],
    "Asia/Bahrain": ["Bahrain", "bahrain.html"],
  };
  const US = /^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Nome|Adak|Metlakatla|Yakutat|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)$|^Pacific\/Honolulu$/;
  let region, sub, btn, href;
  if (MENA[tz]) { const [name, page] = MENA[tz]; region = page.replace(".html", ""); sub = `Next step: put it to work. We have live openings in ${name} right now.`; btn = `See jobs in ${name} →`; href = page; }
  else if (US.test(tz)) { region = "us"; sub = "Next step: put it to work. See open roles at fast-growing US companies."; btn = "See jobs in the US →"; href = "jobs.html"; }
  else { region = "other"; sub = "Next step: put it to work. Browse open jobs from hundreds of job sites."; btn = "Browse open jobs →"; href = "jobs.html"; }

  let shown = false;
  function show(source) {
    if (shown) return; shown = true;
    const st = document.createElement("style");
    st.textContent = ".uhns-ov{position:fixed;inset:0;z-index:10000;background:rgba(5,11,63,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:uhnsFade .25s ease-out}" +
      ".uhns{position:relative;width:min(440px,100%);background:#fff;color:#141a52;border-radius:24px;padding:30px 26px 24px;text-align:center;box-shadow:0 30px 70px -20px rgba(5,11,63,.6);animation:uhnsPop .35s cubic-bezier(.2,.9,.3,1.2)}" +
      ".uhns-ic{width:76px;height:76px;margin:0 auto 14px;border-radius:22px;background:linear-gradient(145deg,#2a3cff,#0112ff 60%,#0a0fa0);display:grid;place-items:center;font-size:38px;box-shadow:0 8px 0 #070b7a,0 16px 30px -10px rgba(1,18,255,.6)}" +
      ".uhns h3{margin:0 0 8px;font-size:1.5rem;line-height:1.2}.uhns p{margin:0 0 20px;color:#5b6391;font-size:1rem;line-height:1.5}" +
      ".uhns a.uhns-go{display:block;background:#0112ff;color:#fff;font-weight:800;font-size:1.02rem;text-decoration:none;padding:14px 18px;border-radius:14px;box-shadow:0 5px 0 #0a0fa0}" +
      ".uhns a.uhns-aff{display:block;margin-top:12px;padding:11px 14px;border-radius:12px;background:#fff8e1;border:1.5px solid #ffe08a;color:#8a6100;font-weight:800;font-size:.92rem;text-decoration:none}.uhns a.uhns-aff:hover{background:#fff1c2}" +
      ".uhns a.uhns-go:hover{background:#0a1cff}.uhns button.uhns-later{margin-top:12px;border:0;background:none;color:#5b6391;font-weight:700;font-size:.92rem;cursor:pointer;font-family:inherit}" +
      ".uhns button.uhns-x{position:absolute;top:12px;right:12px;width:34px;height:34px;border:0;border-radius:50%;background:#eef1ff;color:#141a52;font-size:1.1rem;font-weight:800;cursor:pointer}" +
      "@keyframes uhnsFade{from{opacity:0}to{opacity:1}}@keyframes uhnsPop{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:none}}" +
      "@media (prefers-reduced-motion:reduce){.uhns-ov,.uhns{animation:none}}";
    document.head.appendChild(st);
    const ov = document.createElement("div"); ov.className = "uhns-ov";
    ov.innerHTML = `<div class="uhns" role="dialog" aria-modal="true" aria-labelledby="uhns-t"><button type="button" class="uhns-x" aria-label="Close">×</button><div class="uhns-ic" aria-hidden="true">🎉</div><h3 id="uhns-t">Your CV is ready!</h3><p>${sub}</p><a class="uhns-go" href="${href}">${btn}</a><a class="uhns-aff" href="https://skillsyncer.com/?via=uhirable" target="_blank" rel="noopener sponsored">Check it passes ATS with SkillSyncer →</a><button type="button" class="uhns-later">Maybe later</button></div>`;
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".uhns-x") || e.target.closest(".uhns-later")) close(); });
    ov.querySelector(".uhns-go").addEventListener("click", () => count("next-step/" + (source || "cv") + "-" + region, "CV ready → jobs (" + region + ")"));
    ov.querySelector(".uhns-aff").addEventListener("click", () => count("aff/skillsyncer-popup-" + (source || "cv"), "Affiliate click: SkillSyncer (CV ready window)"));
    document.addEventListener("keydown", onKey);
    document.body.appendChild(ov);
    const go = ov.querySelector(".uhns-go"); try { go.focus({ preventScroll: true }); } catch (e) {}
  }
  window.UHNextStep = (source) => setTimeout(() => show(source), 700);
})();
