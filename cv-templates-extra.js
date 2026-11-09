// CV templates page: count downloads per template, then show the "Your CV is ready" window.
(() => {
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a"); if (!a) return;
    if (a.dataset.aff) { count("aff/" + a.dataset.aff + "-templates", "Affiliate click: " + a.dataset.aff + " (CV templates)"); return; }
    const tpl = ((a.getAttribute("href") || "").match(/cv-template-([a-z0-9-]+)\.docx/) || [])[1];
    if (!tpl) return;
    count(`download/${tpl}-word`, `Download CV template: ${tpl} (Word)`);
    if (window.UHNextStep) window.UHNextStep("templates");
  });
})();

// Full-page preview window (click "Preview" or the template image)
(() => {
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  const st = document.createElement("style");
  st.textContent = ".tp-pv{cursor:zoom-in}.tp-bt{display:flex;gap:8px}.tp-bt .btn{flex:1}" +
    ".tpv-ov{position:fixed;inset:0;z-index:10001;background:rgba(5,11,63,.7);display:flex;align-items:center;justify-content:center;padding:16px}" +
    ".tpv{position:relative;width:min(760px,100%);max-height:calc(100vh - 32px);background:#fff;border-radius:22px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px rgba(5,11,63,.7)}" +
    ".tpv-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1.5px solid #e6e9ff;color:#141a52}.tpv-h b{font-size:1.05rem}" +
    ".tpv-x{width:36px;height:36px;border:0;border-radius:50%;background:#eef1ff;color:#141a52;font-size:1.15rem;font-weight:800;cursor:pointer;flex:none}" +
    ".tpv-b{overflow:auto;background:#eef0ff;padding:18px}.tpv-b img{display:block;width:100%;height:auto;border-radius:6px;box-shadow:0 10px 30px -12px rgba(20,26,82,.4);background:#fff}" +
    ".tpv-f{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1.5px solid #e6e9ff}.tpv-f span{color:#15803d;font-weight:800;font-size:.9rem}" +
    ".tpv-tip{padding:10px 18px;background:#fff6cc;border-top:1.5px solid #f5d77a;color:#5a4a1a;font-size:.88rem;font-weight:600}.tpv-tip a{color:#0112ff;font-weight:800}" +
    "@media (max-width:560px){.tpv-b{padding:10px}.tpv-f{flex-direction:column;align-items:stretch}.tpv-f .btn{text-align:center}}";
  document.head.appendChild(st);
  let ov = null;
  const close = () => { if (ov) { ov.remove(); ov = null; document.body.style.overflow = ""; } };
  function open(tpl, name) {
    close();
    ov = document.createElement("div"); ov.className = "tpv-ov";
    ov.innerHTML = `<div class="tpv" role="dialog" aria-modal="true" aria-label="${name} CV template preview"><div class="tpv-h"><b>${name} CV template</b><button type="button" class="tpv-x" aria-label="Close">×</button></div><div class="tpv-b"><img src="cv-template-${tpl}-full.jpg" alt="${name} CV template, full page"></div><div class="tpv-tip">Before you apply, scan your finished CV against the job ad: <a href="https://skillsyncer.com/?via=uhirable" target="_blank" rel="noopener sponsored" data-aff="skillsyncer-preview">see missing keywords with SkillSyncer (free plan)</a></div><div class="tpv-f"><span>✓ Passes every ATS · Word format · Free</span><a class="btn btn-primary" href="cv-template-${tpl}.docx" download>Download Word</a></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".tpv-x")) close(); else if (e.target.closest("a[download]")) setTimeout(close, 50); });
    document.body.appendChild(ov); document.body.style.overflow = "hidden";
    count("preview/" + tpl, "Preview CV template: " + name);
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".tp-prev");
    if (b) { open(b.dataset.tpl, b.dataset.name); return; }
    const pv = e.target.closest && e.target.closest(".tp-pv");
    if (pv) { const c = pv.closest(".tp-card"); const pb = c && c.querySelector(".tp-prev"); if (pb) open(pb.dataset.tpl, pb.dataset.name); }
  });
})();
