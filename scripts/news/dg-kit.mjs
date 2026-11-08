// Briques communes des schémas SVG (largeur fixe 360, mise en page verticale : lisible à 390 px).
// Les couleurs et animations vivent dans assets/css/news-layouts.css (classes .dg-*).
import { esc, wrapText } from './util.mjs';

export const W = 360;
export const tx = (v, lang) => (v && typeof v === 'object' ? v[lang] : v) ?? '';

/** Texte centré dans une boîte (top, h) ; `lines` = tableau de chaînes. */
export function centerText(cx, top, h, lines, cls = 'dg-t', lh = 17) {
  const y0 = top + (h - (lines.length - 1) * lh) / 2 + 5;
  const spans = lines.map((l, i) => `<tspan x="${cx}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('');
  return `<text class="${cls}" x="${cx}" y="${y0.toFixed(1)}" text-anchor="middle">${spans}</text>`;
}

/** Boîte avec libellé (et note facultative) ; retourne { svg, h }. */
export function box({ x, y, w, label, note, cls = '', i = 0, chars }) {
  const max = chars || Math.max(8, Math.floor((w - 20) / 7.6));
  const l1 = wrapText(label, max);
  const l2 = note ? wrapText(note, Math.floor((w - 20) / 6.6)) : [];
  const h = 18 + l1.length * 17 + (l2.length ? l2.length * 15 + 4 : 0);
  let t;
  if (!l2.length) t = centerText(x + w / 2, y, h, l1);
  else {
    const a = centerText(x + w / 2, y, l1.length * 17 + 10, l1, 'dg-t dg-b');
    const b = centerText(x + w / 2, y + l1.length * 17 + 4, l2.length * 15 + 10, l2, 'dg-s', 15);
    t = a + b;
  }
  return { h, svg: `<g class="dg-node ${cls}" style="--i:${i}"><rect class="dg-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${t}</g>` };
}

/** Flèche verticale animée de (x, y1) vers (x, y2). */
export const arrowDown = (x, y1, y2) =>
  `<g class="dg-link"><line class="dg-flow" x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 5}"/><path class="dg-head" d="M${x - 5} ${y2 - 8} L${x} ${y2} L${x + 5} ${y2 - 8} Z"/></g>`;

export function wrap(h, title, desc, inner, type, animate = false) {
  // Le type porte un préfixe dédié : « dg-flow » est la classe des flèches animées et ne doit jamais se retrouver sur le <svg> (héritage du pointillé par les textes).
  // Un schéma est statique par défaut ; `dg-animated` n'active le défilement que sur les flèches (voir L-news-010).
  return `<svg class="dg-svg dg-type-${type}${animate ? ' dg-animated' : ''}" viewBox="0 0 ${W} ${Math.ceil(h)}" role="img" aria-label="${esc(desc)}" focusable="false"><title>${esc(title)}</title>${inner}</svg>`;
}
