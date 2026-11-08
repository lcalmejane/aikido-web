// Validation de content/news/** : retourne la liste des erreurs (vide si tout est valide).
import path from 'node:path';
import { LANGS, assetSrc } from './util.mjs';
import { blockErrors, inlineHtml } from './blocks.mjs';
import { DIAGRAM_TYPES, FLOW_TYPES } from './diagrams.mjs';

export const LAYOUT_OPTIONS = {
  hero: ['wide', 'left', 'band', 'square', 'none'],
  width: ['narrow', 'wide'],
  accent: ['terra', 'navy', 'gold', 'forest'],
  lead: ['serif', 'plain', 'large'],
  h2: ['plain', 'numbered', 'ruled', 'tag'],
  toc: [true, false],
  dropcap: [true, false],
};
/** Options facultatives (absentes = valeur par défaut), inspirées d'articles éditoriaux de référence. */
export const LAYOUT_EXTRAS = {
  title: ['normal', 'caps', 'huge'],       // titre : normal, capitales, très grand en capitales
  meta: ['inline', 'mono', 'byline'],      // ligne de méta : ligne simple, police mono, signature (date + étiquette en bloc)
  rail: ['none', 'toc', 'toc-cta'],        // colonne latérale collante : aucune, sommaire, sommaire + carte d'appel à l'action
  body: ['prose', 'spaced'],               // corps : prose normale ou paragraphes aérés
};

const bi = (v) => v && typeof v === 'object' && LANGS.every((l) => typeof v[l] === 'string' && v[l].trim());
const hasText = (v) => typeof v === 'string' ? v.trim().length > 0 : bi(v);

function layoutErrors(layouts) {
  const errors = [];
  for (const [id, l] of Object.entries(layouts)) {
    const at = `layouts/${l.__file}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) errors.push(`${at}: id invalide`);
    if (l.__file !== `${id}.json`) errors.push(`${at}: le nom du fichier doit être ${id}.json`);
    if (!bi(l.name)) errors.push(`${at}: name EN/FR requis`);
    if (!bi(l.description)) errors.push(`${at}: description EN/FR requise`);
    for (const [k, allowed] of Object.entries(LAYOUT_OPTIONS)) if (!allowed.includes(l[k])) errors.push(`${at}: ${k} doit valoir ${allowed.join(' | ')}`);
    for (const [k, allowed] of Object.entries(LAYOUT_EXTRAS)) if (l[k] !== undefined && !allowed.includes(l[k])) errors.push(`${at}: ${k} doit valoir ${allowed.join(' | ')}`);
  }
  return errors;
}

function nodesOf(d) {
  if (d.type === 'hub') return [d.center, ...(d.nodes || [])];
  if (d.type === 'versus') return [d.left && { label: d.left.title }, d.right && { label: d.right.title }, ...((d.left?.items || []).map((label) => ({ label }))), ...((d.right?.items || []).map((label) => ({ label })))];
  return d.nodes || [];
}

function diagramErrors(diagrams) {
  const errors = [];
  for (const [id, d] of Object.entries(diagrams)) {
    const at = `diagrams/${d.__file}`;
    if (d.__file !== `${id}.json`) errors.push(`${at}: le nom du fichier doit être ${id}.json`);
    if (!DIAGRAM_TYPES.includes(d.type)) { errors.push(`${at}: type ${d.type} inconnu (${DIAGRAM_TYPES.join(', ')})`); continue; }
    if (!bi(d.title)) errors.push(`${at}: title EN/FR requis`);
    if (!bi(d.desc)) errors.push(`${at}: desc EN/FR requis (texte alternatif)`);
    if (d.animate !== undefined && typeof d.animate !== 'boolean') errors.push(`${at}: animate doit être un booléen`);
    if (d.animate === true && !FLOW_TYPES.includes(d.type)) errors.push(`${at}: animate n'a de sens que pour un flux (${FLOW_TYPES.join(', ')}), pas pour ${d.type}`);
    if (d.type === 'bars') (d.nodes || []).forEach((n, i) => { if (!(Number(n?.value) > 0)) errors.push(`${at}: barre ${i} sans value numérique positive`); });
    if (d.type === 'hub' && !d.center) errors.push(`${at}: center requis`);
    if (d.type === 'versus' && !(d.left?.items?.length && d.right?.items?.length)) errors.push(`${at}: left.items et right.items requis`);
    if (d.type === 'quadrant') {
      for (const [ax, ks] of [['x', ['left', 'right']], ['y', ['top', 'bottom']]]) for (const k of ks) if (!bi(d.axes?.[ax]?.[k])) errors.push(`${at}: axes.${ax}.${k} EN/FR requis`);
      (d.nodes || []).forEach((n, i) => { if (!['tl', 'tr', 'bl', 'br', 'band'].includes(n?.cell)) errors.push(`${at}: nœud ${i} cell doit valoir tl | tr | bl | br | band`); });
    }
    const nodes = nodesOf(d);
    if (d.type !== 'versus' && d.type !== 'hub' && nodes.length < 2) errors.push(`${at}: au moins 2 nœuds`);
    nodes.forEach((n, i) => {
      if (!n || !bi(n.label)) errors.push(`${at}: nœud ${i} sans label EN/FR`);
      if (n && n.note !== undefined && !bi(n.note)) errors.push(`${at}: nœud ${i} note EN/FR incomplète`);
      if (d.type === 'timeline' && n && n.when !== undefined && !bi(n.when)) errors.push(`${at}: nœud ${i} when EN/FR incomplet`);
    });
  }
  return errors;
}

function articleErrors(m) {
  const errors = [];
  const seen = new Set();
  const ctx = { assets: m.assets, diagrams: m.diagrams, fileExists: m.fileExists };
  m.items.forEach((it, i) => {
    const at = `articles/${it.__file || i}`;
    if (!Object.hasOwn(m.taxonomy?.natures || {}, it.nature || '')) errors.push(`${at}: nature inconnue ou manquante`);
    if (!Array.isArray(it.domains) || !it.domains.length || new Set(it.domains).size !== it.domains.length
      || it.domains.some((id) => !Object.hasOwn(m.taxonomy?.domains || {}, id))) errors.push(`${at}: domains non vides, connus et uniques requis`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it.slug || '')) errors.push(`${at}: slug invalide (minuscules, chiffres, tirets)`);
    if (it.__file && it.__file !== `${it.slug}.json`) errors.push(`${at}: le nom du fichier doit être ${it.slug}.json`);
    if (seen.has(it.slug)) errors.push(`${at}: slug en double`);
    seen.add(it.slug);
    const d = /^\d{4}-\d{2}-\d{2}$/.test(it.date || '') ? new Date(`${it.date}T00:00:00Z`) : null;
    if (!d || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== it.date) errors.push(`${at}: date AAAA-MM-JJ invalide`);
    const img = m.assets[it.image];
    if (!img) errors.push(`${at}: image inconnue (${it.image})`);
    else {
      if (typeof img.src !== 'string') errors.push(`${at}: l'image d'en-tête doit avoir un src unique`);
      else if (!m.fileExists(img.src)) errors.push(`${at}: image introuvable (${img.src})`);
      if (!img.width || !img.height || !bi(img.alt)) errors.push(`${at}: asset ${it.image} sans dimensions ou alt EN/FR`);
    }
    if (it.thumb && !m.fileExists(it.thumb)) errors.push(`${at}: vignette introuvable (${it.thumb})`);
    if (!m.layouts[it.layout]) errors.push(`${at}: layout inconnu (${it.layout})`);
    if (!it.tag || !bi(it.tag)) errors.push(`${at}: tag EN/FR requis`);
    let diagrams = 0; let visuals = 0;
    for (const lang of LANGS) {
      const c = it[lang]; const where = `${at}.${lang}`;
      if (!c) { errors.push(`${where}: bloc manquant`); continue; }
      for (const k of ['title', 'summary']) if (!c[k] || !String(c[k]).trim()) errors.push(`${where}: "${k}" vide`);
      if (c.summary && c.summary.length > 220) errors.push(`${where}: summary trop long (${c.summary.length} > 220)`);
      if (!Array.isArray(c.body) || c.body.length === 0) { errors.push(`${where}: body (tableau de blocs) requis`); continue; }
      if (!c.body.some((b) => b && typeof b === 'object' && 'h2' in b)) errors.push(`${where}: au moins un intertitre h2 requis pour le sommaire`);
      errors.push(...blockErrors(c.body, where, ctx));
      const html = inlineHtml(c.body);
      const opens = (html.match(/<(p|ul|ol|li|a|code|strong|em)(\s|>)/g) || []).length;
      const closes = (html.match(/<\/(p|ul|ol|li|a|code|strong|em)>/g) || []).length;
      if (opens !== closes) errors.push(`${where}: balises du corps non équilibrées`);
      for (const mm of html.matchAll(/href="([^"]+)"/g)) {
        if (/^(https?:|mailto:|#)/.test(mm[1])) continue;
        const base = lang === 'fr' ? path.join(m.root, 'fr') : m.root;
        const file = mm[1].replace(/^news\//, 'news/').split('#')[0];
        if (!m.fileExists(path.relative(m.root, path.join(base, file)))) errors.push(`${where}: lien local introuvable (${mm[1]})`);
      }
      const n = c.body.filter((b) => b && typeof b === 'object' && 'diagram' in b).length;
      if (lang === 'en') diagrams = n; else if (n !== diagrams) errors.push(`${where}: nombre de schémas différent de la version EN`);
      const v = c.body.filter((b) => b && typeof b === 'object' && VISUAL_BLOCKS.some((k) => k in b)).length;
      if (lang === 'en') visuals = v; else if (v !== visuals) errors.push(`${where}: nombre de visuels (${VISUAL_BLOCKS.join(', ')}) différent de la version EN`);
    }
    if (m.bundle?.requireVisual && visuals < 1) errors.push(`${at}: au moins un visuel porteur d'information requis (${VISUAL_BLOCKS.join(', ')})`);
    const animated = animatedCount(m, it);
    if (animated > (m.bundle?.maxAnimatedPerArticle ?? 1)) errors.push(`${at}: ${animated} schémas animés (maximum ${m.bundle?.maxAnimatedPerArticle ?? 1} par article)`);
  });
  return errors;
}

/** Blocs qui portent une information visuelle (un article en contient au moins un). */
export const VISUAL_BLOCKS = ['diagram', 'stats', 'pullstat', 'compare', 'timeline', 'figure', 'cards'];

/** Nombre de schémas animés (animate: true) cités dans le corps EN d'un article. */
export function animatedCount(m, it) {
  return (it.en?.body || []).filter((b) => b && typeof b === 'object' && b.diagram && m.diagrams[b.diagram]?.animate === true).length;
}

export function validate(m) {
  const errors = [...m.errors];
  for (const group of ['natures', 'domains']) {
    const entries = m.taxonomy?.[group];
    if (!entries || typeof entries !== 'object' || Array.isArray(entries) || !Object.keys(entries).length) {
      errors.push(`taxonomy.${group}: catalogue non vide requis`);
      continue;
    }
    for (const [id, labels] of Object.entries(entries)) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || !bi(labels)) errors.push(`taxonomy.${group}.${id}: id stable et libellés EN/FR requis`);
    }
  }
  if (!m.bundle) errors.push('bundle.json manquant');
  if (!m.ui) errors.push('ui.json manquant');
  if (!m.items.length) errors.push('articles: au moins un article attendu');
  errors.push(...layoutErrors(m.layouts), ...diagramErrors(m.diagrams));
  if (m.bundle) {
    const min = m.bundle.minLayouts || 0;
    if (Object.keys(m.layouts).length < min) errors.push(`layouts: ${min} mises en page minimum (${Object.keys(m.layouts).length} trouvées)`);
    if (new Set(m.items.map((it) => it.layout)).size < Math.min(min, m.items.length)) errors.push(`articles: ${min} mises en page distinctes minimum parmi les articles`);
  }
  errors.push(...articleErrors(m));
  if (m.bundle?.noConsecutiveAnimated) {
    for (let i = 1; i < m.items.length; i++) if (animatedCount(m, m.items[i]) && animatedCount(m, m.items[i - 1])) errors.push(`articles: ${m.items[i - 1].slug} et ${m.items[i].slug} se suivent avec un schéma animé chacun`);
  }
  if (m.bundle?.maxAnimatedShare !== undefined && m.items.length >= 4) {
    const share = m.items.filter((it) => animatedCount(m, it) > 0).length / m.items.length;
    if (share > m.bundle.maxAnimatedShare) errors.push(`articles: ${Math.round(share * 100)} % des articles ont un schéma animé (maximum ${Math.round(m.bundle.maxAnimatedShare * 100)} %)`);
  }
  if (m.bundle?.noConsecutiveSameLayout) {
    for (let i = 1; i < m.items.length; i++) if (m.items[i].layout === m.items[i - 1].layout) errors.push(`articles: ${m.items[i - 1].slug} et ${m.items[i].slug} se suivent avec la même mise en page (${m.items[i].layout})`);
  }
  return errors;
}
