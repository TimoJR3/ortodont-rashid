# Ortodont Rashid — персональная визитка врача

Одностраничная визитка для QR-кода и NFC-метки: логотип с объёмным зубом, телефон, WhatsApp, Instagram,
адрес, «Сохранить контакт», «Поделиться», QR на экране и ссылка на визитку клиники «Стоматология IDEAL».

```
src/
  index.html, card.css, card.js   страница
  card-config.js                  ВСЕ данные визитки — менять только здесь
  contact.vcf, qr.svg             создаются командой npm run assets
  js/tooth.js, vendor/            3D-зуб (three.js 0.160.0, проверка SHA-256)
  fonts/                          шрифты Forum и Golos Text (локально, SIL OFL)
  _headers                        заголовки безопасности для Netlify
design/                           QR для печати: qr.png (3000 px), qr-logo.svg/png с логотипом
```

| Команда | Что делает |
|---|---|
| `npm start` | открыть визитку локально: http://127.0.0.1:8731 |
| `npm run assets` | заново создать контакт .vcf и QR-коды из card-config.js |
| `npm test` | проверки: файлы, CSP, библиотеки, данные, контакт |
| `npm run build` | собрать `dist/` (то же делает публикация) |

Публикация — GitHub Pages: после `git push` в `main` визитка сама проверяется и выкладывается
на `https://timojr3.github.io/ortodont-rashid/` (файл `.github/workflows/pages.yml`).
Если адрес поменяется (например, свой домен) — поменять `cardUrl`, выполнить `npm run assets`
и заново сделать `design/qr-logo.png`.
