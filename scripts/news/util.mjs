// Utilitaires communs du générateur de News. Aucun contenu éditorial ici : tout vient de content/news/*.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LANGS = ['en', 'fr'];
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const NEWS_DIR = 'content/news';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
export const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const prefixRel = (html, p) => html.replace(/\b(href|src)="(?!https?:|mailto:|#|\/|data:)([^"]*)"/g, (m, a, v) => `${a}="${p}${v}"`);
export const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

let uiCache = null;
/** Libellés et mois (content/news/ui.json). */
export function loadUi(root = ROOT) {
  if (!uiCache || uiCache.root !== root) uiCache = { root, ui: readJson(root, `${NEWS_DIR}/ui.json`) };
  return uiCache.ui;
}

export function formatDate(iso, lang, root = ROOT) {
  const months = loadUi(root).months;
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'fr' ? `${d === 1 ? '1er' : d} ${months.fr[m - 1]} ${y}` : `${d} ${months.en[m - 1]} ${y}`;
}

export const sortItems = (items) => [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1));

/** Chemin d'un asset pour une langue (src chaîne ou { en, fr }). */
export const assetSrc = (asset, lang) => (typeof asset.src === 'string' ? asset.src : asset.src[lang]);

/** Découpe un texte en lignes de `max` caractères au plus (pour les étiquettes SVG). */
export function wrapText(text, max) {
  const lines = [];
  let cur = '';
  for (const w of String(text).split(/\s+/)) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}
