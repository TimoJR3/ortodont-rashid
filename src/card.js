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
