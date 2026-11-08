// Chargement de content/news/** en un modèle unique. Un JSON par fichier, aucune donnée éditoriale dans le code.
import fs from 'node:fs';
import path from 'node:path';
import { NEWS_DIR, readJson, sortItems } from './util.mjs';

function listJson(root, sub) {
  const dir = path.join(root, NEWS_DIR, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
}

/** Charge bundle, ui, assets, layouts, diagrams et articles. Les erreurs de lecture sont retournées, pas levées. */
export function loadModel(root) {
  const errors = [];
  const safe = (rel) => {
    try { return readJson(root, rel); } catch (e) { errors.push(`${rel}: JSON illisible (${e.message.split('\n')[0]})`); return null; }
  };
  const bundle = safe(`${NEWS_DIR}/bundle.json`);
  const ui = safe(`${NEWS_DIR}/ui.json`);
  const taxonomy = safe(`${NEWS_DIR}/taxonomy.json`);
  const assetsFile = safe(`${NEWS_DIR}/assets.json`);
  const layouts = {}; const diagrams = {}; const articles = [];
  for (const f of listJson(root, 'layouts')) { const j = safe(`${NEWS_DIR}/layouts/${f}`); if (j) { j.__file = f; layouts[j.id || f.replace(/\.json$/, '')] = j; } }
  for (const f of listJson(root, 'diagrams')) { const j = safe(`${NEWS_DIR}/diagrams/${f}`); if (j) { j.__file = f; diagrams[j.id || f.replace(/\.json$/, '')] = j; } }
  for (const f of listJson(root, 'articles')) { const j = safe(`${NEWS_DIR}/articles/${f}`); if (j) { j.__file = f; articles.push(j); } }
  const assets = (assetsFile && assetsFile.assets) || {};
  const fileExists = (rel) => fs.existsSync(path.join(root, rel));
  return { root, errors, bundle, ui, taxonomy, assets, layouts, diagrams, items: sortItems(articles), fileExists };
}
