// Schémas SVG générés à partir de content/news/diagrams/<id>.json (textes EN/FR dans le JSON).
// Types : flow, cycle, layers, hub, funnel, versus, tree, timeline, bars (statistique), pyramid (hiérarchique), quadrant (deux axes).
// Statiques par défaut ; `"animate": true` fait circuler les flèches des types de flux (FLOW_TYPES) uniquement.
import { esc, wrapText } from './util.mjs';
import { W, tx, box, arrowDown, wrap, centerText } from './dg-kit.mjs';

const GAP = 24;

function flow(d, lang) {
  let y = 12; const out = [];
  d.nodes.forEach((n, i) => {
    const b = box({ x: 20, y, w: 320, label: tx(n.label, lang), note: tx(n.note, lang), cls: n.accent ? 'dg-accent' : '', i });
    out.push(b.svg); y += b.h;
    if (i < d.nodes.length - 1) { out.push(arrowDown(180, y, y + GAP)); y += GAP; }
  });
  return { h: y + 12, inner: out.join('') };
}

function cycle(d, lang) {
  let y = 12; const out = []; const mids = [];
  d.nodes.forEach((n, i) => {
    const b = box({ x: 16, y, w: 290, label: tx(n.label, lang), note: tx(n.note, lang), cls: n.accent ? 'dg-accent' : '', i });
    out.push(b.svg); mids.push(y + b.h / 2); y += b.h;
    if (i < d.nodes.length - 1) { out.push(arrowDown(161, y, y + GAP)); y += GAP; }
  });
  const a = mids[0]; const z = mids[mids.length - 1];
  out.push(`<g class="dg-link"><path class="dg-flow" d="M306 ${z} H340 V${a} H312" fill="none"/><path class="dg-head" d="M314 ${a - 5} L306 ${a} L314 ${a + 5} Z"/></g>`);
  return { h: y + 12, inner: out.join('') };
}

function layers(d, lang) {
  let y = 12; const out = [];
  d.nodes.forEach((n, i) => {
    const b = box({ x: 20, y, w: 320, label: tx(n.label, lang), note: tx(n.note, lang), cls: `dg-layer dg-l${Math.min(i, 4)}`, i });
    out.push(b.svg); y += b.h + 8;
  });
  return { h: y + 4, inner: out.join('') };
}

function hub(d, lang) {
  const c = box({ x: 90, y: 12, w: 180, label: tx(d.center.label, lang), note: tx(d.center.note, lang), cls: 'dg-accent dg-hub', i: 0 });
  const out = [c.svg]; let y = 12 + c.h + 16; const top = 12 + c.h;
  const rows = []; for (let k = 0; k < d.nodes.length; k += 2) rows.push(d.nodes.slice(k, k + 2));
  const body = [];
  rows.forEach((r, ri) => {
    const bs = r.map((n, j) => box({ x: j === 0 ? 12 : 200, y, w: 148, label: tx(n.label, lang), note: tx(n.note, lang), i: ri * 2 + j + 1, chars: 17 }));
    const h = Math.max(...bs.map((b) => b.h));
    bs.forEach((b, j) => {
      // Cases d'une même rangée : même hauteur.
      const x = j === 0 ? 12 : 200; const n = r[j];
      const bb = box({ x, y, w: 148, label: tx(n.label, lang), note: tx(n.note, lang), i: ri * 2 + j + 1, chars: 17 });
      body.push(bb.svg.replace(`height="${bb.h}"`, `height="${h}"`));
      const my = y + h / 2; const x1 = j === 0 ? 160 : 200; const x2 = j === 0 ? 162 : 198;
      body.push(`<line class="dg-flow" x1="${x1}" y1="${my}" x2="${x2}" y2="${my}"/>`);
    });
    y += h + 12;
  });
  out.push(`<line class="dg-flow" x1="180" y1="${top}" x2="180" y2="${y - 12 - (rows.length ? 0 : 0)}"/>`);
  return { h: y + 4, inner: out.join('') + body.join('') };
}

function funnel(d, lang) {
  const n = d.nodes.length; let y = 12; const out = [];
  d.nodes.forEach((nd, i) => {
    const w = Math.round(320 - (n > 1 ? (i * 160) / (n - 1) : 0));
    const b = box({ x: Math.round((W - w) / 2), y, w, label: tx(nd.label, lang), note: tx(nd.note, lang), cls: i === n - 1 ? 'dg-accent' : '', i });
    out.push(b.svg); y += b.h;
    if (i < n - 1) { out.push(arrowDown(180, y, y + 18)); y += 18; }
  });
  return { h: y + 12, inner: out.join('') };
}

function versus(d, lang) {
  const out = []; let y = 12;
  const sides = [d.left, d.right];
  const heads = sides.map((s, j) => box({ x: j === 0 ? 12 : 188, y, w: 160, label: tx(s.title, lang), cls: j === 0 ? 'dg-muted' : 'dg-accent', i: j }));
  const hh = Math.max(...heads.map((b) => b.h));
  heads.forEach((b) => out.push(b.svg.replace(`height="${b.h}"`, `height="${hh}"`)));
  out.push(`<g class="dg-node" style="--i:1"><circle class="dg-vs" cx="180" cy="${12 + hh / 2}" r="14"/><text class="dg-t dg-b" x="180" y="${12 + hh / 2 + 4}" text-anchor="middle">VS</text></g>`);
  y += hh + 12;
  const rows = Math.max(d.left.items.length, d.right.items.length);
  for (let r = 0; r < rows; r++) {
    const bs = sides.map((s, j) => (s.items[r] ? box({ x: j === 0 ? 12 : 188, y, w: 160, label: tx(s.items[r], lang), cls: j === 0 ? 'dg-muted' : '', i: r + 2, chars: 20 }) : null));
    const h = Math.max(...bs.filter(Boolean).map((b) => b.h));
    bs.forEach((b) => { if (b) out.push(b.svg.replace(`height="${b.h}"`, `height="${h}"`)); });
    y += h + 8;
  }
  return { h: y + 4, inner: out.join('') };
}

function tree(d, lang) {
  let y = 12; const out = []; const parents = [];
  d.nodes.forEach((n, i) => {
    const dep = n.depth || 0; const x = 16 + dep * 26; const w = 344 - x;
    const b = box({ x, y, w, label: tx(n.label, lang), note: tx(n.note, lang), cls: dep === 0 ? 'dg-accent' : '', i });
    if (dep > 0 && parents[dep - 1]) {
      const p = parents[dep - 1]; const px = p.x + 12; const my = y + b.h / 2;
      out.push(`<path class="dg-flow" d="M${px} ${p.bottom} V${my} H${x}" fill="none"/>`);
    }
    out.push(b.svg); parents[dep] = { x, bottom: y + b.h }; parents.length = dep + 1;
    y += b.h + 12;
  });
  return { h: y, inner: out.join('') };
}

function timeline(d, lang) {
  let y = 14; const out = []; const dots = [];
  d.nodes.forEach((n, i) => {
    const lines = wrapText(tx(n.label, lang), 38);
    const when = tx(n.when, lang);
    const h = (when ? 18 : 0) + lines.length * 17 + 12;
    dots.push(`<g class="dg-node" style="--i:${i}"><circle class="dg-dot" cx="30" cy="${y + 8}" r="7"/>`
      + (when ? `<text class="dg-s dg-b" x="52" y="${y + 12}">${esc(when)}</text>` : '')
      + `<text class="dg-t" x="52" y="${y + 12 + (when ? 18 : 0)}">${lines.map((l, k) => `<tspan x="52" dy="${k === 0 ? 0 : 17}">${esc(l)}</tspan>`).join('')}</text></g>`);
    y += h;
  });
  out.push(`<line class="dg-flow" x1="30" y1="22" x2="30" y2="${y - 14}"/>`);
  return { h: y + 4, inner: out.join('') + dots.join('') };
}

/** Infographie statistique : barres horizontales proportionnelles. nodes[].value (nombre), nodes[].unit (texte), label, note. */
function bars(d, lang) {
  const max = Math.max(...d.nodes.map((n) => Number(n.value) || 0), 1);
  const out = []; let y = 14;
  d.nodes.forEach((n, i) => {
    const lines = wrapText(tx(n.label, lang), 44);
    lines.forEach((l, k) => out.push(`<text class="dg-t" x="16" y="${y + 12 + k * 17}">${esc(l)}</text>`));
    y += lines.length * 17 + 4;
    const w = Math.max(6, Math.round((Number(n.value) / max) * 230));
    out.push(`<g class="dg-node${n.accent ? ' dg-accent' : ''}" style="--i:${i}"><rect class="dg-track" x="16" y="${y}" width="230" height="20" rx="10"/><rect class="dg-bar" x="16" y="${y}" width="${w}" height="20" rx="10"/><text class="dg-t dg-b" x="254" y="${y + 15}">${esc(tx(n.unit, lang) || String(n.value))}</text></g>`);
    y += 24;
    if (n.note) { const nl = wrapText(tx(n.note, lang), 52); nl.forEach((l, k) => out.push(`<text class="dg-s" x="16" y="${y + 11 + k * 15}">${esc(l)}</text>`)); y += nl.length * 15 + 2; }
    y += 10;
  });
  return { h: y + 2, inner: out.join('') };
}

/** Infographie hiérarchique : pyramide, du sommet (le plus important) à la base. */
function pyramid(d, lang) {
  const n = d.nodes.length; let y = 12; const out = [];
  d.nodes.forEach((nd, i) => {
    const w = Math.round(120 + (n > 1 ? (i * 220) / (n - 1) : 200));
    const b = box({ x: Math.round((W - w) / 2), y, w, label: tx(nd.label, lang), note: tx(nd.note, lang), cls: i === 0 ? 'dg-accent' : 'dg-layer dg-l1', i });
    out.push(b.svg); y += b.h + 6;
  });
  return { h: y + 6, inner: out.join('') };
}

/** Deux axes croisés : 4 cases (cell: tl, tr, bl, br) et, au besoin, une bande pleine largeur (cell: band). axes: { x: {left,right}, y: {top,bottom} } (textes EN/FR). */
function quadrant(d, lang) {
  const out = []; let y = 10;
  const cw = 164; const xs = { l: 14, r: 186 };
  const head = (txt, x, anchor) => out.push(`<text class="dg-s dg-b" x="${x}" y="${y + 11}" text-anchor="${anchor}">${esc(txt)}</text>`);
  head(tx(d.axes.x.left, lang), xs.l + cw / 2, 'middle'); head(tx(d.axes.x.right, lang), xs.r + cw / 2, 'middle');
  y += 22;
  let i = 0;
  for (const [row, key] of [['t', 'top'], ['b', 'bottom']]) {
    out.push(`<text class="dg-s" x="14" y="${y + 11}">${esc(tx(d.axes.y[key], lang))}</text>`); y += 20;
    const bs = ['l', 'r'].map((c) => { const n = d.nodes.find((q) => q.cell === row + c); return n ? { n, b: box({ x: xs[c], y, w: cw, label: tx(n.label, lang), note: tx(n.note, lang), cls: n.accent ? 'dg-accent' : n.muted ? 'dg-muted' : '', i: i++, chars: 20 }) } : null; });
    const h = Math.max(...bs.filter(Boolean).map((q) => q.b.h), 30);
    bs.forEach((q) => { if (q) out.push(q.b.svg.replace(`height="${q.b.h}"`, `height="${h}"`)); });
    y += h + 12;
  }
  for (const n of d.nodes.filter((q) => q.cell === 'band')) {
    const b = box({ x: 14, y, w: 332, label: tx(n.label, lang), note: tx(n.note, lang), cls: 'dg-accent', i: i++ });
    out.push(b.svg); y += b.h + 8;
  }
  return { h: y + 2, inner: out.join('') };
}

const TYPES = { flow, cycle, layers, hub, funnel, versus, tree, timeline, bars, pyramid, quadrant };
export const DIAGRAM_TYPES = Object.keys(TYPES);
/** Types qui montrent un flux : les seuls pour lesquels `animate: true` a un sens. */
export const FLOW_TYPES = ['flow', 'cycle', 'funnel', 'tree', 'timeline'];

/** Rend un schéma (clé = id) pour une langue. Statique sauf `animate: true`. */
export function renderDiagram(d, lang) {
  const r = TYPES[d.type](d, lang);
  return wrap(r.h, tx(d.title, lang), tx(d.desc, lang), r.inner, d.type, d.animate === true);
}
