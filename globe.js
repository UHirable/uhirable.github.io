// Rotating globe with a gold dot per covered country. Land data: land.json (Natural Earth, public domain).
(() => {
  const cv = document.getElementById("globe"); if (!cv || !window.UHGeo) return;
  // [longitude, latitude] of every country we may list. A dot is drawn for each country that is in the country dropdown
  // (our own jobs + live job sources), so the globe follows the list without edits.
  const AT = { "United States": [-98, 39], "Canada": [-100, 56], "Mexico": [-102, 23.5], "Brazil": [-52, -10], "Argentina": [-64, -34], "Colombia": [-73, 4], "Chile": [-71, -33],
    "United Kingdom": [-2, 54], "Ireland": [-8, 53.3], "Germany": [10.4, 51], "France": [2.4, 46.6], "Spain": [-3.7, 40.3], "Portugal": [-8, 39.6], "Italy": [12.5, 42.8], "Netherlands": [5.3, 52.2], "Belgium": [4.6, 50.6], "Luxembourg": [6.1, 49.8], "Switzerland": [8.2, 46.8], "Austria": [14.5, 47.6], "Denmark": [9.5, 56], "Sweden": [15.5, 61], "Norway": [9, 61], "Finland": [26, 63], "Poland": [19.3, 52], "Czech Republic": [15.4, 49.8], "Slovakia": [19.5, 48.7], "Hungary": [19.4, 47.2], "Romania": [25, 45.9], "Bulgaria": [25.3, 42.7], "Greece": [22, 39.2], "Croatia": [16, 45.3], "Slovenia": [14.8, 46.1], "Estonia": [25.5, 58.7], "Latvia": [25, 56.9], "Lithuania": [23.9, 55.2], "Cyprus": [33.2, 35], "Malta": [14.4, 35.9], "Ukraine": [31, 49], "Turkey": [35, 39],
    "Egypt": [30.5, 27], "United Arab Emirates": [54.4, 24.2], "Saudi Arabia": [45, 24.5], "Qatar": [51.2, 25.3], "Kuwait": [47.6, 29.3], "Bahrain": [50.5, 26.1], "Oman": [56.5, 21], "Jordan": [36.5, 31], "Morocco": [-6.5, 32], "Tunisia": [9.5, 34], "Nigeria": [8, 9.5], "Kenya": [38, 0.3], "Uganda": [32.4, 1.3], "Ghana": [-1.2, 7.9], "South Africa": [24.5, -29.5],
    "India": [79, 22], "Pakistan": [69.5, 30], "Sri Lanka": [80.7, 7.8], "Bangladesh": [90.3, 24], "Indonesia": [113, -1.5], "Philippines": [122, 12.5], "Malaysia": [102.5, 4], "Singapore": [103.8, 1.35], "Thailand": [101, 15.5], "Vietnam": [106, 16], "Japan": [138, 36.5], "South Korea": [127.8, 36.3], "China": [104, 35], "Australia": [134, -25], "New Zealand": [172, -42] };
  const sel = document.getElementById("country-filter");
  let DOTS = [];
  const refresh = () => {
    const names = new Set(["United States"]);
    if (sel) [...sel.options].forEach((o) => { if (AT[o.value]) names.add(o.value); });
    else ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Egypt"].forEach((c) => names.add(c));
    if (names.size === DOTS.length) return;
    DOTS = [...names].map((c) => [c, AT[c][0], AT[c][1]]);
    const n = document.getElementById("globe-n"); if (n) n.textContent = DOTS.length;
  };
  // the dropdown is filled by other scripts a moment after load (and again when the live sources answer)
  refresh(); let tries = 0; const iv = setInterval(() => { refresh(); if (++tries > 20) clearInterval(iv); }, 500);
  const ctx = cv.getContext("2d"), W = cv.width, R = W / 2 - 30, C = W / 2;
  const proj = UHGeo.geoOrthographic().scale(R).translate([C, C]).clipAngle(90);
  const path = UHGeo.geoPath(proj, ctx);
  let land = null, lon = -25, t0 = performance.now(), running = true;
  fetch("land.json").then((r) => r.json()).then((g) => { land = g; });
  // land colour by latitude (screen y): greens, with a sand band around 15–35° N (Sahara / Arabia) and a lighter south
  function landFill() {
    const y = (lat) => C - R * Math.sin(lat * Math.PI / 180);
    const g = ctx.createLinearGradient(0, y(80), 0, y(-60));
    g.addColorStop(0, "#9fb77a"); g.addColorStop(0.18, "#6f9e4b"); g.addColorStop(0.3, "#8fae52"); g.addColorStop(0.36, "#d9c48b"); g.addColorStop(0.44, "#e8d7a5"); g.addColorStop(0.5, "#c9b985"); g.addColorStop(0.58, "#6f9e4b"); g.addColorStop(0.72, "#4f8a3f"); g.addColorStop(0.86, "#8fae52"); g.addColorStop(1, "#b9c79a");
    return g;
  }
  function draw(now) {
    const dt = Math.min(0.1, (now - t0) / 1000); t0 = now; if (running) lon += dt * 6; proj.rotate([lon, -12]);
    ctx.clearRect(0, 0, W, W);
    // atmosphere
    const a = ctx.createRadialGradient(C, C, R * 0.95, C, C, R + 28); a.addColorStop(0, "rgba(120,170,255,.55)"); a.addColorStop(1, "rgba(120,170,255,0)");
    ctx.beginPath(); ctx.arc(C, C, R + 28, 0, Math.PI * 2); ctx.fillStyle = a; ctx.fill();
    // ocean
    const o = ctx.createRadialGradient(C - R * 0.35, C - R * 0.4, R * 0.1, C, C, R); o.addColorStop(0, "#2f7bff"); o.addColorStop(0.6, "#0f4fd6"); o.addColorStop(1, "#062a80");
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.fillStyle = o; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.clip();
    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = landFill(); ctx.fill();
      ctx.strokeStyle = "rgba(60,90,40,.35)"; ctx.lineWidth = 1; ctx.stroke();
      // soft relief: darker inner edge
      ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = .6; ctx.stroke();
    }
    // light & shadow (sun top-left)
    const sh = ctx.createRadialGradient(C - R * 0.45, C - R * 0.45, R * 0.2, C, C, R * 1.05); sh.addColorStop(0, "rgba(255,255,255,.22)"); sh.addColorStop(0.45, "rgba(255,255,255,0)"); sh.addColorStop(0.85, "rgba(0,10,60,.25)"); sh.addColorStop(1, "rgba(0,10,60,.6)");
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
    ctx.restore();
    // rim
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.strokeStyle = "rgba(200,225,255,.6)"; ctx.lineWidth = 2; ctx.stroke();
    // dots
    const pulse = (Math.sin(now / 400) + 1) / 2;
    for (const [name, lo, la] of DOTS) {
      // skip countries on the far side of the globe (the projection still returns a point for them)
      const D = Math.PI / 180, cl = -lon * D, cp = 12 * D;
      if (Math.sin(cp) * Math.sin(la * D) + Math.cos(cp) * Math.cos(la * D) * Math.cos(lo * D - cl) < 0.06) continue;
      const p = proj([lo, la]); if (!p) continue;
      ctx.beginPath(); ctx.arc(p[0], p[1], 13 + pulse * 14, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,210,63,${0.42 - pulse * 0.36})`; ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], 10.5, 0, Math.PI * 2); ctx.fillStyle = "#ffd23f"; ctx.fill(); ctx.strokeStyle = "#141a52"; ctx.lineWidth = 2.5; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  cv.addEventListener("mouseenter", () => { running = false; }); cv.addEventListener("mouseleave", () => { running = true; });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) running = false;
})();
