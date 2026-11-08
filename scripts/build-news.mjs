#!/usr/bin/env node
// AI-KIDO website — génération déterministe des actualités à partir de content/news/**.json.
// Usage : node scripts/build-news.mjs [--check | --dry-run | --list | --validate] [--all | --article SLUG | --layout ID | --diagram ID | --asset ID]
//   (sans option) écrit news.html, fr/news.html, news/*.html, fr/news/*.html, le bandeau des accueils et le sitemap
//   --check       n'écrit rien ; sort en erreur si un fichier généré n'est pas à jour
//   --dry-run     liste les sorties modifiées sans écrire
//   --article / --layout / --diagram / --asset : sélecteurs répétables ; union des articles et dépendances
//   --list        liste les articles (slug, date, layout, schémas)
//   --validate    contrôle les sources et ne retourne que les erreurs
// Sortie : un seul objet JSON. Aucune dépendance (Node.js 20+). Le code est dans scripts/news/ ; le contenu dans content/news/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll, listArticles, validateOnly } from './news/build.mjs';
import { formatDate } from './news/util.mjs';
import { validate as validateModel } from './news/validate.mjs';
import { loadModel } from './news/load.mjs';

export { buildAll, formatDate };
/** validate(root) : liste des erreurs des sources de content/news (vide si tout est valide). */
export const validate = (root) => validateModel(loadModel(root));

export function parseArgs(args) {
  const flags = new Set(['--all', '--lists', '--check', '--dry-run', '--list', '--validate']);
  const selectors = { '--article': 'articles', '--layout': 'layouts', '--diagram': 'diagrams', '--asset': 'assets' };
  const options = { selection: {} };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--lists') options.selection.lists = true;
    else if (flags.has(arg)) options[arg.slice(2)] = true;
    else if (selectors[arg]) {
      const value = args[++i];
      if (!value || value.startsWith('-')) throw new Error(`${arg}: identifiant requis`);
      (options.selection[selectors[arg]] ||= []).push(value);
    } else throw new Error(`option inconnue (${arg})`);
  }
  if (options.all && Object.keys(options.selection).length) throw new Error('--all incompatible avec une sélection');
  if ([options.check, options['dry-run'], options.list, options.validate].filter(Boolean).length > 1) throw new Error('choisir un seul mode : --check, --dry-run, --list ou --validate');
  if ((options.list || options.validate) && (options.all || Object.keys(options.selection).length)) throw new Error('--list et --validate contrôlent toutes les sources, sans sélection');
  return options;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  let options;
  try { options = parseArgs(process.argv.slice(2)); } catch (error) {
    console.log(JSON.stringify({ ok: false, errors: [error.message] }));
    process.exitCode = 1;
    return;
  }
  if (options.list) { console.log(JSON.stringify({ ok: true, items: listArticles(root) })); return; }
  if (options.validate) {
    const errors = validateOnly(root);
    console.log(JSON.stringify(errors.length ? { ok: false, errors } : { ok: true }));
    if (errors.length) process.exit(1);
    return;
  }
  const check = options.check;
  const dryRun = options['dry-run'];
  const res = buildAll(root, options.selection);
  if (res.errors) { console.log(JSON.stringify({ ok: false, errors: res.errors })); process.exit(1); }
  const stale = []; const written = [];
  for (const [rel, content] of res.files) {
    const abs = path.join(root, rel);
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if (cur === content) continue;
    if (check || dryRun) { stale.push(rel); continue; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    written.push(rel);
  }
  if (check && stale.length) { console.log(JSON.stringify({ ok: false, stale })); process.exit(1); }
  console.log(JSON.stringify({ ok: true, items: res.count, files: res.files.size, articles: res.articles, targeted: res.targeted, ...(dryRun ? { changed: stale } : {}), written }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
