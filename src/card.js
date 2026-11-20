/* Визитка Ortodont Rashid: данные из card-config.js, «Поделиться», QR на экране.
   Весь текст выводится через textContent; внешние ссылки допускаются только https://. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const httpsOnly = (u) => { try { const x = new URL(u); return x.protocol === "https:" ? x.href : null; } catch { return null; } };

  const tg = String(CARD.telegram || "").replace(/[^A-Za-z0-9_]/g, "");
  const insta = httpsOnly(CARD.instagram);
  const instaNick = insta ? new URL(insta).pathname.split("/").filter(Boolean)[0] : "";

  const text = { ...CARD, telegramAt: tg ? "@" + tg : "", instagramAt: instaNick ? "@" + instaNick : "" };
  $$("[data-cfg]").forEach((n) => { const v = text[n.dataset.cfg]; if (v) n.textContent = v; });

  const hrefs = {
    tel: "tel:" + String(CARD.phoneTel).replace(/[^\d+]/g, ""),
    whatsapp: "https://wa.me/" + String(CARD.whatsapp).replace(/\D/g, ""),
    telegram: tg.length >= 5 ? "https://t.me/" + tg : null,
    instagram: insta,
    map: httpsOnly(CARD.mapUrl),
    clinic: httpsOnly(CARD.clinicUrl),
  };
  $$("[data-href]").forEach((a) => { const h = hrefs[a.dataset.href]; if (h) a.href = h; });

  // строки без данных (нет Telegram, нет клиники) не показываем
  const has = { telegram: !!hrefs.telegram, instagram: !!insta, clinic: !!(CARD.clinic && hrefs.clinic) };
  $$("[data-need]").forEach((n) => { if (!has[n.dataset.need]) n.remove(); });

  const facts = $("#facts");
  (CARD.facts || []).forEach((f) => { const li = document.createElement("li"); li.textContent = f; facts.append(li); });
  if (!facts.children.length) facts.closest("section").remove();

  /* ---------- до / после: шторка ---------- */
  const localPath = (p) => /^works\/[\w-]+\.(svg|webp|jpe?g|png)$/.test(p || ""); // только свои файлы
  const works = (CARD.works || []).filter((w) => localPath(w.before) && localPath(w.after));
  const tabs = $("#case-tabs"), frame = $(".ba-frame"), range = $("#ba-range");
  const imgBefore = $("#ba-before"), imgAfter = $("#ba-after");
  const setPos = (v) => frame.style.setProperty("--pos", v + "%");
  range.addEventListener("input", () => setPos(range.value));
  function show(i) {
    const w = works[i];
    imgBefore.src = w.before; imgAfter.src = w.after;
    imgBefore.alt = "До лечения: " + w.title; imgAfter.alt = "После лечения: " + w.title;
    $("#ba-title").textContent = w.title; $("#ba-method").textContent = w.method;
    [...tabs.children].forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    range.value = 50; setPos(50);
  }
  works.forEach((w, i) => {
    const t = document.createElement("button");
    t.className = "case-tab"; t.textContent = "Случай " + (i + 1);
    t.type = "button"; t.setAttribute("role", "tab"); t.setAttribute("aria-controls", "ba");
    t.addEventListener("click", () => show(i));
    t.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); const n = (i + d + works.length) % works.length; show(n); tabs.children[n].focus();
    });
    tabs.append(t);
  });
  if (works.length) show(0); else $("#works").remove();
  if (works.length < 2) tabs.remove();

  // подсказка: шторка один раз «покачивается», когда блок впервые появляется на экране
  if (works.length && !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const start = performance.now();
      (function wiggle(now) {
        const t = (now - start) / 1600; if (t >= 1) { setPos(range.value); return; }
        setPos((50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t)).toFixed(1));
        requestAnimationFrame(wiggle);
      })(start);
    }, { threshold: 0.6 });
    io.observe(frame);
  }

  /* ---------- QR на экране ---------- */
  const dlg = $("#qr-dialog");
  $("#qr-open").addEventListener("click", () => (dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "")));
  $("#qr-close").addEventListener("click", () => (dlg.close ? dlg.close() : dlg.removeAttribute("open")));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- «Поделиться» ---------- */
  const status = $("#share-status");
  const url = httpsOnly(CARD.cardUrl) || location.href;
  $("#share").addEventListener("click", async () => {
    try {
      if (navigator.share) { await navigator.share({ title: CARD.brand, text: CARD.role + " " + CARD.name, url }); return; }
      await navigator.clipboard.writeText(url);
      status.textContent = "Ссылка на визитку скопирована";
    } catch (err) {
      if (err && err.name === "AbortError") return;
      status.textContent = "Ссылка: " + url;
    }
  });
})();
