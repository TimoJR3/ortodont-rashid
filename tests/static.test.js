// Статические проверки визитки без браузера и без сети: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const SRC = path.join(__dirname, '..', 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const html = read('index.html');
const isLocal = (u) => !/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(u);
const walk = (dir, out = []) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const CARD = vm.runInContext(read('card-config.js') + '\n;CARD', vm.createContext({}));

test('все локальные файлы со страницы существуют', () => {
  for (const ref of [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter(isLocal)) {
    assert.ok(fs.existsSync(path.join(SRC, ref.split('?')[0])), 'нет файла ' + ref);
  }
});

test('нет встроенных скриптов, стилей, обработчиков и чужих CDN', () => {
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle="|\son[a-z]+="|<style[\s>]/i);
  assert.doesNotMatch(html, /<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//i);
  for (const f of walk(SRC).filter((x) => x.endsWith('.js') && !x.includes(path.sep + 'vendor' + path.sep))) {
    const js = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(js, /\b(eval|new Function)\s*\(|\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/, path.basename(f));
  }
});

test('_headers: строгий CSP и кэш библиотек', () => {
  const h = read('_headers');
  assert.match(h, /default-src 'none'; script-src 'self'/);
  assert.doesNotMatch(h, /unsafe-inline|unsafe-eval/);
  assert.match(h, /\/vendor\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(h, /\/contact\.vcf\s+Content-Type: text\/vcard/);
});

test('ссылки target="_blank" защищены rel="noopener"', () => {
  for (const m of html.matchAll(/<a\s[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="[^"]*noopener/, m[0]);
});

test('библиотеки не изменены (SHA-256 совпадают)', () => {
  for (const s of walk(path.join(SRC, 'vendor')).filter((f) => f.endsWith('SHA256SUMS'))) {
    for (const line of fs.readFileSync(s, 'utf8').trim().split(/\r?\n/)) {
      const [hash, name] = line.split(/\s+\*?/);
      const file = path.join(path.dirname(s), name.replace(/^\*/, ''));
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hash, name);
    }
  }
});

test('card-config.js: контакты допустимы, внешние ссылки только https', () => {
  assert.match(CARD.phoneTel, /^\+?\d{10,15}$/);
  assert.match(CARD.whatsapp, /^\d{10,15}$/);
  if (CARD.telegram) assert.match(CARD.telegram, /^[A-Za-z0-9_]{5,32}$/);
  for (const k of ['cardUrl', 'instagram', 'mapUrl', 'clinicUrl']) if (CARD[k]) assert.equal(new URL(CARD[k]).protocol, 'https:', k);
});

test('контакт (vCard) и QR совпадают с card-config.js', () => {
  const vcf = read('contact.vcf');
  assert.match(vcf, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.ok(vcf.includes('TEL;TYPE=WORK,VOICE:' + CARD.phoneTel + '\r\n'), 'телефон устарел — npm run assets');
  assert.ok(vcf.includes('URL:' + new URL(CARD.cardUrl).href + '\r\n'), 'адрес устарел — npm run assets');
  assert.ok(fs.existsSync(path.join(SRC, 'qr.svg')), 'нет qr.svg — npm run assets');
});
