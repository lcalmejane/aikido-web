// Assemble tous les fichiers générés : Map chemin relatif → contenu.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS } from './util.mjs';
import { loadModel } from './load.mjs';
import { validate } from './validate.mjs';
import { renderList, renderArticle, renderArticleNav, renderStrip, renderSitemap } from './pages.mjs';

const BLOCK = /<!-- news:begin -->[\s\S]*?<!-- news:end -->/;

export function buildAll(root, selection = {}) {
  const m = loadModel(root);
  const errors = validate(m);
  if (errors.length) return { errors };
  const selectors = [
    ['articles', new Set(m.items.map((it) => it.slug))],
    ['layouts', new Set(Object.keys(m.layouts))],
    ['diagrams', new Set(Object.keys(m.diagrams))],
    ['assets', new Set(Object.keys(m.assets))],
  ];
  for (const [key, known] of selectors) {
    if (selection[key] !== undefined && (!Array.isArray(selection[key]) || !selection[key].length)) errors.push(`${key}: sélection non vide attendue`);
    else for (const id of selection[key] || []) if (!known.has(id)) errors.push(`${key}: identifiant inconnu (${id})`);
  }
  if (errors.length) return { errors };
  const targeted = selection.lists === true || selectors.some(([key]) => selection[key] !== undefined);
  const requested = new Set(m.items.filter((it) => !targeted
    || selection.articles?.includes(it.slug)
    || selection.layouts?.includes(it.layout)
    || (selection.assets || []).includes(it.image)
    || ['en', 'fr'].some((lang) => it[lang].body.some((b) => b && typeof b === 'object'
      && (selection.diagrams?.includes(b.diagram) || selection.assets?.includes(b.figure)))))
    .map((it) => it.slug));
  const rendered = new Set();
  const files = new Map();
  for (const lang of LANGS) {
    const dir = lang === 'fr' ? 'fr/' : '';
    files.set(`${dir}news.html`, renderList(m, lang));
    m.items.forEach((it, i) => {
      if (selection.lists === true && !selectors.some(([key]) => selection[key] !== undefined)) return;
      const rel = `${dir}news/${it.slug}.html`;
      const abs = path.join(root, rel);
      let dependent = false;
      if (targeted && !requested.has(it.slug)) {
        if (!fs.existsSync(abs)) dependent = true;
        else {
          const previous = fs.readFileSync(abs, 'utf8').match(/\n        <nav class="article-nav"[\s\S]*?<\/nav>/)?.[0] || '';
          dependent = previous !== renderArticleNav(m, lang, i);
        }
      }
      if (requested.has(it.slug) || dependent) {
        files.set(rel, renderArticle(m, lang, i));
        rendered.add(it.slug);
      }
    });
    const home = `${dir}index.html`;
    const src = fs.readFileSync(path.join(root, home), 'utf8');
    if (!BLOCK.test(src)) return { errors: [`${home}: marqueurs <!-- news:begin --> / <!-- news:end --> introuvables`] };
    files.set(home, src.replace(BLOCK, () => renderStrip(m, lang)));
  }
  let sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  if (!BLOCK.test(sm)) sm = sm.replace('</urlset>', '  <!-- news:begin -->\n  <!-- news:end -->\n</urlset>');
  files.set('sitemap.xml', sm.replace(BLOCK, () => renderSitemap(m)));
  return { files, count: m.items.length, model: m, articles: [...rendered], targeted };
}

/** Liste (slug, date, layout, schémas) sans rien générer. */
export function listArticles(root) {
  const m = loadModel(root);
  return m.items.map((it) => ({ slug: it.slug, date: it.date, layout: it.layout, diagrams: (it.en?.body || []).filter((b) => b && b.diagram).map((b) => b.diagram) }));
}

export function validateOnly(root) {
  return validate(loadModel(root));
}
