// CV Match popup: opens the existing CV checker inside a dialog (no page change).
(() => {
  if (window.UHCvPop) return;
  const css = `
  .cv-fit-btn{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:62px;min-height:52px;padding:6px 4px;border:0;border-radius:14px;background:linear-gradient(145deg,#eef1ff,#dfe4ff);color:#0112ff;cursor:pointer;flex:none;box-shadow:0 4px 0 #b9c2ff,0 10px 18px -10px rgba(1,18,255,.45);font-family:inherit}
  .cv-fit-btn:hover{transform:translateY(-1px)}
  .cv-fit-btn svg{width:24px;height:24px}
  .cv-fit-btn span{font-size:.6rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;line-height:1}
  .cv-fit-btn.cv-fit-wide{flex-direction:row;width:100%;min-height:0;padding:12px 14px;gap:10px;margin-top:12px}
  .cv-fit-btn.cv-fit-wide span{font-size:.82rem;letter-spacing:0;text-transform:none}
  .uhcv-ov{position:fixed;inset:0;z-index:9999;background:rgba(5,11,63,.6);display:flex;align-items:center;justify-content:center;padding:14px}
  .uhcv-ov[hidden]{display:none}
  .uhcv-box{background:#fff;border-radius:20px;width:100%;max-width:560px;height:min(88vh,760px);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 60px -20px rgba(5,11,63,.6)}
  .uhcv-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e6e9ff;color:#141a52}
  .uhcv-hd b{font-size:.98rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .uhcv-x{width:34px;height:34px;border-radius:50%;border:0;background:#eef1ff;color:#141a52;font-size:1.2rem;font-weight:800;cursor:pointer;flex:none}
  .uhcv-fr{flex:1;width:100%;border:0;background:#fff}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const ov = document.createElement("div"); ov.className = "uhcv-ov"; ov.hidden = true;
  ov.innerHTML = '<div class="uhcv-box" role="dialog" aria-modal="true" aria-labelledby="uhcv-t"><div class="uhcv-hd"><b id="uhcv-t">Check my CV fit</b><button type="button" class="uhcv-x" aria-label="Close">×</button></div><iframe class="uhcv-fr" title="CV match checker"></iframe></div>';
  document.body.appendChild(ov);
  const fr = ov.querySelector("iframe"), ttl = ov.querySelector("#uhcv-t");
  const close = () => { ov.hidden = true; fr.src = "about:blank"; document.body.style.overflow = ""; };
  const open = (title, text) => {
    try { sessionStorage.setItem("uh-cm-job", (title ? title + "\n" : "") + (text || "")); } catch (e) {}
    ttl.textContent = title ? "Check my CV fit · " + title : "Check my CV fit";
    fr.src = "cv-match.html#from-card"; ov.hidden = false; document.body.style.overflow = "hidden";
  };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".uhcv-x")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !ov.hidden) close(); });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".cv-fit-btn"); if (!b) return;
    e.preventDefault();
    const id = b.dataset.jobid;
    const list = typeof JOBS !== "undefined" ? JOBS : (window.JOBS || null);
    const j = id && list ? list.find((x) => x.id === id) : null;
    if (j) {
      const A = (v) => (Array.isArray(v) ? v : v ? [v] : []);
      const text = [j.title, j.company, j.industry, j.location, j.brief, j.overview, ...A(j.responsibilities), ...A(j.requirements), ...A(j.preferred), j.eligibility, j.compensation].filter(Boolean).join("\n");
      open(j.title + (j.company ? " · " + j.company : ""), text);
    } else open(b.dataset.cvtitle || "", b.dataset.cvtext || "");
  });
  window.UHCvPop = { open, close };

  // Arabic-market pages: show a template link above the footer
  const f = (location.pathname.split("/").pop() || "");
  if (/-in-(bahrain|cairo|doha|dubai|kuwait|riyadh)\.html$/.test(f) || /^(egypt|uae|saudi-arabia|qatar|kuwait|bahrain)\.html$/.test(f)) {
    const ft = document.querySelector("footer");
    if (ft && !document.querySelector(".uhcv-tpl")) {
      const a = document.createElement("a"); a.className = "uhcv-tpl"; a.href = "cv-templates.html";
      a.innerHTML = "<b>Need a CV?</b> Get a free ATS-friendly CV template →";
      ft.parentNode.insertBefore(a, ft);
      const css2 = ".uhcv-tpl{display:block;max-width:1100px;margin:18px auto;padding:14px 18px;border-radius:16px;background:#fff;border:1.5px dashed #8b97ff;color:#0112ff;font-weight:700;text-align:center;text-decoration:none}.uhcv-tpl b{font-weight:900}.uhcv-tpl:hover{background:#f4f6ff}";
      const st2 = document.createElement("style"); st2.textContent = css2; document.head.appendChild(st2);
    }
  }
})();
