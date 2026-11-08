#!/usr/bin/env node
// AI-KIDO website — génération déterministe des actualités à partir de data/news.json.
// Usage : node scripts/build-news.mjs [--check]
//   (sans option) écrit news.html, fr/news.html, news/*.html, fr/news/*.html, le bandeau des accueils et le sitemap
//   --check       n'écrit rien ; sort en erreur si un fichier généré n'est pas à jour
// Sortie : un seul objet JSON. Aucune dépendance (Node.js 20+).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.ai-kido.fr';
const LANGS = ['en', 'fr'];
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
};
const T = {
  en: {
    news: 'News', allNews: 'All news', readMore: 'Read more', back: 'All news', newer: 'Newer', older: 'Older',
    listTitle: 'News – AI-KIDO',
    listDescription: 'The latest from AI-KIDO: releases, Kimono, the method and the toolbox.',
    listH1: 'News', listLead: 'Releases, tools and changes to the method, newest first.',
    langLabel: 'Language', ogLocale: 'en_US', ogAlt: 'fr_FR', flag: 'English',
  },
  fr: {
    news: 'Actualités', allNews: 'Toutes les actualités', readMore: 'Lire la suite', back: 'Toutes les actualités', newer: 'Plus récent', older: 'Plus ancien',
    listTitle: 'Actualités – AI-KIDO',
    listDescription: 'Les nouveautés d’AI-KIDO : versions, Kimono, la méthode et la boîte à outils.',
    listH1: 'Actualités', listLead: 'Versions, outils et évolutions de la méthode, des plus récentes aux plus anciennes.',
    langLabel: 'Langue', ogLocale: 'fr_FR', ogAlt: 'en_US', flag: 'Français',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

export function formatDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'fr' ? `${d === 1 ? '1er' : d} ${MONTHS.fr[m - 1]} ${y}` : `${d} ${MONTHS.en[m - 1]} ${y}`;
}

/** Contrôles du fichier source. Retourne la liste des erreurs (vide si tout est valide). */
export function validate(data, root) {
  const errors = [];
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return ['items: tableau non vide attendu'];
  const seen = new Set();
  data.items.forEach((it, i) => {
    const at = `items[${i}]${it && it.slug ? ` (${it.slug})` : ''}`;
    if (!it || typeof it !== 'object') { errors.push(`${at}: objet attendu`); return; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it.slug || '')) errors.push(`${at}: slug invalide (minuscules, chiffres, tirets)`);
    if (seen.has(it.slug)) errors.push(`${at}: slug en double`);
    seen.add(it.slug);
    const d = /^\d{4}-\d{2}-\d{2}$/.test(it.date || '') ? new Date(`${it.date}T00:00:00Z`) : null;
    if (!d || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== it.date) errors.push(`${at}: date AAAA-MM-JJ invalide`);
    if (!it.image || !it.image.src || !it.image.width || !it.image.height) errors.push(`${at}: image.src, width et height requis`);
    else if (!fs.existsSync(path.join(root, it.image.src))) errors.push(`${at}: image introuvable (${it.image.src})`);
    for (const lang of LANGS) {
      const c = it[lang];
      if (!c) { errors.push(`${at}: bloc "${lang}" manquant`); continue; }
      for (const k of ['title', 'summary', 'alt']) if (!c[k] || !String(c[k]).trim()) errors.push(`${at}.${lang}: "${k}" vide`);
      if (c.summary && c.summary.length > 220) errors.push(`${at}.${lang}: summary trop long (${c.summary.length} > 220)`);
      if (!Array.isArray(c.body) || c.body.length === 0) errors.push(`${at}.${lang}: body (tableau de blocs) requis`);
      else {
        errors.push(...blockErrors(c.body, `${at}.${lang}`, root));
        const html = inlineHtml(c.body);
        const opens = (html.match(/<(p|ul|ol|li|a|code|strong|em)(\s|>)/g) || []).length;
        const closes = (html.match(/<\/(p|ul|ol|li|a|code|strong|em)>/g) || []).length;
        if (opens !== closes) errors.push(`${at}.${lang}: balises du corps non équilibrées`);
        for (const m of html.matchAll(/href="([^"]+)"/g)) {
          const href = m[1];
          if (/^(https?:|mailto:|#)/.test(href)) continue;
          const file = href.split('#')[0];
          const base = lang === 'fr' ? path.join(root, 'fr') : root;
          if (!fs.existsSync(path.join(base, file))) errors.push(`${at}.${lang}: lien local introuvable (${href})`);
        }
      }
      if (!it.tag || !it.tag[lang]) errors.push(`${at}: tag.${lang} requis`);
    }
  });
  return errors;
}

/** Types de blocs du corps d'un article (voir prompts/gen/concepts/qa-docs-ux/consignes-articles-news.md). */
const BLOCKS = ['h2', 'code', 'figure', 'callout', 'stats', 'steps'];
const isHtmlString = (b) => typeof b === 'string';

/** Texte HTML en ligne de tous les blocs (paragraphes, encadrés, légendes, étapes) : sert aux contrôles de balises et de liens. */
function inlineHtml(body) {
  const out = [];
  for (const b of body) {
    if (isHtmlString(b)) out.push(b);
    else if (b && typeof b === 'object') {
      if (b.callout) out.push(`<p>${b.callout}</p>`);
      if (b.caption) out.push(`<p>${b.caption}</p>`);
      if (Array.isArray(b.steps)) for (const s of b.steps) out.push(`<p>${s}</p>`);
    }
  }
  return out.join('\n');
}

/** Contrôles des blocs typés. */
function blockErrors(body, at, root) {
  const errors = [];
  body.forEach((b, i) => {
    const here = `${at}.body[${i}]`;
    if (isHtmlString(b)) return;
    if (!b || typeof b !== 'object' || Array.isArray(b)) { errors.push(`${here}: chaîne HTML ou objet de bloc attendu`); return; }
    const kinds = BLOCKS.filter((k) => k in b);
    if (kinds.length !== 1) { errors.push(`${here}: un seul type de bloc attendu parmi ${BLOCKS.join(', ')}`); return; }
    const k = kinds[0];
    if (k === 'h2' && !String(b.h2).trim()) errors.push(`${here}: h2 vide`);
    // Règle éditoriale (2026-11-07) : aucune rubrique « Limites » dans un article.
    const LIMITS = /^\s*(limits?|limites?|limitations?|caveats?|avertissements?)\s*[.:]?\s*$/i;
    if (k === 'h2' && LIMITS.test(String(b.h2))) errors.push(`${here}: intertitre « Limites » interdit (voir consignes-articles-news.md)`);
    if (k === 'callout' && LIMITS.test(String(b.title || ''))) errors.push(`${here}: encadré « Limites » interdit (voir consignes-articles-news.md)`);
    if (k === 'code') {
      if (typeof b.code !== 'string' || !b.code.trim()) errors.push(`${here}: code vide`);
      if (!/^[a-z0-9+-]+$/.test(b.lang || '')) errors.push(`${here}: lang requis (ex. bash, json, js)`);
      if (/(ghp_|github_pat_|sk-[A-Za-z0-9]{16,}|BEGIN [A-Z ]*PRIVATE KEY|\/Users\/[a-z]|\/home\/[a-z])/.test(b.code || '')) errors.push(`${here}: le code semble contenir un secret ou un chemin personnel`);
    }
    if (k === 'figure') {
      if (!b.alt || !String(b.alt).trim()) errors.push(`${here}: alt requis`);
      if (!b.width || !b.height) errors.push(`${here}: width et height requis`);
      if (!fs.existsSync(path.join(root, String(b.figure)))) errors.push(`${here}: image introuvable (${b.figure})`);
    }
    if (k === 'callout' && !String(b.callout).trim()) errors.push(`${here}: callout vide`);
    if (k === 'stats') {
      if (!Array.isArray(b.stats) || b.stats.length < 2 || b.stats.length > 4) errors.push(`${here}: stats attend 2 à 4 chiffres`);
      else for (const s of b.stats) if (!s.value || !s.label) errors.push(`${here}: chaque chiffre porte value et label`);
    }
    if (k === 'steps' && (!Array.isArray(b.steps) || b.steps.length === 0)) errors.push(`${here}: steps vide`);
  });
  return errors;
}

const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Rendu des blocs. `up` = préfixe vers la racine du site pour les images ; `rel` = préfixe des liens locaux. */
function renderBlocks(body, up, rel) {
  return body.map((b) => {
    if (isHtmlString(b)) return prefixRel(b, rel);
    if ('h2' in b) return `<h2 id="${slugify(b.h2)}">${esc(b.h2)}</h2>`;
    if ('code' in b) {
      const cap = b.caption ? `\n          <figcaption>${prefixRel(b.caption, rel)}</figcaption>` : '';
      return `<figure class="code-block">\n          <div class="code-lang">${esc(b.lang)}</div>\n          <pre tabindex="0"><code class="language-${esc(b.lang)}">${esc(b.code.replace(/\n+$/, ''))}</code></pre>${cap}\n        </figure>`;
    }
    if ('figure' in b) {
      const cap = b.caption ? `\n          <figcaption>${prefixRel(b.caption, rel)}</figcaption>` : '';
      return `<figure class="article-figure">\n          <img src="${up}${esc(b.figure)}" alt="${esc(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy" decoding="async">${cap}\n        </figure>`;
    }
    if ('callout' in b) {
      const title = b.title ? `<strong class="callout-title">${esc(b.title)}</strong>` : '';
      return `<aside class="callout">${title}<p>${prefixRel(b.callout, rel)}</p></aside>`;
    }
    if ('stats' in b) {
      return `<ul class="stats">\n          ${b.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('\n          ')}\n        </ul>`;
    }
    return `<ol class="steps">\n          ${b.steps.map((s) => `<li>${prefixRel(s, rel)}</li>`).join('\n          ')}\n        </ol>`;
  }).join('\n        ');
}

const sortItems = (items) => [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));
const prefixRel = (html, p) => html.replace(/\b(href|src)="(?!https?:|mailto:|#|\/|data:)([^"]*)"/g, (m, a, v) => `${a}="${p}${v}"`);

function urlFor(lang, kind, slug) {
  const base = lang === 'fr' ? `${SITE}/fr` : SITE;
  return kind === 'list' ? `${base}/news.html` : `${base}/news/${slug}.html`;
}

/** Morceaux communs repris de l'historique, pour que le menu et le pied de page restent définis à un seul endroit. */
function shell(root, lang) {
  const file = path.join(root, lang === 'fr' ? 'fr/history.html' : 'history.html');
  const s = fs.readFileSync(file, 'utf8');
  const t = T[lang];
  const sym = s.slice(s.indexOf('<svg xmlns'), s.indexOf('</svg>') + 6);
  const hs = s.indexOf('<header class="site-header">');
  let header = s.slice(hs, s.indexOf('<div class="subnav">', hs)) + '</header>';
  header = header.replace(/\s+aria-current="page"/g, '');
  const newsLink = new RegExp(`<a href="news\\.html">${t.news}</a>`);
  header = header.replace(newsLink, `<a href="news.html" aria-current="page">${t.news}</a>`);
  const fs0 = s.indexOf('<footer class="site-footer">');
  const footer = s.slice(fs0, s.indexOf('</footer>') + 9);
  const hd = s.indexOf('<link rel="icon" href=');
  const headLinks = s.slice(hd, s.indexOf('<link rel="preload"')).replace(/\s+$/, '');
  // headLinks inclut déjà <script src="…theme.js">, qui ne doit apparaître qu'une fois par page.
  return { sym, header, footer, headLinks };
}

function langBlocks(lang, here, other) {
  const t = T[lang];
  const en = lang === 'en' ? here : other;
  const fr = lang === 'fr' ? here : other;
  const lang_ = lang === 'en'
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
  return { lang_, foot };
}

function page({ root, lang, depthPrefix, here, other, title, description, canonical, alt, ogType, extraHead, main }) {
  const sh = shell(root, lang);
  const t = T[lang];
  const { lang_, foot } = langBlocks(lang, here, other);
  const fix = (h) => prefixRel(h, depthPrefix);
  const header = fix(sh.header).replace(/<span class="lang"[\s\S]*?<\/span>/, lang_);
  const footer = fix(sh.footer).replace(/<nav class="footer-languages"[\s\S]*?<\/nav>/, foot);
  const links = fix(sh.headLinks);
  const img = `${SITE}/assets/images/og.jpg`;
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
${extraHead || ''}</head>
<body class="inner">
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

function renderList(root, lang, items) {
  const t = T[lang];
  const cards = items.map((it) => {
    const c = it[lang];
    const focus = it.image.focus ? ` style="object-position: ${esc(it.image.focus)}"` : '';
    return `          <article class="card news-card">
            <img class="card-img" src="${it.image.src.startsWith('http') ? '' : (lang === 'fr' ? '../' : '')}${it.image.src}" alt="${esc(c.alt)}" width="${it.image.width}" height="${it.image.height}" loading="lazy" decoding="async"${focus}>
            <p class="news-meta"><span class="tag">${esc(it.tag[lang])}</span><time datetime="${it.date}">${formatDate(it.date, lang)}</time></p>
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

    <section class="news-list">
      <div class="container">
        <div class="grid cols-3">
${cards}
        </div>
      </div>
    </section>
`;
  const self = urlFor(lang, 'list');
  const itemList = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.listH1, url: self, inLanguage: lang,
    hasPart: items.map((it) => ({ '@type': 'Article', headline: it[lang].title, datePublished: it.date, url: urlFor(lang, 'article', it.slug) })) };
  return page({
    root, lang, depthPrefix: '', here: lang === 'fr' ? 'news.html' : 'news.html', other: lang === 'fr' ? '../news.html' : 'fr/news.html',
    title: t.listTitle, description: t.listDescription, ogType: 'website', alt: t.listH1,
    canonical: { self, en: urlFor('en', 'list'), fr: urlFor('fr', 'list') },
    extraHead: `  <script type="application/ld+json">${jsonLd(itemList)}</script>\n`, main,
  });
}

function renderArticle(root, lang, items, i) {
  const it = items[i];
  const c = it[lang];
  const t = T[lang];
  const body = renderBlocks(c.body, lang === 'fr' ? '../../' : '../', '../');
  const newer = items[i - 1];
  const older = items[i + 1];
  const pn = [];
  if (newer) pn.push(`<a class="newer" href="${newer.slug}.html" rel="next">← ${t.newer} : ${esc(newer[lang].title)}</a>`);
  if (older) pn.push(`<a class="older" href="${older.slug}.html" rel="prev">${t.older} : ${esc(older[lang].title)} →</a>`);
  const focus = it.image.focus ? ` style="object-position: ${esc(it.image.focus)}"` : '';
  const main = `    <article class="news-article">
      <div class="container">
        <p class="back"><a href="../news.html">← ${t.back}</a></p>
        <p class="news-meta"><span class="tag">${esc(it.tag[lang])}</span><time datetime="${it.date}">${formatDate(it.date, lang)}</time></p>
        <h1>${esc(c.title)}</h1>
        <p class="lead">${esc(c.summary)}</p>
        <img class="article-hero" src="${lang === 'fr' ? '../../' : '../'}${it.image.src}" alt="${esc(c.alt)}" width="${it.image.width}" height="${it.image.height}" decoding="async"${focus}>
        <div class="article-body">
          ${body}
        </div>${pn.length ? `\n        <nav class="article-nav" aria-label="${t.news}">\n          ${pn.join('\n          ')}\n        </nav>` : ''}
      </div>
    </article>
`;
  const self = urlFor(lang, 'article', it.slug);
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.summary, datePublished: it.date,
    inLanguage: lang, mainEntityOfPage: self, image: `${SITE}/${it.image.src}`, author: { '@type': 'Organization', name: 'AI-KIDO' }, publisher: { '@type': 'Organization', name: 'AI-KIDO' } };
  return page({
    root, lang, depthPrefix: '../', here: `${it.slug}.html`, other: lang === 'fr' ? `../../news/${it.slug}.html` : `../fr/news/${it.slug}.html`,
    title: `${c.title} – AI-KIDO`, description: c.summary, ogType: 'article', alt: c.alt,
    canonical: { self, en: urlFor('en', 'article', it.slug), fr: urlFor('fr', 'article', it.slug) },
    extraHead: `  <script type="application/ld+json">${jsonLd(ld)}</script>\n`, main,
  });
}

function renderStrip(lang, items) {
  const t = T[lang];
  const up = lang === "fr" ? "../" : "";
  const li = items.slice(0, 3).map((it) => `<li><a href="news/${it.slug}.html"><img src="${up}${it.thumb ? it.thumb.src : it.image.src}" alt="" width="72" height="54" loading="lazy" decoding="async"><span class="nb-txt"><time datetime="${it.date}">${formatDate(it.date, lang)}</time><strong>${esc(it[lang].title)}</strong></span></a></li>`).join("\n            ");
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

function renderSitemap(items) {
  const alt = (kind, slug) => `    <xhtml:link rel="alternate" hreflang="en" href="${urlFor('en', kind, slug)}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${urlFor('fr', kind, slug)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en', kind, slug)}"/>`;
  const entry = (lang, kind, slug, date) => `  <url>
    <loc>${urlFor(lang, kind, slug)}</loc>
    <lastmod>${date}</lastmod>
${alt(kind, slug)}
  </url>`;
  const out = [];
  for (const lang of LANGS) out.push(entry(lang, 'list', null, items[0].date));
  for (const it of items) for (const lang of LANGS) out.push(entry(lang, 'article', it.slug, it.date));
  return `<!-- news:begin -->\n${out.join('\n')}\n  <!-- news:end -->`;
}

const BLOCK = /<!-- news:begin -->[\s\S]*?<!-- news:end -->/;

/** Calcule tous les fichiers générés : Map chemin relatif → contenu. */
export function buildAll(root) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'));
  const errors = validate(data, root);
  if (errors.length) return { errors };
  const items = sortItems(data.items);
  const files = new Map();
  for (const lang of LANGS) {
    const dir = lang === 'fr' ? 'fr/' : '';
    files.set(`${dir}news.html`, renderList(root, lang, items));
    items.forEach((it, i) => files.set(`${dir}news/${it.slug}.html`, renderArticle(root, lang, items, i)));
    const home = `${dir}index.html`;
    const src = fs.readFileSync(path.join(root, home), 'utf8');
    if (!BLOCK.test(src)) return { errors: [`${home}: marqueurs <!-- news:begin --> / <!-- news:end --> introuvables`] };
    files.set(home, src.replace(BLOCK, () => renderStrip(lang, items)));
  }
  let sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  if (!BLOCK.test(sm)) sm = sm.replace('</urlset>', '  <!-- news:begin -->\n  <!-- news:end -->\n</urlset>');
  files.set('sitemap.xml', sm.replace(BLOCK, () => renderSitemap(items)));
  return { files, count: items.length };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const check = process.argv.includes('--check');
  const res = buildAll(root);
  if (res.errors) { console.log(JSON.stringify({ ok: false, errors: res.errors })); process.exit(1); }
  const stale = []; const written = [];
  for (const [rel, content] of res.files) {
    const abs = path.join(root, rel);
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if (cur === content) continue;
    if (check) { stale.push(rel); continue; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    written.push(rel);
  }
  if (check && stale.length) { console.log(JSON.stringify({ ok: false, stale })); process.exit(1); }
  console.log(JSON.stringify({ ok: true, items: res.count, files: res.files.size, written }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
