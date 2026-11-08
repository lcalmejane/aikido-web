// Types de blocs du corps d'un article : contrôles et rendu HTML. Aucun contenu éditorial.
import { esc, slugify, prefixRel, assetSrc } from './util.mjs';
import { renderDiagram } from './diagrams.mjs';

export const BLOCKS = ['h2', 'code', 'figure', 'callout', 'stats', 'steps', 'quote', 'chat', 'compare', 'timeline', 'faq', 'cards', 'diagram', 'pullstat', 'kicker', 'references'];
const isStr = (b) => typeof b === 'string';
const LIMITS = /^\s*(limits?|limites?|limitations?|caveats?|avertissements?)\s*[.:]?\s*$/i;
const SECRET = /(ghp_|github_pat_|sk-[A-Za-z0-9]{16,}|BEGIN [A-Z ]*PRIVATE KEY|\/Users\/[a-z]|\/home\/[a-z])/;
const API_LANGS = new Set(['json', 'jsonc', 'api']);

/** Texte HTML en ligne de tous les blocs : sert aux contrôles de balises et de liens. */
export function inlineHtml(body) {
  const out = [];
  const p = (s) => { if (s) out.push(`<p>${s}</p>`); };
  for (const b of body) {
    if (isStr(b)) { out.push(b); continue; }
    if (!b || typeof b !== 'object') continue;
    p(b.callout); p(b.caption); p(b.quote); p(b.kicker);
    (b.steps || []).forEach(p);
    (b.chat || []).forEach((m) => p(m.html));
    (b.timeline || []).forEach((t) => p(t.text));
    (b.faq || []).forEach((f) => p(f.a));
    (b.cards || []).forEach((c) => p(c.text));
    (b.references || []).forEach((r) => p(r.note));
    for (const side of b.compare ? [b.compare.left, b.compare.right] : []) (side?.items || []).forEach(p);
  }
  return out.join('\n');
}

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

/** Contrôles des blocs typés. ctx = { assets, diagrams, root }. */
export function blockErrors(body, at, ctx) {
  const errors = [];
  let prevJson = false; let jsonCount = 0;
  body.forEach((b, i) => {
    const here = `${at}.body[${i}]`;
    if (isStr(b)) { prevJson = false; return; }
    if (!b || typeof b !== 'object' || Array.isArray(b)) { errors.push(`${here}: chaîne HTML ou objet de bloc attendu`); prevJson = false; return; }
    const kinds = BLOCKS.filter((k) => k in b);
    if (kinds.length !== 1) { errors.push(`${here}: un seul type de bloc attendu parmi ${BLOCKS.join(', ')}`); prevJson = false; return; }
    const k = kinds[0];
    if (k === 'h2') {
      if (!nonEmpty(b.h2)) errors.push(`${here}: h2 vide`);
      if (LIMITS.test(String(b.h2))) errors.push(`${here}: intertitre « Limites » interdit (voir consignes-articles-news.md)`);
    }
    if (k === 'callout') {
      if (!nonEmpty(b.callout)) errors.push(`${here}: callout vide`);
      if (LIMITS.test(String(b.title || ''))) errors.push(`${here}: encadré « Limites » interdit (voir consignes-articles-news.md)`);
    }
    if (k === 'code') {
      if (!nonEmpty(b.code)) errors.push(`${here}: code vide`);
      if (!/^[a-z0-9+-]+$/.test(b.lang || '')) errors.push(`${here}: lang requis (ex. bash, json, js)`);
      if (SECRET.test(b.code || '')) errors.push(`${here}: le code semble contenir un secret ou un chemin personnel`);
      if (API_LANGS.has(b.lang)) {
        jsonCount++;
        if (prevJson) errors.push(`${here}: deux blocs JSON/API d'affilée (l'humain d'abord, voir L-news-008)`);
        if (jsonCount > 1) errors.push(`${here}: un seul bloc JSON/API par article (voir L-news-008)`);
        prevJson = true;
      } else prevJson = false;
    } else prevJson = false;
    if (k === 'figure') {
      const a = ctx.assets[b.figure];
      if (!a) errors.push(`${here}: asset inconnu (${b.figure})`);
      else if (!ctx.skipFiles) for (const l of ['en', 'fr']) if (!fileOk(ctx, assetSrc(a, l))) errors.push(`${here}: image introuvable (${assetSrc(a, l)})`);
    }
    if (k === 'stats') {
      if (!Array.isArray(b.stats) || b.stats.length < 2 || b.stats.length > 4) errors.push(`${here}: stats attend 2 à 4 chiffres`);
      else for (const s of b.stats) if (!s.value || !s.label) errors.push(`${here}: chaque chiffre porte value et label`);
    }
    if (k === 'steps' && (!Array.isArray(b.steps) || b.steps.length === 0)) errors.push(`${here}: steps vide`);
    if (k === 'quote' && !nonEmpty(b.quote)) errors.push(`${here}: quote vide`);
    if (k === 'kicker' && !nonEmpty(b.kicker)) errors.push(`${here}: kicker vide`);
    if (k === 'pullstat' && (!b.pullstat || !b.pullstat.value || !b.pullstat.label)) errors.push(`${here}: pullstat attend value et label`);
    if (k === 'chat') {
      if (!Array.isArray(b.chat) || b.chat.length < 1) errors.push(`${here}: chat vide`);
      else b.chat.forEach((m, j) => {
        if (!['you', 'assistant'].includes(m.role)) errors.push(`${here}.chat[${j}]: role you|assistant attendu`);
        if (!nonEmpty(m.text) && !nonEmpty(m.html)) errors.push(`${here}.chat[${j}]: text ou html requis`);
        if (SECRET.test(`${m.text || ''}${m.html || ''}`)) errors.push(`${here}.chat[${j}]: secret ou chemin personnel`);
      });
    }
    if (k === 'compare') {
      const c = b.compare || {};
      for (const s of ['left', 'right']) if (!c[s] || !nonEmpty(c[s].title) || !Array.isArray(c[s].items) || c[s].items.length === 0) errors.push(`${here}: compare.${s} attend title et items`);
    }
    if (k === 'timeline' && (!Array.isArray(b.timeline) || b.timeline.length < 2 || b.timeline.some((t) => !nonEmpty(t.when) || !nonEmpty(t.text)))) errors.push(`${here}: timeline attend au moins 2 entrées {when, text}`);
    if (k === 'faq' && (!Array.isArray(b.faq) || b.faq.length < 2 || b.faq.some((f) => !nonEmpty(f.q) || !nonEmpty(f.a)))) errors.push(`${here}: faq attend au moins 2 entrées {q, a}`);
    if (k === 'cards' && (!Array.isArray(b.cards) || b.cards.length < 2 || b.cards.length > 4 || b.cards.some((c) => !nonEmpty(c.title) || !nonEmpty(c.text)))) errors.push(`${here}: cards attend 2 à 4 entrées {title, text}`);
    if (k === 'diagram' && !ctx.diagrams[b.diagram]) errors.push(`${here}: schéma inconnu (${b.diagram})`);
    if (k === 'references') errors.push(...referenceErrors(b.references, here));
  });
  errors.push(...citationErrors(body, at));
  return errors;
}

/** Bloc « références » : liste numérotée de sources externes (éditeur, titre, lien https). */
function referenceErrors(refs, here) {
  const errors = [];
  if (!Array.isArray(refs) || refs.length < 2) return [`${here}: references attend au moins 2 sources {publisher, title, url}`];
  const seen = new Set();
  refs.forEach((r, j) => {
    const at = `${here}.references[${j}]`;
    if (!r || !nonEmpty(r.publisher) || !nonEmpty(r.title)) errors.push(`${at}: publisher et title requis`);
    if (!r || !/^https:\/\/[^\s"<>]+$/.test(r.url || '')) errors.push(`${at}: url https valide requise`);
    else if (seen.has(r.url)) errors.push(`${at}: url en double (${r.url})`);
    else seen.add(r.url);
    if (r && r.by !== undefined && !nonEmpty(r.by)) errors.push(`${at}: by vide`);
  });
  return errors;
}

/** Appel de source dans le texte : `{ref:N|mots}` → lien sur les mots, résolu par le build. */
export const REF_CALL = /\{ref:(\d+)\|([^}|]*)\}/g;

/** Remplace chaque `{ref:N|mots}` par un lien direct vers la source N, avec « Éditeur — Titre » au survol. */
export function expandRefs(html, refs = []) {
  if (!html || !html.includes('{ref:')) return html;
  return html.replace(REF_CALL, (m, n, label) => {
    const r = refs[Number(n) - 1];
    if (!r) return m;
    const title = `${r.publisher} — ${r.title}`;
    return `<a class="src" href="${esc(r.url)}" title="${esc(title)}" rel="noopener noreferrer" target="_blank">${label}</a>`;
  });
}

/** Les appels `{ref:N|mots}` du texte doivent viser une source de la liste ; la liste est après le texte ; aucun « [n] » dans le corps. */
function citationErrors(body, at) {
  const blocks = body.filter((b) => b && typeof b === 'object' && 'references' in b);
  const html = inlineHtml(body);
  const errors = [];
  const calls = [...html.matchAll(REF_CALL)];
  const cited = new Set(calls.map((m) => Number(m[1])));
  for (const m of calls) if (!m[2].trim()) errors.push(`${at}: appel {ref:${m[1]}|…} sans mots porteurs`);
  if (/\[\d+\]/.test(html)) errors.push(`${at}: appel de source numéroté « [n] » interdit dans le corps (utiliser {ref:N|mots})`);
  if (/href="#ref-\d+"/.test(html)) errors.push(`${at}: lien #ref-N interdit dans le corps (utiliser {ref:N|mots})`);
  for (const m of html.matchAll(/<a class="src"[^>]*>/g)) if (!/\stitle="[^"]+"/.test(m[0])) errors.push(`${at}: lien source sans title`);
  if (!blocks.length) return cited.size ? [...errors, `${at}: appel de référence sans bloc references`] : errors;
  if (blocks.length > 1) errors.push(`${at}: un seul bloc references par article`);
  const n = (blocks[0].references || []).length;
  for (const c of cited) if (c < 1 || c > n) errors.push(`${at}: appel {ref:${c}} sans source correspondante (${n} sources)`);
  if (body.indexOf(blocks[0]) !== body.length - 1) errors.push(`${at}: le bloc references termine l'article`);
  return errors;
}

function fileOk(ctx, rel) { return ctx.fileExists(rel); }

/** Rendu des blocs. `up` = préfixe vers la racine du site ; `rel` = préfixe des liens locaux. */
export function renderBlocks(body, { lang, up, rel, assets, diagrams, ui }) {
  const L = ui.labels[lang];
  const refs = (body.find((b) => b && typeof b === 'object' && 'references' in b) || {}).references || [];
  const tx = (s) => prefixRel(expandRefs(s, refs), rel);
  const cap = (c) => (c ? `\n          <figcaption>${tx(c)}</figcaption>` : '');
  return body.map((b) => {
    if (isStr(b)) return tx(b);
    if ('h2' in b) return `<h2 id="${slugify(b.h2)}">${esc(b.h2)}</h2>`;
    if ('code' in b) return `<figure class="code-block">\n          <div class="code-lang">${esc(b.lang)}</div>\n          <pre tabindex="0"><code class="language-${esc(b.lang)}">${esc(b.code.replace(/\n+$/, ''))}</code></pre>${cap(b.caption)}\n        </figure>`;
    if ('figure' in b) {
      const a = assets[b.figure]; const src = assetSrc(a, lang);
      return `<figure class="article-figure">\n          <img src="${up}${esc(src)}" alt="${esc(b.alt || a.alt[lang])}" width="${a.width}" height="${a.height}" loading="lazy" decoding="async">${cap(b.caption)}\n        </figure>`;
    }
    if ('callout' in b) return `<aside class="callout">${b.title ? `<strong class="callout-title">${esc(b.title)}</strong>` : ''}<p>${tx(b.callout)}</p></aside>`;
    if ('stats' in b) return `<ul class="stats">\n          ${b.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('\n          ')}\n        </ul>`;
    if ('steps' in b) return `<ol class="steps">\n          ${b.steps.map((s) => `<li>${tx(s)}</li>`).join('\n          ')}\n        </ol>`;
    if ('quote' in b) return `<blockquote class="pull-quote"><p>${tx(b.quote)}</p>${b.by ? `<footer>${esc(b.by)}</footer>` : ''}</blockquote>`;
    if ('kicker' in b) return `<p class="kicker">${tx(b.kicker)}</p>`;
    if ('pullstat' in b) return `<div class="pullstat"><strong>${esc(b.pullstat.value)}</strong><span>${esc(b.pullstat.label)}</span></div>`;
    if ('chat' in b) {
      const msgs = b.chat.map((m) => {
        const who = m.role === 'you' ? L.you : L.assistant;
        const text = m.html ? tx(m.html) : `<span class="chat-text">${esc(m.text)}</span>`;
        return `<li class="chat-msg chat-${m.role}"><span class="chat-who">${esc(who)}</span><div class="chat-bubble">${text}</div></li>`;
      }).join('\n          ');
      return `<ol class="chat" aria-label="${esc(b.title || L.prompt)}">\n          ${msgs}\n        </ol>`;
    }
    if ('compare' in b) {
      const side = (s, cls) => `<div class="compare-col ${cls}"><h3>${esc(s.title)}</h3><ul>${s.items.map((x) => `<li>${tx(x)}</li>`).join('')}</ul></div>`;
      return `<div class="compare">${side(b.compare.left, 'compare-before')}${side(b.compare.right, 'compare-after')}</div>`;
    }
    if ('timeline' in b) return `<ol class="timeline">\n          ${b.timeline.map((t) => `<li><time>${esc(t.when)}</time><span>${tx(t.text)}</span></li>`).join('\n          ')}\n        </ol>`;
    if ('faq' in b) return `<div class="faq">\n          ${b.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${tx(f.a)}</p></details>`).join('\n          ')}\n        </div>`;
    if ('cards' in b) return `<ul class="mini-cards">\n          ${b.cards.map((c) => `<li><strong>${esc(c.title)}</strong><span>${tx(c.text)}</span></li>`).join('\n          ')}\n        </ul>`;
    if ('references' in b) {
      const items = b.references.map((r, j) => `<li id="ref-${j + 1}"><span class="ref-pub">${esc(r.publisher)}</span> <a href="${esc(r.url)}" rel="noopener noreferrer" target="_blank">${esc(r.title)}</a>${r.by ? ` <span class="ref-by">${esc(r.by)}</span>` : ''}${r.note ? `<span class="ref-note">${tx(r.note)}</span>` : ''}</li>`).join('\n          ');
      return `<ol class="references" aria-label="${esc(b.title || L.references)}">\n          ${items}\n        </ol>`;
    }
    // diagram
    return `<figure class="article-figure diagram">\n          ${renderDiagram(diagrams[b.diagram], lang)}${cap(b.caption)}\n        </figure>`;
  }).join('\n        ');
}
