// Готовит файлы визитки из src/card-config.js:
//   src/contact.vcf           — контакт для строки «Сохранить контакт»
//   src/qr.svg                — QR с логотипом для кнопки «Показать QR-код»
//   design/qr-logo.svg        — тот же QR для печати (PNG 3000 px сделать из него и проверить камерой)
//   design/qr.svg, qr.png     — QR без логотипа, 3000 px
// Запуск: npm run assets   (после изменения телефона, адреса или cardUrl)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const QRCode = require('qrcode');

const ROOT = path.join(__dirname, '..');
const CARD = vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/card-config.js'), 'utf8') + '\n;CARD', vm.createContext({}));
const url = new URL(CARD.cardUrl);
if (url.protocol !== 'https:') throw new Error('cardUrl должен начинаться с https://');

/* ---------- vCard 3.0 ---------- */
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const name = String(CARD.name).replace(/\s*\[[^\]]*\]/g, '').trim() || CARD.brand;
const vcf = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `N:;${esc(name)};;;`,
  `FN:${esc(name)} — ${esc(CARD.role)}`,
  `ORG:${esc(CARD.brand)}`,
  `TITLE:${esc(CARD.role)}`,
  `TEL;TYPE=WORK,VOICE:${String(CARD.phoneTel).replace(/[^\d+]/g, '')}`,
  `ADR;TYPE=WORK:;;${esc(CARD.address)};;;;`,
  `URL:${url.href}`,
  CARD.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${new URL(CARD.instagram).href}` : null,
  'END:VCARD',
  '',
].filter((l) => l !== null).join('\r\n');
fs.writeFileSync(path.join(ROOT, 'src/contact.vcf'), vcf);

/* ---------- QR ---------- */
(async () => {
  fs.mkdirSync(path.join(ROOT, 'design'), { recursive: true });
  const q = 4; // «тихая зона» вокруг кода
  const svgOf = (qr, skip) => {
    const n = qr.modules.size, data = qr.modules.data;
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (data[y * n + x] && !(skip && skip(x, y))) d += `M${x} ${y}h1v1h-1z`;
    return { n, d };
  };

  const plain = svgOf(QRCode.create(url.href, { errorCorrectionLevel: 'M' }));
  fs.writeFileSync(path.join(ROOT, 'design/qr.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-q} ${-q} ${plain.n + 2 * q} ${plain.n + 2 * q}" shape-rendering="crispEdges">
<rect x="${-q}" y="${-q}" width="${plain.n + 2 * q}" height="${plain.n + 2 * q}" fill="#ffffff"/>
<path fill="#080c15" d="${plain.d}"/>
</svg>
`);
  await QRCode.toFile(path.join(ROOT, 'design/qr.png'), url.href, { errorCorrectionLevel: 'M', width: 3000, margin: 4, color: { dark: '#080c15', light: '#ffffff' } });

  // QR с логотипом: уровень H выдерживает закрытые ~30% модулей, логотип закрывает ~8%
  const qh = QRCode.create(url.href, { errorCorrectionLevel: 'H' });
  const N = qh.modules.size, c = N / 2, R = N * 0.16;
  const withLogo = svgOf(qh, (x, y) => Math.hypot(x + 0.5 - c, y + 0.5 - c) < R + 0.6);
  const s = (R * 1.1) / 100; // зуб из символа 100×100
  const qrLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-q} ${-q} ${N + 2 * q} ${N + 2 * q}">
<rect x="${-q}" y="${-q}" width="${N + 2 * q}" height="${N + 2 * q}" fill="#ffffff"/>
<path fill="#080c15" shape-rendering="crispEdges" d="${withLogo.d}"/>
<circle cx="${c}" cy="${c}" r="${R}" fill="#8b9bb2"/>
<circle cx="${c}" cy="${c}" r="${(R * 0.86).toFixed(3)}" fill="#1f3a6b"/>
<g transform="translate(${(c - 50 * s).toFixed(3)} ${(c - 53 * s).toFixed(3)}) scale(${s.toFixed(5)})">
<path fill="#f3f5f8" d="M33 20c-10 0-17 8-17 19 0 9 4 14 6 22 3 10 3 25 11 25 7 0 6-15 11-20 3-3 9-3 12 0 5 5 4 20 11 20 8 0 8-15 11-25 2-8 6-13 6-22 0-11-7-19-17-19-7 0-11 4-17 4s-10-4-17-4z"/>
<path fill="none" stroke="#1f3a6b" stroke-width="3" stroke-linecap="round" d="M20 43 Q50 49 80 43"/>
<rect x="43" y="39" width="14" height="11" rx="2.5" fill="#1f3a6b"/>
</g>
</svg>
`;
  fs.writeFileSync(path.join(ROOT, 'src/qr.svg'), qrLogo);
  fs.writeFileSync(path.join(ROOT, 'design/qr-logo.svg'), qrLogo);
  console.log(`Готово: vCard, QR ${plain.n}×${plain.n} и ${N}×${N} (с логотипом) на ${url.href}`);
})();
