// Free CV Builder — everything runs in the browser. Nothing is uploaded or stored on any server.
(() => {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const state = { tpl: "classic", name: "", title: "", city: "", email: "", phone: "", linkedin: "", summary: "", skills: "", langs: "", certs: "", exp: [], edu: [], proj: [] };
  const KEY = "uh-cv-builder";
  try { const saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved && typeof saved === "object") Object.assign(state, saved); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  // ---------- form ----------
  const F = ["name", "title", "city", "email", "phone", "linkedin", "summary", "skills", "langs", "certs"];
  F.forEach((k) => { const el = $("#f-" + k); if (!el) return; el.value = state[k] || ""; el.addEventListener("input", () => { state[k] = el.value; save(); render(); }); });
  function rowHTML(kind, i, r) {
    if (kind === "exp") return `<div class="cb-row" data-k="exp" data-i="${i}"><div class="cb-2"><input placeholder="Job title" data-f="role" value="${esc(r.role)}"><input placeholder="Company, City" data-f="org" value="${esc(r.org)}"></div><div class="cb-2"><input placeholder="Start (e.g. Jan 2023)" data-f="from" value="${esc(r.from)}"><input placeholder="End (or Present)" data-f="to" value="${esc(r.to)}"></div><textarea rows="3" placeholder="One achievement per line. Start with a verb, add a number:&#10;Led a team of 4 to launch X, growing revenue 25%" data-f="bul">${esc(r.bul)}</textarea><button type="button" class="cb-del" aria-label="Remove">✕</button></div>`;
    if (kind === "edu") return `<div class="cb-row" data-k="edu" data-i="${i}"><div class="cb-2"><input placeholder="Degree (e.g. BSc Computer Science)" data-f="deg" value="${esc(r.deg)}"><input placeholder="University" data-f="org" value="${esc(r.org)}"></div><div class="cb-2"><input placeholder="Years (e.g. 2019 – 2023)" data-f="yr" value="${esc(r.yr)}"><input placeholder="GPA / honours (optional)" data-f="note" value="${esc(r.note)}"></div><button type="button" class="cb-del" aria-label="Remove">✕</button></div>`;
    return `<div class="cb-row" data-k="proj" data-i="${i}"><div class="cb-2"><input placeholder="Project name" data-f="name" value="${esc(r.name)}"><input placeholder="Tech / link" data-f="tech" value="${esc(r.tech)}"></div><textarea rows="2" placeholder="What you built and the result" data-f="bul">${esc(r.bul)}</textarea><button type="button" class="cb-del" aria-label="Remove">✕</button></div>`;
  }
  function renderRows(kind) { const box = $("#rows-" + kind); box.innerHTML = state[kind].map((r, i) => rowHTML(kind, i, r)).join(""); }
  ["exp", "edu", "proj"].forEach((kind) => {
    renderRows(kind);
    $("#add-" + kind).addEventListener("click", () => { state[kind].push(kind === "exp" ? { role: "", org: "", from: "", to: "", bul: "" } : kind === "edu" ? { deg: "", org: "", yr: "", note: "" } : { name: "", tech: "", bul: "" }); renderRows(kind); save(); render(); $("#rows-" + kind).lastElementChild.querySelector("input").focus(); });
    $("#rows-" + kind).addEventListener("input", (e) => { const row = e.target.closest(".cb-row"); if (!row) return; state[kind][+row.dataset.i][e.target.dataset.f] = e.target.value; save(); render(); });
    $("#rows-" + kind).addEventListener("click", (e) => { if (!e.target.classList.contains("cb-del")) return; const row = e.target.closest(".cb-row"); state[kind].splice(+row.dataset.i, 1); renderRows(kind); save(); render(); });
  });
  if (!state.exp.length && !state.edu.length) { state.exp.push({ role: "", org: "", from: "", to: "", bul: "" }); state.edu.push({ deg: "", org: "", yr: "", note: "" }); renderRows("exp"); renderRows("edu"); }
  $$(".cb-tpl button").forEach((b) => { b.classList.toggle("on", b.dataset.t === state.tpl); b.addEventListener("click", () => { state.tpl = b.dataset.t; $$(".cb-tpl button").forEach((x) => x.classList.toggle("on", x === b)); save(); render(); }); });
  $("#cb-clear").addEventListener("click", () => { if (!confirm("Clear everything?")) return; localStorage.removeItem(KEY); location.reload(); });

  // ---------- extra designs (single column, ATS-safe) ----------
  const DS = {
    horizon: { font: "Calibri", acc: "0F766E", nameC: "1A1A2E", nameS: 50, titleC: "0F766E", hC: "0F766E", hBottom: "B6D9D5", hSp: 40 },
    slate: { font: "Georgia", acc: "8A6D3B", nameC: "1E3A5F", nameS: 46, nameSp: 60, nameBold: false, titleC: "8A6D3B", titleCaps: true, titleSp: 80, center: true, cBottom: "1E3A5F", hC: "1E3A5F", hCenter: true, hSp: 80, size: 20 },
    crimson: { font: "Calibri", acc: "9F1239", nameC: "1A1A2E", nameS: 48, nameLeft: "9F1239", titleC: "9F1239", hC: "9F1239", hShade: "FCE7EC", hLeft: "9F1239", hSp: 40 },
    executive: { font: "Calibri", acc: "C99A00", band: "141A52", nameC: "FFFFFF", nameS: 48, titleC: "FFD23F", cC: "FFFFFF", hC: "141A52", hBottom: "C99A00", hSp: 30, frame: "141A52" },
    mono: { font: "Arial", acc: "374151", nameC: "111111", nameS: 44, titleC: "6B7280", titleBold: false, cBottom: "111111", hC: "111111", hSp: 100, hSize: 17, size: 19 },
    emerald: { font: "Calibri", acc: "047857", band: "ECFDF5", nameC: "064E3B", nameS: 48, titleC: "047857", cC: "1F2937", cBottom: "047857", hC: "064E3B", hBottom: "A7F3D0", hMark: "047857", hSp: 40 },
  };
  // ---------- preview ----------
  const lines = (t) => String(t || "").split(/\n/).map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  const list = (t) => String(t || "").split(/[,\n·]/).map((x) => x.trim()).filter(Boolean);
  function sections() {
    const grad = state.tpl === "grad"; const S = [];
    const expS = state.exp.filter((r) => r.role || r.org).length ? { h: grad ? "Internships & Experience" : "Experience", items: state.exp.filter((r) => r.role || r.org).map((r) => ({ t: [r.role, r.org].filter(Boolean).join("  —  "), d: [r.from, r.to].filter(Boolean).join(" – "), b: lines(r.bul) })) } : null;
    const eduS = state.edu.filter((r) => r.deg || r.org).length ? { h: "Education", items: state.edu.filter((r) => r.deg || r.org).map((r) => ({ t: [r.deg, r.org].filter(Boolean).join("  —  "), d: r.yr, b: r.note ? [r.note] : [] })) } : null;
    const projS = state.proj.filter((r) => r.name).length ? { h: "Projects", items: state.proj.filter((r) => r.name).map((r) => ({ t: [r.name, r.tech].filter(Boolean).join("  —  "), d: "", b: lines(r.bul) })) } : null;
    const skS = list(state.skills).length ? { h: "Skills", text: list(state.skills).join("  ·  ") } : null;
    const lgS = list(state.langs).length ? { h: "Languages", text: list(state.langs).join("  ·  ") } : null;
    const ctS = lines(state.certs).length ? { h: "Certificates", items: [{ t: "", d: "", b: lines(state.certs) }] } : null;
    const sumS = state.summary.trim() ? { h: "Summary", text: state.summary.trim() } : null;
    if (grad) [sumS, eduS, projS, expS, skS, lgS, ctS].forEach((x) => x && S.push(x)); else [sumS, expS, skS, eduS, projS, lgS, ctS].forEach((x) => x && S.push(x));
    return S;
  }
  function render() {
    const pv = $("#cb-pv"); pv.className = "cb-page " + state.tpl;
    const contact = [state.title, state.city, state.email, state.phone, state.linkedin].filter(Boolean).join("  ·  ");
    let h;
    if (DS[state.tpl]) {
      const c2 = [state.city, state.email, state.phone, state.linkedin].filter(Boolean).join(state.tpl === "slate" ? "   |   " : "  •  ");
      h = `<div class="hd"><div class="n">${esc(state.name) || '<span class="ph">Your Name</span>'}</div><div class="t">${esc(state.title) || '<span class="ph">Job title</span>'}</div><div class="c">${esc(c2) || '<span class="ph">City · Email · Phone · LinkedIn</span>'}</div></div>`;
    } else h = `<div class="n">${esc(state.name) || '<span class="ph">Your Name</span>'}</div><div class="c">${esc(contact) || '<span class="ph">Job title · City · Email · Phone · LinkedIn</span>'}</div>`;
    const S = sections();
    if (!S.length) h += `<p class="ph" style="margin-top:30px">Start typing on the left. Your CV appears here as you go.</p>`;
    for (const s of S) { h += `<h3>${esc(s.h)}</h3>`; if (s.text) h += `<p>${esc(s.text)}</p>`; if (s.items) for (const it of s.items) { if (it.t) h += `<div class="it"><b>${esc(it.t)}</b>${it.d ? `<span>${esc(it.d)}</span>` : ""}</div>`; if (it.b.length) h += `<ul>${it.b.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`; } }
    pv.innerHTML = h;
    const words = pv.innerText.trim().split(/\s+/).filter(Boolean).length; $("#cb-words").textContent = words + " words · " + (words > 650 ? "likely 2 pages" : "about 1 page");
  }
  render();

  // ---------- exports ----------
  function plainText() { const S = sections(); let t = `${state.name}\n${[state.title, state.city, state.email, state.phone, state.linkedin].filter(Boolean).join(" · ")}\n`; for (const s of S) { t += `\n${s.h.toUpperCase()}\n`; if (s.text) t += s.text + "\n"; if (s.items) for (const it of s.items) { if (it.t) t += it.t + (it.d ? " | " + it.d : "") + "\n"; it.b.forEach((b) => t += "- " + b + "\n"); } } return t; }
  const dl = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); if (window.UHNextStep) window.UHNextStep("builder"); };
  const fname = () => ((state.name || "my-cv").trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "my-cv") + "-cv";
  async function ensureDocx() { if (window.docx) return; await new Promise((r, j) => { const s = document.createElement("script"); s.src = "lib-docx.js?v=1"; s.onload = r; s.onerror = j; document.head.appendChild(s); }); }
  function buildNew(D) {
    const c = DS[state.tpl], S = c.size || 21, W = 11906 - 2160;
    const run = (t, o = {}) => new D.TextRun({ text: t, font: c.font, size: S, ...o });
    const shade = (f) => (f ? { type: D.ShadingType.CLEAR, color: "auto", fill: f } : undefined);
    const bd = (col, sz = 8, space = 2) => ({ style: D.BorderStyle.SINGLE, size: sz, color: col, space });
    const center = c.center ? D.AlignmentType.CENTER : undefined, pad = c.band ? " " : "";
    const leftBar = c.nameLeft ? { left: bd(c.nameLeft, 36, 8) } : undefined;
    const P = [];
    P.push(new D.Paragraph({ alignment: center, shading: shade(c.band), border: leftBar, spacing: { after: 0 }, children: [run(pad + (state.name || "Your Name"), { bold: c.nameBold !== false, size: c.nameS, color: c.nameC, characterSpacing: c.nameSp })] }));
    if (state.title) P.push(new D.Paragraph({ alignment: center, shading: shade(c.band), border: leftBar, spacing: { after: 40 }, children: [run(pad + (c.titleCaps ? state.title.toUpperCase() : state.title), { bold: c.titleBold !== false, size: 24, color: c.titleC, characterSpacing: c.titleSp })] }));
    const ct = [state.city, state.email, state.phone, state.linkedin].filter(Boolean).join(state.tpl === "slate" ? "   |   " : "  •  ");
    P.push(new D.Paragraph({ alignment: center, shading: shade(c.band), border: c.cBottom ? { bottom: bd(c.cBottom, 12, 6) } : undefined, spacing: { after: 160 }, children: [run(pad + ct, { size: 19, color: c.cC || "555555" })] }));
    const H = (t) => new D.Paragraph({ alignment: c.hCenter ? D.AlignmentType.CENTER : undefined, shading: shade(c.hShade), border: c.hBottom || c.hLeft ? { ...(c.hBottom ? { bottom: bd(c.hBottom, 6, 2) } : {}), ...(c.hLeft ? { left: bd(c.hLeft, 30, 6) } : {}) } : undefined, spacing: { before: 220, after: 60 }, children: [...(c.hMark ? [run("▍", { color: c.hMark, bold: true, size: 22 })] : []), run(t.toUpperCase(), { bold: true, size: c.hSize || 21, color: c.hC, characterSpacing: c.hSp })] });
    for (const s of sections()) {
      P.push(H(s.h));
      if (s.text) P.push(new D.Paragraph({ children: [run(s.text, { color: "444444" })], spacing: { after: 40 } }));
      if (s.items) for (const it of s.items) {
        if (it.t) { const [a, b] = it.t.split("  —  "); P.push(new D.Paragraph({ tabStops: [{ type: D.TabStopType.RIGHT, position: W }], spacing: { before: 80, after: 20 }, children: [run(a, { bold: true, color: "1A1A2E" }), ...(b ? [run("  ·  " + b, { bold: true, color: c.acc })] : []), ...(it.d ? [new D.TextRun({ children: [new D.Tab(), it.d], font: c.font, size: 19, color: "5B6391" })] : [])] })); }
        for (const b of it.b) P.push(new D.Paragraph({ children: [run(b, { color: "444444" })], bullet: { level: 0 }, spacing: { after: 20 } }));
      }
    }
    const page = { margin: { top: 900, bottom: 900, left: 1080, right: 1080 } };
    if (c.frame) page.borders = { pageBorders: { display: D.PageBorderDisplay.ALL_PAGES, offsetFrom: D.PageBorderOffsetFrom.PAGE }, pageBorderTop: bd(c.frame, 18, 24), pageBorderBottom: bd(c.frame, 18, 24), pageBorderLeft: bd(c.frame, 18, 24), pageBorderRight: bd(c.frame, 18, 24) };
    return new D.Document({ sections: [{ properties: { page }, children: P }] });
  }
  async function exportDocx() {
    const btns = [$("#cb-docx"), $("#cb-docx2")]; btns.forEach((b) => { b.disabled = true; b.textContent = "Building…"; });
    try {
      await ensureDocx(); const D = window.docx;
      if (DS[state.tpl]) { const blob = await D.Packer.toBlob(buildNew(D)); dl(blob, fname() + ".docx"); track("docx"); btns.forEach((b, i) => { b.disabled = false; b.textContent = i ? "⬇ Download Word" : "Download Word"; }); return; }
      const accent = state.tpl === "modern" ? "141A52" : state.tpl === "grad" ? "1A7A3C" : null; const gold = state.tpl === "modern";
      const P = [], run = (t, o = {}) => new D.TextRun({ text: t, font: "Calibri", size: 21, ...o });
      P.push(new D.Paragraph({ children: [run(state.name || "Your Name", { bold: true, size: 40, color: accent || "000000" })], spacing: { after: 0 } }));
      P.push(new D.Paragraph({ children: [run([state.title, state.city, state.email, state.phone, state.linkedin].filter(Boolean).join("  ·  "), { size: 20, color: "444444" })], spacing: { after: 120 } }));
      const H = (t) => new D.Paragraph({ children: [run(t.toUpperCase(), { bold: true, size: 22, color: accent || "000000" })], spacing: { before: 200, after: 40 }, border: gold ? { bottom: { style: D.BorderStyle.SINGLE, size: 8, color: "F5B70A", space: 1 } } : undefined });
      for (const s of sections()) {
        P.push(H(s.h));
        if (s.text) P.push(new D.Paragraph({ children: [run(s.text)], spacing: { after: 40 } }));
        if (s.items) for (const it of s.items) {
          if (it.t) P.push(new D.Paragraph({ children: [run(it.t, { bold: true }), ...(it.d ? [run("  |  " + it.d, { color: "555555" })] : [])], spacing: { after: 20 } }));
          for (const b of it.b) P.push(new D.Paragraph({ children: [run(b)], bullet: { level: 0 }, spacing: { after: 20 } }));
        }
      }
      const doc = new D.Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1150, right: 1150 } } }, children: P }] });
      const blob = await D.Packer.toBlob(doc); dl(blob, fname() + ".docx"); track("docx");
    } catch (e) { alert("Couldn't build the Word file. Try the PDF button instead."); }
    btns.forEach((b, i) => { b.disabled = false; b.textContent = i ? "⬇ Download Word" : "Download Word"; });
  }
  function exportPdf() { track("pdf"); const after = () => { window.removeEventListener("afterprint", after); if (window.UHNextStep) window.UHNextStep("builder-pdf"); }; window.addEventListener("afterprint", after); window.print(); }
  function track(k) { if (window.goatcounter && goatcounter.count) try { goatcounter.count({ path: "cv-builder/" + k, title: "CV builder " + k, event: true }); } catch (e) {} }
  $("#cb-docx").addEventListener("click", exportDocx); $("#cb-docx2").addEventListener("click", exportDocx);
  $("#cb-pdf").addEventListener("click", exportPdf); $("#cb-pdf2").addEventListener("click", exportPdf);
  $("#cb-match").addEventListener("click", () => { try { sessionStorage.setItem("uh-cv-text", plainText()); } catch (e) {} location.href = "cv-match.html#from-builder"; });
})();
