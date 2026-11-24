// Erzeugt alle HTML-Seiten, sitemap.xml, robots.txt und 404.html.
// Aufruf im Ordner "site":  node _werkzeug/build.mjs
// Ordner mit Unterstrich veröffentlicht GitHub Pages nicht.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Die Adresse, unter der die Seite endgültig erreichbar ist (für Canonical, Sitemap, Social-Media-Vorschau).
const BASE = 'https://www.de-fazio.de/';
const VERSION = '20261124b'; // bei jeder Änderung an CSS/JS hochzählen, damit Browser neu laden
const TODAY = new Date().toISOString().slice(0, 10);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = (file, text) => fs.writeFileSync(path.join(root, file), text);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (file) => (file === 'index.html' ? BASE : BASE + file);

const FIRMA = {
  name: 'De Fazio Grafik- und Photodesign',
  inhaber: 'Renato De Fazio',
  strasse: 'Neuenkamper Str. 93',
  plz: '42657',
  ort: 'Solingen',
  telAnzeige: '0212 590960',
  tel: '+49212590960',
  telSchema: '+49 212 590960',
  ust: 'DE218498675',
};

const WERBEMITTEL = [
  { file: 'beach-flags.html', name: 'Beach Flags' },
  { file: 'kundenstopper.html', name: 'Kundenstopper' },
  { file: 'preistafeln.html', name: 'Preistafeln' },
  { file: 'gutscheine.html', name: 'Gutscheine' },
];

const KARTEN = [
  { n: 1, slug: 'mona-lisa', titel: 'Eiskarte Eiscafé Mona Lisa', name: 'Eiscafé Mona Lisa', art: 'Eiskarte', seiten: 32, w: 980, h: 1400, cover: 'karte-mona-lisa', cw: 780, ch: 1090 },
  { n: 2, slug: 'maurices-gelati', titel: 'Eiskarte Maurice’s Gelati', name: 'Maurice’s Gelati', art: 'Eiskarte', seiten: 14, w: 980, h: 1400, cover: 'karte-maurices-gelati', cw: 780, ch: 1090 },
  { n: 3, slug: 'la-fenice', titel: 'Eiskarte Gelateria La Fenice', name: 'Gelateria La Fenice', art: 'Eiskarte', seiten: 24, w: 980, h: 1400, cover: 'karte-la-fenice', cw: 780, ch: 1092 },
  { n: 4, slug: 'marco-polo-gelato', titel: 'Eiskarte Marco Polo Caffè & Gelato', name: 'Marco Polo Caffè & Gelato', art: 'Eiskarte', seiten: 28, w: 1400, h: 1400, cover: 'karte-marco-polo-gelato', cw: 778, ch: 778 },
  { n: 5, slug: 'marco-polo', titel: 'Snackkarte Marco Polo Caffè & Gelato', name: 'Marco Polo Caffè & Gelato', art: 'Snack- und Frühstückskarte', seiten: 16, w: 1400, h: 1400, cover: 'karte-marco-polo', cw: 780, ch: 778 },
  { n: 6, slug: 'cafe-minini', titel: 'Frühstückskarte Eis-Café Minini', name: 'Eis-Café Minini', art: 'Frühstücks- und Snackkarte', seiten: 20, w: 1400, h: 1400, cover: 'karte-cafe-minini', cw: 780, ch: 778 },
];

// Bild mit AVIF und JPG/PNG-Fallback
function pic(name, alt, w, h, { lazy = true, prio = false, cls = '', fallback = 'jpg', sizes = '' } = {}) {
  const a = lazy ? ' loading="lazy" decoding="async"' : '';
  const p = prio ? ' fetchpriority="high"' : '';
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="assets/bilder/${name}.avif"><img src="assets/bilder/${name}.${fallback}" alt="${esc(alt)}" width="${w}" height="${h}"${a}${p}${sizes}></picture>`;
}

function jsonld(page) {
  const firma = {
    '@type': 'LocalBusiness',
    '@id': BASE + '#firma',
    name: FIRMA.name,
    alternateName: 'DeFAZIO',
    description: 'Grafik- und Fotodesign aus Solingen: Eiskarten, Snack- und Frühstückskarten, Beach Flags, Kundenstopper, Preistafeln und Gutscheine für Eiscafés und Gastronomie, mit eigenem Bildarchiv.',
    url: BASE,
    logo: BASE + 'assets/bilder/logo.jpg',
    image: BASE + 'assets/bilder/og-bild.jpg',
    telephone: FIRMA.telSchema,
    vatID: FIRMA.ust,
    founder: { '@type': 'Person', name: FIRMA.inhaber },
    address: { '@type': 'PostalAddress', streetAddress: FIRMA.strasse, postalCode: FIRMA.plz, addressLocality: FIRMA.ort, addressRegion: 'Nordrhein-Westfalen', addressCountry: 'DE' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '17:00' }],
    areaServed: { '@type': 'Country', name: 'Deutschland' },
    knowsAbout: ['Eiskarten', 'Speisekarten', 'Foodfotografie', 'Werbemittel für Gastronomie', 'Beach Flags', 'Kundenstopper', 'Preistafeln', 'Gutscheine'],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Standard-Eiskarten mit Wire-O-Bindung', description: '50 Standard-Eiskarten, 16 Seiten (8 Blätter), Format geschlossen 21 × 29,7 cm, glänzende oder matte Cellophanierung, personalisiert mit Logo, Texten und Preisen.' }, priceSpecification: { '@type': 'PriceSpecification', minPrice: 798, priceCurrency: 'EUR', valueAddedTaxIncluded: false } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Personalisierte Eiskarten', description: '60 personalisierte Eis- oder Snackkarten, 16 Seiten, Format geschlossen 21 × 30 cm, Archivfotos, Drahtheftung und glänzende Cellophanierung.' }, priceSpecification: { '@type': 'PriceSpecification', minPrice: 1780, priceCurrency: 'EUR', valueAddedTaxIncluded: false } },
      ...WERBEMITTEL.map((w) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: w.name, url: url(w.file) } })),
    ],
  };
  const website = { '@type': 'WebSite', '@id': BASE + '#website', url: BASE, name: 'De Fazio', inLanguage: 'de-DE', publisher: { '@id': BASE + '#firma' } };
  const webpage = { '@type': page.schemaType || 'WebPage', '@id': url(page.file) + '#seite', url: url(page.file), name: page.title, description: page.desc, inLanguage: 'de-DE', isPartOf: { '@id': BASE + '#website' }, about: { '@id': BASE + '#firma' }, primaryImageOfPage: { '@type': 'ImageObject', url: BASE + (page.image || 'assets/bilder/og-bild.jpg') } };
  const graph = [firma, website, webpage];
  if (page.crumbs) {
    webpage.breadcrumb = { '@id': url(page.file) + '#pfad' };
    graph.push({ '@type': 'BreadcrumbList', '@id': url(page.file) + '#pfad', itemListElement: [{ name: 'Home', file: 'index.html' }, ...page.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: url(c.file) })) });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function nav(current) {
  const item = (file, name) => `<li><a class="nav-btn" href="${file === 'index.html' ? './' : file}"${current === file ? ' aria-current="page"' : ''}>${name}</a></li>`;
  const sub = WERBEMITTEL.map((w) => `<li><a href="${w.file}"${current === w.file ? ' aria-current="page"' : ''}>${w.name}</a></li>`).join('');
  return `<nav class="nav" aria-label="Hauptmenü"><ul class="nav-list">
  ${item('index.html', 'Home')}
  <li class="has-sub"><button class="nav-btn" type="button" aria-expanded="false" aria-controls="werbemittel">Werbemittel</button><ul class="sub" id="werbemittel">${sub}</ul></li>
  ${item('wiederverkaufer.html', 'Wiederverkäufer')}
  ${item('bildarchiv.html', 'Bildarchiv')}
  ${item('rechtliches.html', 'Rechtliches')}
</ul></nav>`;
}

function layout(page, body) {
  const image = BASE + (page.image || 'assets/bilder/og-bild.jpg');
  const robots = page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url(page.file)}">
<meta name="author" content="${FIRMA.name}">
<meta name="theme-color" content="#000000">
<meta name="format-detection" content="telephone=yes">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="De Fazio Grafik- und Photodesign">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.desc)}">
<meta property="og:url" content="${url(page.file)}">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${esc(page.imageAlt || 'Eiskarten von De Fazio Grafik- und Photodesign')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="DE-NW">
<meta name="geo.placename" content="Solingen">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/lato-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="site.css?v=${VERSION}">
${page.extraCss ? `<link rel="stylesheet" href="${page.extraCss}?v=${VERSION}">\n` : ''}<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${jsonld(page)}</script>
</head>
<body class="${page.bodyClass}">
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="head"><a href="./" aria-label="De Fazio Grafik- und Photodesign, zur Startseite">${pic('logo', 'DeFAZIO Grafik- und Photodesign', 778, 268, { lazy: false, prio: page.file !== 'index.html', cls: 'logo' })}</a></header>
${nav(page.file)}
<main class="main" id="inhalt">
<div class="wrap">
${body}
</div>
</main>
<footer class="foot">
  <div class="wrap">
    <a class="imp-link" href="rechtliches.html">Impressum / Datenschutz</a>
    <address>Inhaber:<br>${FIRMA.inhaber}<br>Grafik- und Photodesign<br>${FIRMA.strasse}<br>${FIRMA.plz} ${FIRMA.ort}<br>Telefon: <a href="tel:${FIRMA.tel}">${FIRMA.telAnzeige}</a></address>
  </div>
</footer>
<script src="site.js?v=${VERSION}" defer></script>
${page.extraJs ? `<script src="${page.extraJs}?v=${VERSION}" defer></script>\n` : ''}</body>
</html>
`;
}

const kontakt = `<div class="contact">
      <p>Näheres erfahren Sie unter unserer Hotline.</p>
      <p>Hotline: <a href="tel:${FIRMA.tel}">${FIRMA.telAnzeige}</a></p>
      <p>Montag bis Freitag von 8:00 - 17:00 Uhr.</p>
    </div>`;

const pages = [];

// Startseite
pages.push({
  file: 'index.html',
  bodyClass: 'home',
  title: 'Eiskarten & Werbemittel für Eiscafés | De Fazio Solingen',
  desc: 'Eiskarten, Snackkarten, Beach Flags, Kundenstopper, Preistafeln und Gutscheine für Eiscafés und Gastronomie – gestaltet und gedruckt von De Fazio in Solingen.',
  priority: '1.0',
  body: `<section class="slider" aria-label="Angebote">
  <div class="slide on">${pic('slide-standard-1190', 'Standard-Eiskarten mit Wire-O-Bindung ab 798,00 € zzgl. 19 % MwSt.: 50 Karten, 16 Seiten, 21 × 29,7 cm, glänzend oder matt cellophaniert, Gratis-Versand', 1190, 540, { lazy: false, prio: true })}</div>
  <div class="slide">${pic('slide-personalisiert-1190', 'Personalisierte Eiskarten ab 1.780,00 € zzgl. 19 % MwSt.: 60 Eis- oder Snackkarten, 16 Seiten, 21 × 30 cm, Archivfotos, Drahtheftung, Gratis-Versand', 1190, 540)}</div>
</section>
<div class="dots" aria-label="Angebot wählen"><button type="button" aria-label="Standard-Eiskarten"></button><button type="button" aria-label="Personalisierte Eiskarten"></button></div>

<section class="intro">
  <h1>Eiskarten und Werbemittel für Eiscafés und Gastronomie</h1>
  <p>De Fazio Grafik- und Photodesign aus Solingen gestaltet und druckt Eiskarten, Snack- und Frühstückskarten, Beach Flags, Kundenstopper, Preistafeln und Gutscheine. Die Fotos für Ihre Karte wählen Sie kostenlos aus unserem Bildarchiv mit über 1.600 Eisbechern und Getränken.</p>
</section>

<section aria-labelledby="muster">
  <h2 class="label" id="muster">Musterkarten bitte anklicken</h2>
  <ul class="cards">
${KARTEN.map((k) => `    <li><a href="musterkarte-${k.slug}.html" aria-label="Musterkarte ${esc(k.name)}, ${esc(k.art)} ansehen">${pic(k.cover, `Titelseite der ${k.art} ${k.name}`, k.cw, k.ch)}</a></li>`).join('\n')}
  </ul>
</section>

<section class="archiv-teaser" aria-labelledby="archiv-h">
  <div class="txt">
    <h2 id="archiv-h"><a href="bildarchiv.html" style="text-decoration:none">BILDARCHIV</a></h2>
    <p>„Sie haben die Qual der Wahl“ <br>In unserem Fotoarchiv finden Sie eine große Auswahl an Fotos. <br>Das Fotoarchiv wird ständig aktualisiert und erweitert, <br>damit unsere Kunden immer auf dem neuesten Stand sind.</p>
  </div>
  <a class="img pop" href="bildarchiv.html" aria-label="Zum Bildarchiv">${pic('bildarchiv', 'Auswahl aus dem Bildarchiv: Eisbecher, Pasta, Salate, Kaffee und Frühstück', 898, 898, { fallback: 'png' })}</a>
</section>

<nav class="tiles" aria-label="Werbemittel und Händler">
  <a class="tile pop" href="beach-flags.html"><span>Beach Flags</span>${pic('kachel-beach-flags', 'Beach Flags für Eiscafés in Tropfenform', 780, 1058)}</a>
  <a class="tile pop" href="kundenstopper.html"><span>Kundenstopper</span>${pic('kachel-kundenstopper', 'Kundenstopper mit Plakaten für Eisbecher und Kaffee', 774, 1050)}</a>
  <a class="tile pop" href="preistafeln.html"><span>Preistafeln</span>${pic('kachel-preistafeln', 'Preistafeln mit Fotos von Waffeleis', 780, 1058)}</a>
  <a class="tile pop" href="gutscheine.html"><span>Gutscheine</span>${pic('kachel-gutscheine', 'Gedruckte Gutscheine für Gastronomie', 778, 1230)}</a>
  <a class="tile pop" href="wiederverkaufer.html"><span>Händler</span>${pic('kachel-haendler', 'Werbeprodukte für Händler und Wiederverkäufer', 774, 1230)}</a>
</nav>`,
});

// Werbemittel-Unterseiten (Texte wie bisher)
const unter = [
  { file: 'beach-flags.html', name: 'Beach Flags', h1: 'Beach Flags – Machen Sie auf sich aufmerksam', bild: 'beach-flags', alt: 'Drei Beach Flags in Tropfenform für Eiscafés: Lido, Wundertüten und Eiscafé Markt-Passage',
    title: 'Beach Flags für Eiscafé & Gastronomie | De Fazio Solingen',
    desc: 'Beach Flags, die man nicht übersieht: individuell gestaltet für Neueröffnung, Aktion oder Ihr Eiscafé. Beratung unter 0212 590960 – De Fazio Grafik- und Photodesign.',
    text: ['Unsere Beach Flags kann man nicht übersehen! Sie transportieren Ihre Botschaft und können somit helfen, Ihren Umsatz zu steigern. Wir gestalten Ihre Beach Flag nach Ihren Wünschen. Ob eine Neueröffnung oder ein ganz besonderer Anlass ansteht, wir haben für jeden Anlass die richtige Lösung.'] },
  { file: 'kundenstopper.html', name: 'Kundenstopper', h1: 'Kundenstopper – Präsentieren Sie Ihre Produkte', bild: 'kundenstopper', alt: 'Zwei Kundenstopper mit Plakaten für Kaffee, Kuchen und Eisbecher',
    title: 'Kundenstopper & Poster für Gastronomie | De Fazio Solingen',
    desc: 'Langlebige Kundenstopper und passende Poster mit Motiven aus unserem Bildarchiv, für innen und außen, auch regenabweisend. Jetzt beraten lassen: 0212 590960.',
    text: ['Unsere langlebigen Kundenstopper können Ihnen helfen, Ihren Umsatz anzukurbeln. Sie haben bereits einen Kundenstopper? Und benötigen nur die Poster? Kein Problem. Suchen Sie sich aus unserem <a href="bildarchiv.html">Archiv</a> einige Bilder aus und wir machen für Sie den Rest. Wir drucken unsere Poster auf diverse Materialien für den Innen- und Außenbereich (auch regenabweisend).'] },
  { file: 'preistafeln.html', name: 'Preistafeln', h1: 'Preistafeln – Zeit ist Geld', bild: 'preistafeln', alt: 'Zwei Preistafeln mit Fotos von Waffeleis in vielen Sorten',
    title: 'Preistafeln für Eiscafé & Imbiss | De Fazio Solingen',
    desc: 'Preistafeln in vielen Materialien und Größen: die genaue Übersicht Ihrer Spezialitäten für den Verkauf außer Haus. De Fazio Grafik- und Photodesign, Solingen.',
    text: ['Unsere Preistafeln, ob klein oder groß, verschaffen den Kunden eine genaue Übersicht Ihrer Spezialitäten. Die Preistafeln sind unerlässlich für den Verkauf außer Haus. Wir haben viele Materialien und Größen im Angebot.'] },
  { file: 'gutscheine.html', name: 'Gutscheine', h1: 'Gutscheine – Die Geschenkidee', bild: 'gutscheine', alt: 'Gedruckte Gutscheine in mehreren Motiven für Eiscafés und Restaurants',
    title: 'Gutscheine drucken für Gastronomie | De Fazio Solingen',
    desc: 'Gutscheine für jeden Anlass – als Standardmodell oder individuell mit Ihrem Logo und Ihrer Adresse bedruckt. Viele Modelle für Eiscafés und Restaurants.',
    text: ['Für jeden Anlass einen Gutschein. Ob standard oder individuell mit Ihrem Logo und Adresse bedruckt. Wir können Ihnen eine Vielzahl an Modellen anbieten.'] },
  { file: 'wiederverkaufer.html', name: 'Wiederverkäufer', h1: 'Händler gesucht', bild: 'haendler', alt: 'Produktauswahl für Händler: Beach Flag, Eiskarten und Kundenstopper', top: true,
    title: 'Händler & Wiederverkäufer gesucht | De Fazio Solingen',
    desc: 'Wir suchen Händler und Wiederverkäufer für unsere Werbeprodukte rund um die Gastronomie: Eiskarten, Beach Flags, Kundenstopper und mehr. Kontakt: 0212 590960.',
    text: ['Für den Vertrieb unserer Produkte suchen wir Händler/Wiederverkäufer. Unser Produktportfolio an Werbeprodukten deckt alle Anforderungen rund um die Gastronomie ab. Sollten Sie an einer Zusammenarbeit interessiert sein, steht Ihnen Herr De Fazio zur Verfügung.'] },
];
for (const u of unter) {
  pages.push({
    file: u.file, bodyClass: 'page', title: u.title, desc: u.desc, priority: '0.8',
    image: `assets/bilder/${u.bild}.jpg`, imageAlt: u.alt,
    crumbs: [{ name: u.name, file: u.file }],
    body: `<article class="split">
  <div class="txt">
    <h1>${u.h1}</h1>
    ${u.text.map((t) => `<p>${t}</p>`).join('\n    ')}
    ${kontakt}
  </div>
  ${pic(u.bild, u.alt, 910, 910, { lazy: false, cls: 'bild' })}
</article>`,
  });
}

// Bildarchiv
pages.push({
  file: 'bildarchiv.html', bodyClass: 'arch', priority: '0.9', schemaType: 'CollectionPage',
  title: 'Bildarchiv: über 1.600 Eisbecher-Fotos | De Fazio Solingen',
  desc: 'Über 1.600 professionelle Fotos von Eisbechern, Spaghetti-Eis, Kinderbechern, Joghurtbechern und Getränken für Ihre Eiskarte – kostenlos auswählen bei De Fazio.',
  image: 'assets/bilder/bildarchiv.png', imageAlt: 'Auswahl aus dem Bildarchiv von De Fazio',
  crumbs: [{ name: 'Bildarchiv', file: 'bildarchiv.html' }],
  extraCss: 'archiv.css', extraJs: 'archiv.js',
  body: `<section aria-labelledby="arch-h">
  <div class="arch-top">
    <h1 id="arch-h">Bildarchiv – „Sie haben die Qual der Wahl“</h1>
    <p>In unserem Fotoarchiv finden Sie <span id="arch-count">über 1.600</span> Fotos von Eisbechern, Spaghetti-Eis, Kinder- und Joghurtbechern und Getränken. Das Fotoarchiv wird ständig aktualisiert und erweitert, damit unsere Kunden immer auf dem neuesten Stand sind.</p>
    <p class="arch-how">So geht’s: Tippen Sie bei den gewünschten Fotos auf <strong>„Auswählen“</strong>. Alles landet im <strong>Bestellkorb</strong>, und von dort schicken Sie uns Ihre Auswahl mit einem Klick per E-Mail. Aufschreiben müssen Sie nichts. Fragen? Hotline <a href="tel:${FIRMA.tel}">${FIRMA.telAnzeige}</a>.</p>
  </div>
  <div class="arch-toolbar">
    <div class="arch-tabs" id="arch-tabs" role="tablist" aria-label="Rubriken"></div>
    <button class="korb-btn" type="button" id="korb-open" aria-haspopup="dialog">Bestellkorb (0)</button>
  </div>
  <div class="arch-body">
    <div class="sorts">
      <label class="sorts-label" for="arch-select">Sorte</label>
      <select id="arch-select"></select>
      <ul id="arch-sorts"></ul>
    </div>
    <div class="arch-main">
      <p class="arch-now" id="arch-now" aria-live="polite"></p>
      <ul class="shots" id="arch-shots"></ul>
      <noscript><p>Für das Bildarchiv wird JavaScript benötigt. Rufen Sie uns gern an: ${FIRMA.telAnzeige}.</p></noscript>
    </div>
  </div>
</section>

<div class="korb-bar" id="korb-bar" hidden>
  <p><strong id="korb-bar-count">0 Fotos</strong> im Bestellkorb <span class="korb-msg" id="korb-bar-msg" aria-live="polite"></span></p>
  <button class="chip" type="button" id="korb-bar-open"><span class="d">Bestellkorb ansehen</span><span class="m">Ansehen</span> &amp; senden</button>
</div>

<dialog class="view" id="view" aria-labelledby="view-name">
  <div class="view-bar"><p class="view-meta" id="view-meta"></p><button class="chip" type="button" id="view-close">Schließen</button></div>
  <div class="view-stage"><img id="view-img" alt=""></div>
  <div class="view-foot">
    <button class="chip" type="button" id="view-prev">Zurück</button>
    <div class="view-mid"><p class="view-name">Bildname: <strong id="view-name"></strong></p><button class="pick big" type="button" id="view-pick" aria-pressed="false">In den Bestellkorb</button></div>
    <button class="chip" type="button" id="view-next">Weiter</button>
  </div>
</dialog>

<dialog class="korb" id="korb" aria-labelledby="korb-h">
  <div class="korb-head"><h2 id="korb-h">Ihr Bestellkorb</h2><button class="chip" type="button" id="korb-close">Schließen</button></div>
  <div class="korb-shared" id="korb-shared" hidden>
    <p>Diese Bildauswahl wurde per Link geteilt.</p>
    <div class="korb-actions"><button class="chip" type="button" id="korb-take">In meinen Bestellkorb übernehmen</button><button class="chip grey" type="button" id="korb-print-shared">Drucken / als PDF</button></div>
  </div>
  <p class="korb-empty" id="korb-empty">Noch keine Fotos ausgewählt. Tippen Sie im Archiv bei einem Foto auf „Auswählen“.</p>
  <ol class="korb-list" id="korb-list"></ol>
  <form class="korb-form" id="korb-form">
    <h3>Ihre Angaben</h3>
    <p class="korb-note">Damit Herr De Fazio Ihnen antworten kann. Die Angaben kommen nur in Ihre E-Mail und werden nirgends gespeichert.</p>
    <div class="korb-fields">
      <label>Ihr Name<input name="name" autocomplete="name"></label>
      <label>Eiscafé / Firma<input name="firma" autocomplete="organization"></label>
      <label>Telefon<input name="tel" type="tel" autocomplete="tel"></label>
      <label>E-Mail<input name="mail" type="email" autocomplete="email"></label>
      <label class="wide">Nachricht (optional)<textarea name="text" rows="3" placeholder="z. B. für welche Karte, wie viele Seiten, Wunschtermin"></textarea></label>
    </div>
    <div class="korb-actions">
      <button class="chip big" type="submit">Auswahl per E-Mail senden</button>
      <button class="chip grey" type="button" id="korb-print">Drucken / als PDF</button>
      <button class="chip grey" type="button" id="korb-copy">Liste kopieren</button>
      <button class="chip grey" type="button" id="korb-clear">Korb leeren</button>
    </div>
    <p class="korb-hint" id="korb-hint" aria-live="polite"></p>
  </form>
</dialog>`,
});

// Musterkarten
for (const k of KARTEN) {
  const others = KARTEN.filter((o) => o.slug !== k.slug);
  pages.push({
    file: `musterkarte-${k.slug}.html`, bodyClass: 'page book-page', priority: '0.6',
    title: `${k.titel}: Musterkarte | De Fazio`,
    desc: `Blättern Sie durch die ${k.art} von ${k.name} (${k.seiten} Seiten) – gestaltet und fotografiert von De Fazio in Solingen.`,
    image: `assets/bilder/${k.cover}.jpg`, imageAlt: `Titelseite der ${k.art} ${k.name}`,
    crumbs: [{ name: `Musterkarte ${k.name}`, file: `musterkarte-${k.slug}.html` }],
    body: `<section class="book-head">
  <h1>Musterkarte: ${k.art} ${esc(k.name)}</h1>
  <p>${k.seiten} Seiten, gestaltet und fotografiert von De Fazio. So kann auch Ihre Karte aussehen – rufen Sie uns an: <a href="tel:${FIRMA.tel}">${FIRMA.telAnzeige}</a>.</p>
</section>
<div class="book">
  <div class="pages" tabindex="0" aria-label="Seiten der Karte, mit Pfeiltasten blättern">
${Array.from({ length: k.seiten }, (_, i) => `    <figure><picture><source type="image/avif" srcset="assets/musterkarten/k${k.n}/${i + 1}.avif"><img src="assets/musterkarten/k${k.n}/${i + 1}.jpg" alt="${esc(k.art)} ${esc(k.name)}, Seite ${i + 1}" width="${k.w}" height="${k.h}"${i < 3 ? '' : ' loading="lazy" decoding="async"'}></picture></figure>`).join('\n')}
  </div>
  <div class="book-ctl"><button class="ctl-btn" type="button" data-dir="-1">Zurück</button><output aria-live="polite">Seite 1 von ${k.seiten}</output><button class="ctl-btn" type="button" data-dir="1">Weiter</button></div>
</div>
<section class="book-more" aria-labelledby="mehr">
  <h2 id="mehr">Weitere Musterkarten</h2>
  <ul>${others.map((o) => `<li><a href="musterkarte-${o.slug}.html">${esc(o.name)}${o.art !== 'Eiskarte' ? ` (${o.art})` : ''}</a></li>`).join('')}</ul>
</section>`,
  });
}

// Impressum und Datenschutz (Text unverändert von der bisherigen Seite)
const legal = JSON.parse(fs.readFileSync(path.join(root, '_werkzeug/rechtliches.json'), 'utf8'));
const impEnd = legal.findIndex((p) => p.t.startsWith('Datenschutzerklärung'));
const linkify = (p) => {
  let t = esc(p.t);
  for (const [txt, href] of p.links) t = t.replace(esc(txt), `<a href="${esc(href)}" rel="nofollow noopener">${esc(txt)}</a>`);
  return t;
};
const impHtml = legal.slice(0, impEnd).map((p, i) => {
  const gap = i > 0 && /^(Telefon|Geschäftsbezeichnung|Ust|Internet|Alle angegebenen)/.test(p.t) ? ' class="gap"' : '';
  const t = p.t.startsWith('Telefon') ? `Telefon: <a href="tel:${FIRMA.tel}">${FIRMA.telAnzeige}</a>` : linkify(p);
  return `<p${gap}>${t}</p>`;
}).join('\n');
const dsHtml = legal.slice(impEnd).map((p) => {
  if (p.t === 'Datenschutzerklärung') return `<h2>Datenschutzerklärung</h2>`;
  if (/^\d+\.\s/.test(p.t) && p.t.length < 120) return `<h3>${linkify(p)}</h3>`;
  if (/^[a-z]\)\s/.test(p.t) && p.t.length < 120) return `<h4>${linkify(p)}</h4>`;
  return `<p>${linkify(p).replace(/\n/g, '<br>')}</p>`;
}).join('\n');
pages.push({
  file: 'rechtliches.html', bodyClass: 'legal', noindex: true,
  title: 'Impressum & Datenschutz | De Fazio Grafik- und Photodesign',
  desc: 'Impressum und Datenschutzerklärung von De Fazio Grafik- und Photodesign, Inhaber Renato De Fazio, Neuenkamper Str. 93, 42657 Solingen.',
  crumbs: [{ name: 'Rechtliches', file: 'rechtliches.html' }],
  body: `<article class="legal-txt">
<h1>Impressum</h1>
<div class="imp">
${impHtml}
</div>
${dsHtml}
</article>`,
});

// 404
pages.push({
  file: '404.html', bodyClass: 'page', noindex: true, nositemap: true,
  title: 'Seite nicht gefunden | De Fazio Grafik- und Photodesign',
  desc: 'Diese Seite gibt es nicht. Hier geht es zu Eiskarten, Werbemitteln und dem Bildarchiv von De Fazio.',
  body: `<article class="split"><div class="txt"><h1>Diese Seite gibt es leider nicht</h1><p>Vielleicht hilft Ihnen einer dieser Wege weiter: <a href="./">Startseite</a>, <a href="bildarchiv.html">Bildarchiv</a>, <a href="beach-flags.html">Beach Flags</a> oder <a href="kundenstopper.html">Kundenstopper</a>.</p>${kontakt}</div></article>`,
});

for (const p of pages) write(p.file, layout(p, p.body));

// Sitemap, robots.txt, Manifest, Favicon
const inMap = pages.filter((p) => !p.noindex && !p.nositemap);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${inMap.map((p) => `  <url><loc>${url(p.file)}</loc><lastmod>${TODAY}</lastmod><priority>${p.priority || '0.5'}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *
Allow: /
Disallow: /_werkzeug/

Sitemap: ${BASE}sitemap.xml
`);
write('site.webmanifest', JSON.stringify({ name: FIRMA.name, short_name: 'De Fazio', start_url: './', display: 'browser', background_color: '#000000', theme_color: '#000000', icons: [{ src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }, null, 2));
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#000"/><text x="32" y="44" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#fff">DF</text><rect x="8" y="52" width="6" height="6" fill="#268bd2"/><rect x="50" y="52" width="6" height="6" fill="#268bd2"/></svg>`);

console.log('Seiten:', pages.map((p) => p.file).join(', '));
console.log('Sitemap:', inMap.length, 'Adressen');
