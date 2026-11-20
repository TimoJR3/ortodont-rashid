/* =========================================================
   ДАННЫЕ ВИЗИТКИ ORTODONT RASHID. Всё, что меняется, — только здесь.
   Квадратные скобки [ ] — заглушки. После изменения телефона, адреса или cardUrl
   выполнить: npm run assets (пересоздаст контакт .vcf и QR-коды).
   ========================================================= */
const CARD = {
  brand: "Ortodont Rashid",                 // надпись в логотипе
  name: "Рашид Гасанов",                    // имя врача
  role: "Врач-ортодонт",
  city: "Дербент",
  about: "Исправляю прикус у детей и взрослых: брекеты, элайнеры, ретейнеры. Первая консультация — осмотр, план лечения и честный ответ, сколько это займёт.",
  cardUrl: "https://ortodont-rashid.netlify.app/", // адрес визитки: зашит в QR и в контакт

  phoneDisplay: "+7 (960) 347-65-47",
  phoneTel: "+79603476547",
  whatsapp: "79603476547",                  // только цифры
  telegram: "",                             // ник без @ (пусто — строки нет)
  instagram: "https://www.instagram.com/ortodont.rashid/",

  address: "Республика Дагестан, г. Дербент, пер. Карла Маркса, 49А",
  mapUrl: "https://yandex.ru/maps/-/CXWwyEJ9",

  facts: ["Стаж: [00] лет", "Образование: [вуз, ординатура, год]", "[Курсы, сертификаты]"],

  // Работы «до и после». before/after — фото в папке src/works/ (только с письменного согласия пациента).
  // Пока там рисунки-примеры. Пустой список — раздел не показывается.
  works: [
    { title: "[Скученность зубов]", method: "[Брекеты, 18 месяцев]", before: "works/example-1-before.svg", after: "works/example-1-after.svg" },
    { title: "[Щель между зубами]", method: "[Элайнеры, 10 месяцев]", before: "works/example-2-before.svg", after: "works/example-2-after.svg" },
    { title: "[Глубокий прикус]", method: "[Брекеты, 24 месяца]", before: "works/example-3-before.svg", after: "works/example-3-after.svg" },
  ],

  clinic: "Стоматология IDEAL",             // где принимает (пусто — строки нет)
  clinicUrl: "https://stomatology-ideal.netlify.app/card/",
};
