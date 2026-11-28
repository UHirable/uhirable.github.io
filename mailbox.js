// "Get your code" buttons that open an email: instead of relying only on a mail app (which many computers do not have set up),
// a small box offers three ways: Gmail, the mail app, or copy the message. Any link like mailto:... with data-mail or class pjo-c uses it.
(function () {
  var box, last;
  function parse(href) {
    var q = href.replace(/^mailto:/i, ""), i = q.indexOf("?"), to = decodeURIComponent(i < 0 ? q : q.slice(0, i)), p = new URLSearchParams(i < 0 ? "" : q.slice(i + 1));
    return { to: to, subject: p.get("subject") || "", body: p.get("body") || "" };
  }
  function count(path, title) { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: path, title: title, event: true }); } catch (x) {} }
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  function close() { if (!box) return; box.hidden = true; document.body.classList.remove("mbx-open"); if (last && last.focus) last.focus(); }
  function build() {
    box = document.createElement("div");
    box.className = "mbx"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "mbx-t");
    box.innerHTML = '<div class="mbx-box"><button type="button" class="mbx-x" aria-label="Close">&times;</button>' +
      '<h3 id="mbx-t">Get your code</h3>' +
      '<p>Send us a short email with your company name, your country and the plan you want. We reply with your code and the sign-up link.</p>' +
      '<a class="mbx-b mbx-g" data-c="gmail" target="_blank" rel="noopener" href="#">Open in Gmail</a>' +
      '<a class="mbx-b" data-c="app" href="#">Open my mail app</a>' +
      '<button type="button" class="mbx-b" data-c="copy">Copy the message</button>' +
      '<small>Or write to <b class="mbx-to"></b></small><span class="mbx-s" role="status"></span></div>';
    document.body.appendChild(box);
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.closest(".mbx-x")) return close();
      var b = e.target.closest("[data-c]"); if (!b) return;
      count("mail-choice/" + b.dataset.c + "/" + slug(box.dataset.n), "Code request via " + b.dataset.c + ": " + box.dataset.n);
      if (b.dataset.c === "copy") {
        var m = box.dataset.to + "\n" + box.dataset.subject + "\n\n" + box.dataset.body, s = box.querySelector(".mbx-s");
        var done = function () { s.textContent = "Copied. Paste it in a new email."; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(done, function () { s.textContent = box.dataset.to; });
        else { var t = document.createElement("textarea"); t.value = m; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (x) { s.textContent = box.dataset.to; } t.remove(); }
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box && !box.hidden) close(); });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[data-mail], a.pjo-c[href^="mailto:"]');
    if (!a) return;
    e.preventDefault();
    var m = parse(a.getAttribute("href")), name = a.dataset.mail || a.dataset.n || "";
    if (!box) build();
    last = a; box.dataset.to = m.to; box.dataset.subject = m.subject; box.dataset.body = m.body; box.dataset.n = name;
    box.querySelector(".mbx-to").textContent = m.to; box.querySelector(".mbx-s").textContent = "";
    box.querySelector('[data-c="gmail"]').href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(m.to) + "&su=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);
    box.querySelector('[data-c="app"]').href = a.getAttribute("href");
    box.hidden = false; document.body.classList.add("mbx-open");
    box.querySelector(".mbx-g").focus();
  });
})();
