// Pages HTML : coque commune (menu, pied de page), liste, article, bandeau d'accueil. Aucun contenu éditorial.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, esc, jsonLd, slugify, prefixRel, formatDate, assetSrc } from './util.mjs';
import { renderBlocks } from './blocks.mjs';

export const urlFor = (m, lang, kind, slug) => {
  const base = lang === 'fr' ? `${m.ui.site}/fr` : m.ui.site;
  return kind === 'list' ? `${base}/news.html` : `${base}/news/${slug}.html`;
};

/** Morceaux repris de l'historique : le menu et le pied de page restent définis à un seul endroit. */
function shell(m, lang) {
  const s = fs.readFileSync(path.join(m.root, lang === 'fr' ? 'fr/history.html' : 'history.html'), 'utf8');
  const t = m.ui.labels[lang];
  const sym = s.slice(s.indexOf('<svg xmlns'), s.indexOf('</svg>') + 6);
  const hs = s.indexOf('<header class="site-header">');
  let header = s.slice(hs, s.indexOf('<div class="subnav">', hs)) + '</header>';
  header = header.replace(/\s+aria-current="page"/g, '');
  header = header.replace(new RegExp(`<a href="news\\.html">${t.news}</a>`), `<a href="news.html" aria-current="page">${t.news}</a>`);
  const fs0 = s.indexOf('<footer class="site-footer">');
  const footer = s.slice(fs0, s.indexOf('</footer>') + 9);
  const hd = s.indexOf('<link rel="icon" href=');
  const headLinks = s.slice(hd, s.indexOf('<link rel="preload"')).replace(/\s+$/, '');
  return { sym, header, footer, headLinks };
}

function langBlocks(t, lang, here, other) {
  const en = lang === 'en' ? here : other;
  const fr = lang === 'fr' ? here : other;
  const sw = lang === 'en'
    ? `<span class="lang" role="group" aria-label="${t.langLabel}">
          <a class="active" href="${en}" hreflang="en" lang="en" aria-current="true">EN</a>
          <a href="${fr}" hreflang="fr" lang="fr">FR</a>
        </span>`
    : `<span class="lang" role="group" aria-label="${t.langLabel}">
          <a href="${en}" hreflang="en" lang="en">EN</a>
          <a class="active" href="${fr}" hreflang="fr" lang="fr" aria-current="true">FR</a>
        </span>`;
  const foot = `<nav class="footer-languages" aria-label="${t.langLabel}">
          <a href="${en}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="page"' : ''}>English</a>
          <a href="${fr}" hreflang="fr" lang="fr"${lang === 'fr' ? ' aria-current="page"' : ''}>Français</a>
        </nav>`;
  return { sw, foot };
}

function page(m, { lang, depthPrefix, here, other, title, description, canonical, alt, ogType, extraHead, main, bodyClass }) {
  const sh = shell(m, lang);
  const t = m.ui.labels[lang];
  const { sw, foot } = langBlocks(t, lang, here, other);
  const fix = (h) => prefixRel(h, depthPrefix);
  const header = fix(sh.header).replace(/<span class="lang"[\s\S]*?<\/span>/, sw);
  const footer = fix(sh.footer).replace(/<nav class="footer-languages"[\s\S]*?<\/nav>/, foot);
  const links = fix(sh.headLinks);
  const img = `${m.ui.site}/assets/images/og.jpg`;
  // Les liens du <head> de l'historique FR sont déjà relatifs à fr/ (../assets) : le CSS ajouté ici doit remonter d'un niveau de plus.
  const css = `  <link rel="stylesheet" href="${depthPrefix}${lang === 'fr' ? '../' : ''}assets/css/news-layouts.css?v=${m.bundle.cssVersion || 1}">\n`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="${t.ogLocale}">
  <meta property="og:locale:alternate" content="${t.ogAlt}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="628">
  <meta property="og:image:alt" content="${esc(alt)}">
  <meta property="og:url" content="${canonical.self}">
  <meta property="og:site_name" content="AI-KIDO">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${img}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonical.self}">
  <link rel="alternate" hreflang="en" href="${canonical.en}">
  <link rel="alternate" hreflang="fr" href="${canonical.fr}">
  <link rel="alternate" hreflang="x-default" href="${canonical.en}">
  ${links}
${css}${extraHead || ''}</head>
<body class="${bodyClass || 'inner'}">
${fix(sh.sym)}

  ${header}

  <main id="top">
${main}
  </main>

  ${footer}

</body>
</html>
`;
}

const focusStyle = (it) => (it.focus ? ` style="object-position: ${esc(it.focus)}"` : '');

export function renderList(m, lang) {
  const t = m.ui.labels[lang];
  const up = lang === 'fr' ? '../' : '';
  const cards = m.items.map((it, index) => {
    const c = it[lang]; const a = m.assets[it.image];
    return `          <article class="card news-card" data-news-date="${it.date}" data-news-nature="${esc(it.nature)}" data-news-domains="${esc(it.domains.join(' '))}"${index >= 9 ? ' hidden' : ''}>
            <img class="card-img" src="${up}${a.src}" alt="${esc(a.alt[lang])}" width="${a.width}" height="${a.height}" loading="lazy" decoding="async"${focusStyle(it)}>
            <p class="news-meta"><span class="tag">${esc(it.tag[lang])}</span><time datetime="${it.date}">${formatDate(it.date, lang, m.root)}</time></p>
            <h2><a href="news/${it.slug}.html">${esc(c.title)}</a></h2>
            <p>${esc(c.summary)}</p>
            <a class="more" href="news/${it.slug}.html">${t.readMore}<span class="sr-only"> : ${esc(c.title)}</span></a>
          </article>`;
  }).join('\n');
  const main = `    <section class="news-intro">
      <div class="container">
        <h1>${t.listH1}</h1>
        <p class="lead">${t.listLead}</p>
      </div>
    </section>

    <section class="news-list" id="news-list" aria-label="${esc(t.listH1)}" tabindex="-1" data-news-pagination>
      <div class="container">
        <div class="news-filters" hidden>
          <label>${esc(t.nature)} <select data-news-nature><option value="">${esc(t.allNatures)}</option>${Object.entries(m.taxonomy.natures).filter(([id]) => m.items.some((it) => it.nature === id)).map(([id, labels]) => `<option value="${id}">${esc(labels[lang])}</option>`).join('')}</select></label>
          <label>${esc(t.domain)} <select data-news-domain><option value="">${esc(t.allDomains)}</option>${Object.entries(m.taxonomy.domains).filter(([id]) => m.items.some((it) => it.domains.includes(id))).map(([id, labels]) => `<option value="${id}">${esc(labels[lang])}</option>`).join('')}</select></label>
          <label>${esc(t.year)} <select data-news-year><option value="">${esc(t.allYears)}</option>${[...new Set(m.items.map((it) => it.date.slice(0, 4)))].map((year) => `<option value="${year}">${year}</option>`).join('')}</select></label>
          <label>${esc(t.month)} <select data-news-month><option value="">${esc(t.allMonths)}</option>${[...new Set(m.items.map((it) => it.date.slice(5, 7)))].sort().map((month) => `<option value="${month}">${esc(m.ui.months[lang][Number(month) - 1])}</option>`).join('')}</select></label>
        </div>
        <div class="grid cols-3">
${cards}
        </div>
        <nav class="news-pagination" aria-label="${esc(t.pagination)}" hidden>
          <button type="button" data-news-previous>${esc(t.previousPage)}</button>
          <p role="status" aria-live="polite" aria-atomic="true" data-news-page-label="${esc(t.pageStatus)}" data-news-empty-label="${esc(t.noArticles)}"></p>
          <button type="button" data-news-next>${esc(t.nextPage)}</button>
        </nav>
      </div>
    </section>
`;
  const self = urlFor(m, lang, 'list');
  const ld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.listH1, url: self, inLanguage: lang,
    hasPart: m.items.map((it) => ({ '@type': 'Article', headline: it[lang].title, datePublished: it.date, url: urlFor(m, lang, 'article', it.slug) })) };
  return page(m, {
    lang, depthPrefix: '', here: 'news.html', other: lang === 'fr' ? '../news.html' : 'fr/news.html',
    title: t.listTitle, description: t.listDescription, ogType: 'website', alt: t.listH1,
    canonical: { self, en: urlFor(m, 'en', 'list'), fr: urlFor(m, 'fr', 'list') },
    extraHead: `  <script type="application/ld+json">${jsonLd(ld)}</script>
  <link rel="stylesheet" href="${up}assets/css/news-pagination.css?v=1">
  <noscript><style>.news-list .news-card[hidden] { display: flex; }</style></noscript>
  <script src="${up}assets/js/news-pagination.js?v=1" defer></script>\n`, main,
  });
}

function heroHtml(m, it, lang, up) {
  const a = m.assets[it.image];
  return `<img class="article-hero" src="${up}${a.src}" alt="${esc(a.alt[lang])}" width="${a.width}" height="${a.height}" decoding="async"${focusStyle(it)}>`;
}

/** Temps de lecture estimé (200 mots par minute) à partir du texte de tous les blocs. */
export function readingMinutes(body) {
  const words = JSON.stringify(body).replace(/<[^>]+>/g, ' ').replace(/"[a-z]+":/g, ' ').split(/\s+/).filter((w) => /\w/.test(w)).length;
  return Math.max(1, Math.round(words / 200));
}

export function renderArticleNav(m, lang, i) {
  const t = m.ui.labels[lang];
  const newer = m.items[i - 1]; const older = m.items[i + 1];
  const pn = [];
  if (newer) pn.push(`<a class="newer" href="${newer.slug}.html" rel="next">← ${t.newer} : ${esc(newer[lang].title)}</a>`);
  if (older) pn.push(`<a class="older" href="${older.slug}.html" rel="prev">${t.older} : ${esc(older[lang].title)} →</a>`);
  return pn.length ? `\n        <nav class="article-nav" aria-label="${t.news}">\n          ${pn.join('\n          ')}\n        </nav>` : '';
}

export function renderArticle(m, lang, i) {
  const it = m.items[i]; const c = it[lang]; const t = m.ui.labels[lang]; const lay = m.layouts[it.layout];
  const up = lang === 'fr' ? '../../' : '../';
  const body = renderBlocks(c.body, { lang, up, rel: '../', assets: m.assets, diagrams: m.diagrams, ui: m.ui });
  const heads = c.body.filter((b) => b && typeof b === 'object' && 'h2' in b).map((b) => b.h2);
  const toc = heads.length
    ? `<nav class="article-toc" aria-label="${esc(t.toc)}"><strong>${esc(t.toc)}</strong><ol>${heads.map((h) => `<li><a href="#${slugify(h)}">${esc(h)}</a></li>`).join('')}</ol></nav>`
    : '';
  const classes = ['news-article', `nl-${lay.id}`, `hero-${lay.hero}`, `w-${lay.width}`, `acc-${lay.accent}`, `lead-${lay.lead}`, `h2-${lay.h2}`, lay.dropcap ? 'dropcap' : '',
    `title-${lay.title || 'normal'}`, `meta-${lay.meta || 'inline'}`, `body-${lay.body || 'prose'}`, 'rail-toc-cta'].filter(Boolean).join(' ');
  const heroTop = lay.hero !== 'none' && lay.hero !== 'left' ? `\n        ${heroHtml(m, it, lang, up)}` : '';
  const when = `<time datetime="${it.date}">${formatDate(it.date, lang, m.root)}</time>`;
  const mins = `<span class="read">${readingMinutes(c.body)} ${t.minRead}</span>`;
  const metaLine = (lay.meta || 'inline') === 'byline'
    ? `<p class="news-meta byline"><span class="by">${t.by} <strong>AI-KIDO</strong></span><span class="sep" aria-hidden="true">·</span>${when}<span class="sep" aria-hidden="true">·</span>${mins}<span class="tag">${esc(it.tag[lang])}</span></p>`
    : `<p class="news-meta"><span class="tag">${esc(it.tag[lang])}</span>${when}${(lay.meta || 'inline') === 'mono' ? mins : ''}</p>`;
  const cta = `<aside class="article-cta" aria-label="${esc(t.ctaTitle)}"><strong>${esc(t.ctaTitle)}</strong><p>${esc(t.ctaText)}</p><a class="cta-btn" href="../install.html">${esc(t.ctaLabel)}</a></aside>`;
  const bodyHtml = `<div class="article-body">
          ${body}
        </div>`;
  const mobile = `<div class="article-mobile-tools">
          ${toc ? `<details name="article-tools"><summary>${esc(t.toc)}</summary>${toc}</details>` : ''}
          <details name="article-tools"><summary>${esc(t.ctaTitle)}</summary>${cta}</details>
        </div>`;
  const tools = lay.hero === 'left'
    ? `<aside class="article-side">${heroHtml(m, it, lang, up)}${toc}${cta}</aside>`
    : `${toc}${cta}`;
  const content = `<div class="article-grid">
          ${mobile}
          ${tools}
          ${bodyHtml}
        </div>`;
  const main = `    <article class="${classes}">
      <div class="container">
        <p class="back"><a href="../news.html">← ${t.back}</a></p>
        <header class="article-head">
          ${metaLine}
          <h1>${esc(c.title)}</h1>
          <p class="lead">${esc(c.summary)}</p>
        </header>${heroTop}
        ${content}${renderArticleNav(m, lang, i)}
      </div>
    </article>
`;
  const self = urlFor(m, lang, 'article', it.slug);
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.summary, datePublished: it.date,
    inLanguage: lang, mainEntityOfPage: self, image: `${m.ui.site}/${m.assets[it.image].src}`, author: { '@type': 'Organization', name: 'AI-KIDO' }, publisher: { '@type': 'Organization', name: 'AI-KIDO' } };
  return page(m, {
    lang, depthPrefix: '../', here: `${it.slug}.html`, other: lang === 'fr' ? `../../news/${it.slug}.html` : `../fr/news/${it.slug}.html`,
    title: `${c.title} – AI-KIDO`, description: c.summary, ogType: 'article', alt: m.assets[it.image].alt[lang],
    canonical: { self, en: urlFor(m, 'en', 'article', it.slug), fr: urlFor(m, 'fr', 'article', it.slug) },
    extraHead: `  <script type="application/ld+json">${jsonLd(ld)}</script>\n  <script src="${up}assets/js/news-navigation.js?v=1" defer></script>\n`, main,
  });
}

export function renderStrip(m, lang) {
  const t = m.ui.labels[lang]; const up = lang === 'fr' ? '../' : '';
  const n = m.bundle.stripCount || 3;
  const li = m.items.slice(0, n).map((it) => `<li><a href="news/${it.slug}.html"><img src="${up}${it.thumb || m.assets[it.image].src}" alt="" width="72" height="54" loading="lazy" decoding="async"><span class="nb-txt"><time datetime="${it.date}">${formatDate(it.date, lang, m.root)}</time><strong>${esc(it[lang].title)}</strong></span></a></li>`).join('\n            ');
  return `<!-- news:begin -->
    <div class="news-band" role="region" aria-label="${t.news}">
      <div class="container nb-in">
        <a class="nb-label" href="news.html">${t.news}</a>
        <ul class="nb-list">
            ${li}
        </ul>
        <a class="news-all" href="news.html">${t.allNews}</a>
      </div>
    </div>
    <!-- news:end -->`;
}

export function renderSitemap(m) {
  const alt = (kind, slug) => `    <xhtml:link rel="alternate" hreflang="en" href="${urlFor(m, 'en', kind, slug)}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${urlFor(m, 'fr', kind, slug)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(m, 'en', kind, slug)}"/>`;
  const entry = (lang, kind, slug, date) => `  <url>
    <loc>${urlFor(m, lang, kind, slug)}</loc>
    <lastmod>${date}</lastmod>
${alt(kind, slug)}
  </url>`;
  const out = [];
  for (const lang of LANGS) out.push(entry(lang, 'list', null, m.items[0].date));
  for (const it of m.items) for (const lang of LANGS) out.push(entry(lang, 'article', it.slug, it.date));
  return `<!-- news:begin -->\n${out.join('\n')}\n  <!-- news:end -->`;
}
