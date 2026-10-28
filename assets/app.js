/* Learn-AI handbook — platform switch, self-check, progress tracker, copy buttons.
   Plain script (no modules): nginx on this host has no .mjs MIME entry. */
(function () {
  "use strict";
  var root = document.documentElement;
  var T = {};
  try { T = JSON.parse(document.getElementById("la-i18n").textContent); } catch (e) {}

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  /* ---- platform switch (B站 / YouTube) ---- */
  function setPlatform(p, save) {
    root.setAttribute("data-platform", p);
    document.querySelectorAll("[data-set-platform]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-platform") === p));
    });
    if (save) store("learn-ai-platform", p);
  }
  document.querySelectorAll("[data-set-platform]").forEach(function (b) {
    b.addEventListener("click", function () { setPlatform(b.getAttribute("data-set-platform"), true); });
  });
  setPlatform(root.getAttribute("data-platform") || "yt", false);

  /* ---- self-check ---- */
  var quiz = document.getElementById("quiz");
  if (quiz && T.quiz) {
    var answers = {};
    var out = document.getElementById("quiz-result");
    quiz.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-q");
        answers[q] = b.getAttribute("data-v") === "y";
        quiz.querySelectorAll('[data-q="' + q + '"]').forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        render();
      });
    });
    function render() {
      var n = T.quiz.qs.length, got = Object.keys(answers).length;
      out.classList.add("on");
      if (got < n) {
        out.innerHTML = "<p class='muted' style='margin:0'>" + T.quiz.left.replace("{n}", n - got) + "</p>";
        return;
      }
      var gaps = [];
      T.quiz.qs.forEach(function (q, i) { if (q.fix && !answers[i]) gaps.push(q.fix); });
      var start = gaps.length ? 0 : !answers[5] ? 1 : !answers[6] ? 2 : 3;
      var r = T.quiz.res[start];
      var html = "<strong>" + r.t + "</strong><p style='margin:6px 0 0'>" + r.d + "</p>";
      if (gaps.length) {
        html += "<ul>" + gaps.map(function (g) { return "<li>" + g + "</li>"; }).join("") + "</ul>";
      }
      html += "<p style='margin:12px 0 0'><a class='btn btn-dark' href='#s" + start + "'>" + T.quiz.go.replace("{n}", start) + " ›</a></p>";
      out.innerHTML = html;
    }
  }

  /* ---- progress tracker (stored per browser; same keys across languages) ---- */
  var KEY = "learn-ai-progress";
  var done = {};
  try { (JSON.parse(store(KEY) || "[]") || []).forEach(function (k) { done[k] = 1; }); } catch (e) {}
  var boxes = document.querySelectorAll("input[data-pk]");
  function paint() {
    var total = boxes.length, n = 0;
    boxes.forEach(function (b) {
      var on = !!done[b.getAttribute("data-pk")];
      b.checked = on;
      if (on) n++;
      var card = b.closest(".course");
      if (card) card.classList.toggle("is-done", on);
    });
    var pct = total ? Math.round((n / total) * 100) : 0;
    document.querySelectorAll("[data-prog-count]").forEach(function (el) { el.textContent = n + "/" + total; });
    document.querySelectorAll(".barfill").forEach(function (el) { el.style.width = pct + "%"; });
    var txt = document.getElementById("prog-text");
    if (txt && T.progress) txt.textContent = T.progress.status.replace("{n}", n).replace("{t}", total).replace("{p}", pct);
  }
  boxes.forEach(function (b) {
    b.addEventListener("change", function () {
      var k = b.getAttribute("data-pk");
      if (b.checked) done[k] = 1; else delete done[k];
      store(KEY, JSON.stringify(Object.keys(done)));
      paint();
    });
  });
  var reset = document.getElementById("prog-reset");
  if (reset) reset.addEventListener("click", function () {
    if (!window.confirm(T.progress ? T.progress.confirm : "Reset?")) return;
    done = {};
    store(KEY, "[]");
    paint();
  });
  paint();

  /* ---- copy buttons on code blocks ---- */
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = document.getElementById(btn.getAttribute("data-copy"));
      var text = pre ? pre.innerText : "";
      function ok() {
        btn.textContent = T.copied || "Copied";
        setTimeout(function () { btn.textContent = T.copy || "Copy"; }, 1600);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(ok, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); ok(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
})();
