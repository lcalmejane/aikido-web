// Tests du générateur d'actualités. Lancer : node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildAll, formatDate, parseArgs } from './build-news.mjs';
import { loadModel } from './news/load.mjs';
import { validate as validateModel } from './news/validate.mjs';
import { renderArticle } from './news/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const model = () => loadModel(root);
const clone = (o) => JSON.parse(JSON.stringify(o));
const errorsOf = (m) => validateModel(m).join('\n');
const cloneModel = (m) => ({ ...clone({ ...m, fileExists: undefined }), fileExists: m.fileExists });

function fixture(t) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'aikido-web-targeted-')));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const rel of ['content', 'scripts']) fs.cpSync(path.join(root, rel), path.join(dir, rel), { recursive: true });
  fs.symlinkSync(path.join(root, 'assets'), path.join(dir, 'assets'), 'dir');
  const staticFiles = ['', 'fr/'].flatMap((prefix) => fs.readdirSync(path.join(root, prefix))
    .filter((file) => file.endsWith('.html')).map((file) => `${prefix}${file}`));
  for (const rel of [...staticFiles, 'sitemap.xml']) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.copyFileSync(path.join(root, rel), path.join(dir, rel));
  }
  for (const [rel, content] of buildAll(root).files) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

test('sélection ciblée : un article, un lot et les utilisateurs de layouts, schémas et assets', () => {
  const m = model();
  const selected = buildAll(root, { articles: ['learn-rules'] });
  assert.equal(selected.targeted, true);
  assert.deepEqual(selected.articles, ['learn-rules']);
  assert.equal(selected.files.size, 7);
  for (const key of ['layouts', 'diagrams', 'assets']) {
    const id = key === 'layouts' ? m.items[0].layout : key === 'diagrams'
      ? m.items[0].en.body.find((b) => b?.diagram).diagram : m.items[0].image;
    const result = buildAll(root, { [key]: [id] });
    const expected = m.items.filter((it) => key === 'layouts' ? it.layout === id
      : key === 'assets' ? it.image === id || ['en', 'fr'].some((l) => it[l].body.some((b) => b?.figure === id))
        : ['en', 'fr'].some((l) => it[l].body.some((b) => b?.diagram === id))).map((it) => it.slug);
    assert.deepEqual(result.articles, expected);
  }
  const slugs = m.items.slice(0, 2).map((it) => it.slug);
  assert.deepEqual(buildAll(root, { articles: slugs }).articles, slugs);
});

test('un titre modifié actualise les voisins sans recalculer les autres articles', (t) => {
  const dir = fixture(t);
  const before = loadModel(dir);
  const index = before.items.findIndex((it) => it.slug === 'learn-rules');
  const article = before.items[index];
  const file = path.join(dir, 'content/news/articles/learn-rules.json');
  article.en.title += ' — updated';
  article.fr.title += ' — actualisé';
  delete article.__file;
  fs.writeFileSync(file, JSON.stringify(article));
  const result = buildAll(dir, { articles: ['learn-rules'] });
  assert.equal(result.errors, undefined, result.errors?.join('\n'));
  const expected = before.items.slice(Math.max(0, index - 1), index + 2).map((it) => it.slug);
  assert.deepEqual(result.articles, expected);
  const full = buildAll(dir);
  for (const [rel, content] of full.files) {
    assert.equal(result.files.get(rel) ?? fs.readFileSync(path.join(dir, rel), 'utf8'), content, rel);
  }
});

test('retouche de fragment : dry-run et check sans écriture, puis deux sorties seulement', (t) => {
  const dir = fixture(t);
  const file = path.join(dir, 'content/news/articles/learn-rules.json');
  const article = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const lang of ['en', 'fr']) article[lang].body.push('<p>Editorial fragment.</p>');
  fs.writeFileSync(file, JSON.stringify(article));
  const baseline = new Map([...buildAll(dir).files.keys()].map((rel) => [rel, fs.readFileSync(path.join(dir, rel), 'utf8')]));
  const run = (...args) => {
    const child = spawnSync(process.execPath, [path.join(dir, 'scripts/build-news.mjs'), '--article', 'learn-rules', ...args], { encoding: 'utf8' });
    assert.equal(child.stderr, '');
    return { status: child.status, result: JSON.parse(child.stdout) };
  };
  const dry = run('--dry-run');
  assert.equal(dry.status, 0);
  const paths = ['news/learn-rules.html', 'fr/news/learn-rules.html'];
  assert.deepEqual(dry.result.changed, paths);
  assert.deepEqual(dry.result.written, []);
  assert.equal(run('--check').status, 1);
  for (const [rel, content] of baseline) assert.equal(fs.readFileSync(path.join(dir, rel), 'utf8'), content, rel);
  assert.deepEqual(run().result.written, paths);
  assert.equal(run('--check').status, 0);
  assert.deepEqual(run().result.written, []);
});

test('déplacement chronologique : anciens et nouveaux voisins restent cohérents', (t) => {
  const dir = fixture(t);
  const file = path.join(dir, 'content/news/articles/learn-rules.json');
  const article = JSON.parse(fs.readFileSync(file, 'utf8'));
  article.date = '2026-10-01';
  fs.writeFileSync(file, JSON.stringify(article));
  const result = buildAll(dir, { articles: ['learn-rules'] });
  assert.equal(result.errors, undefined, result.errors?.join('\n'));
  assert.deepEqual(new Set(result.articles), new Set(['learn-rules', 'local-designer', 'kimono-mcp']));
  for (const [rel, content] of buildAll(dir).files) {
    assert.equal(result.files.get(rel) ?? fs.readFileSync(path.join(dir, rel), 'utf8'), content, rel);
  }
});

test('sélections invalides et options ambiguës sont refusées explicitement', () => {
  assert.deepEqual(parseArgs(['--article', 'a', '--article', 'b', '--dry-run']).selection, { articles: ['a', 'b'] });
  for (const args of [['--article'], ['--unknown'], ['--all', '--article', 'a'], ['--dry-run', '--check'], ['--validate', '--article', 'a']]) {
    assert.throws(() => parseArgs(args));
  }
  for (const key of ['articles', 'layouts', 'diagrams', 'assets']) {
    assert.match(buildAll(root, { [key]: ['inexistant'] }).errors.join('\n'), /identifiant inconnu/);
    assert.match(buildAll(root, { [key]: [] }).errors.join('\n'), /sélection non vide/);
  }
});

test('listes seules : neuf cartes initiales, filtres bilingues et pagination sans rendu article', () => {
  const result = buildAll(root, { lists: true });
  assert.deepEqual(result.articles, []);
  assert.equal(result.files.size, 5);
  assert.equal(parseArgs(['--lists', '--dry-run']).selection.lists, true);
  for (const lang of ['en', 'fr']) {
    const html = result.files.get(`${lang === 'fr' ? 'fr/' : ''}news.html`);
    assert.equal([...html.matchAll(/class="card news-card"[^>]*>/g)].filter(([tag]) => !tag.includes(' hidden')).length, 9);
    assert.match(html, /data-news-year/);
    assert.match(html, /data-news-month/);
    assert.match(html, /select data-news-nature/);
    assert.match(html, /data-news-domain/);
    assert.match(html, /news-pagination\.js/);
    assert.match(html, /<noscript>/);
    assert.match(html, lang === 'fr' ? /Précédent/ : /Previous/);
  }
});

test('taxonomie : nature obligatoire, domaines connus et uniques, libellés bilingues', () => {
  const m = model();
  delete m.items[0].nature;
  m.items[1].domains = ['design', 'design'];
  m.items[2].domains = ['inconnu'];
  delete m.taxonomy.natures.guide.fr;
  const errors = errorsOf(m);
  assert.match(errors, /nature inconnue ou manquante/);
  assert.match(errors, /domains non vides, connus et uniques requis/);
  assert.match(errors, /libellés EN\/FR requis/);
});

test('formatDate : anglais et français', () => {
  assert.equal(formatDate('2026-10-28', 'en'), '28 October 2026');
  assert.equal(formatDate('2026-10-28', 'fr'), '28 octobre 2026');
  assert.equal(formatDate('2026-11-01', 'fr'), '1er novembre 2026');
});

test('la source actuelle est valide', () => {
  assert.deepEqual(validateModel(model()), []);
});

test('au moins 10 mises en page, toutes décrites en EN et FR', () => {
  const m = model();
  const ids = Object.keys(m.layouts);
  assert.ok(ids.length >= 10, `${ids.length} mises en page`);
  for (const l of Object.values(m.layouts)) {
    assert.ok(l.name.en && l.name.fr && l.description.en && l.description.fr, l.id);
  }
});

test('deux articles qui se suivent n’ont jamais la même mise en page', () => {
  const m = model();
  for (let i = 1; i < m.items.length; i++) assert.notEqual(m.items[i].layout, m.items[i - 1].layout, m.items[i].slug);
});

test('chaque article contient au moins un schéma, le même nombre en EN et en FR', () => {
  for (const it of model().items) {
    const n = (l) => it[l].body.filter((b) => b && typeof b === 'object' && 'diagram' in b).length;
    assert.ok(n('en') >= 1, `${it.slug} : schéma`);
    assert.equal(n('en'), n('fr'), `${it.slug} : EN/FR`);
  }
});

test('validation : slug en double, date invalide, image absente, bloc de langue manquant, layout inconnu', () => {
  const m = model();
  m.items[1].slug = m.items[0].slug;
  m.items[2].date = '2026-02-31';
  m.items[3].image = 'inconnue';
  m.items[4].layout = 'nope';
  delete m.items[0].fr;
  const errors = errorsOf(m);
  assert.match(errors, /slug en double/);
  assert.match(errors, /date AAAA-MM-JJ invalide/);
  assert.match(errors, /image inconnue/);
  assert.match(errors, /layout inconnu/);
  assert.match(errors, /bloc manquant/);
});

test('validation : aucune rubrique « Limites » (intertitre ou encadré), en EN comme en FR', () => {
  const m = model();
  m.items[0].en.body = [{ h2: 'Limits' }, '<p>x</p>'];
  m.items[0].fr.body = [{ callout: 'x', title: 'Limites' }, '<p>x</p>'];
  const errors = errorsOf(m);
  assert.match(errors, /intertitre « Limites » interdit/);
  assert.match(errors, /encadré « Limites » interdit/);
});

test('validation : lien local cassé, balises déséquilibrées, résumé trop long', () => {
  const m = model();
  m.items[0].en.body = ['<p>Voir <a href="nexiste-pas.html">ici</a>.</p>', { diagram: Object.keys(m.diagrams)[0] }];
  m.items[0].fr.body = ['<p>Texte non fermé', { diagram: Object.keys(m.diagrams)[0] }];
  m.items[1].en.summary = 'x'.repeat(221);
  const errors = errorsOf(m);
  assert.match(errors, /lien local introuvable/);
  assert.match(errors, /balises du corps non équilibrées/);
  assert.match(errors, /summary trop long/);
});

test('validation : blocs typés incomplets ou inconnus', () => {
  const m = model();
  const d = Object.keys(m.diagrams)[0];
  m.items[0].en.body = [
    { chat: [{ role: 'robot', text: 'x' }] },
    { compare: { left: { title: 'a', items: ['x'] } } },
    { timeline: [{ when: '1', text: 'x' }] },
    { faq: [{ q: 'q', a: 'a' }] },
    { cards: [{ title: 't', text: 'x' }] },
    { diagram: 'nexiste-pas' },
    { h2: 'a', code: 'b' },
    { diagram: d },
  ];
  const errors = errorsOf(m);
  assert.match(errors, /role you\|assistant attendu/);
  assert.match(errors, /compare\.right attend title et items/);
  assert.match(errors, /timeline attend au moins 2 entrées/);
  assert.match(errors, /faq attend au moins 2 entrées/);
  assert.match(errors, /cards attend 2 à 4 entrées/);
  assert.match(errors, /schéma inconnu/);
  assert.match(errors, /un seul type de bloc attendu/);
});

test('validation : schéma sans traduction ou de type inconnu', () => {
  const m = model();
  const id = Object.keys(m.diagrams)[0];
  const d = clone(m.diagrams[id]);
  delete d.nodes[0].label.fr;
  d.type = 'inconnu';
  m.diagrams.autre = { ...d, __file: 'autre.json' };
  const m2 = model();
  m2.diagrams[id].nodes[0].label = { en: 'x' };
  assert.match(errorsOf(m), /type inconnu/);
  assert.match(errorsOf(m2), /sans label EN\/FR/);
});

test('validation : au plus un bloc JSON/API, jamais deux d’affilée', () => {
  const m = model();
  const d = Object.keys(m.diagrams)[0];
  m.items[0].en.body = [{ code: '{"a":1}', lang: 'json' }, { code: '{"b":2}', lang: 'json' }, { diagram: d }];
  const errors = errorsOf(m);
  assert.match(errors, /deux blocs JSON\/API d'affilée/);
  assert.match(errors, /un seul bloc JSON\/API par article/);
});

test('les fichiers générés sont à jour (idempotence)', () => {
  const res = buildAll(root);
  assert.equal(res.errors, undefined);
  for (const [rel, content] of res.files) {
    assert.equal(fs.readFileSync(path.join(root, rel), 'utf8'), content, `${rel} n'est pas à jour : lancez node scripts/build-news.mjs`);
  }
});

test('chaque page générée porte canonical, hreflang EN/FR/x-default et un seul h1', () => {
  const res = buildAll(root);
  for (const [rel, html] of res.files) {
    if (!/news(\.html|\/)/.test(rel) || rel.endsWith('index.html')) continue;
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.ai-kido\.fr\//, rel);
    assert.match(html, /hreflang="en"/, rel);
    assert.match(html, /hreflang="fr"/, rel);
    assert.match(html, /hreflang="x-default"/, rel);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${rel}: un seul h1`);
  }
});

test('les feuilles de style et scripts des pages News FR et EN pointent vers des fichiers existants', () => {
  const res = buildAll(root);
  for (const [rel, html] of res.files) {
    if (!/news(\.html|\/)/.test(rel) || rel.endsWith('index.html')) continue;
    for (const mm of html.matchAll(/(?:href|src)="((?:\.\.\/)*assets\/[^"?#]+)/g)) {
      const target = path.join(root, path.dirname(rel), mm[1]);
      assert.ok(fs.existsSync(target), `${rel} : ${mm[1]} introuvable`);
    }
  }
});

test('chaque page du site charge theme.js une seule fois (sinon le bouton de thème bascule deux fois)', () => {
  const pages = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.html')) pages.push(p);
    }
  };
  walk(root);
  assert.ok(pages.length > 20, 'pages HTML trouvées');
  for (const p of pages) {
    const html = fs.readFileSync(p, 'utf8');
    const n = (html.match(/<script src="[^"]*theme\.js[^"]*"><\/script>/g) || []).length;
    assert.equal(n, 1, `${path.relative(root, p)} : theme.js chargé ${n} fois`);
  }
});

test('le bandeau de l’accueil pointe vers la dernière actualité', () => {
  const res = buildAll(root);
  const latest = model().items[0];
  for (const home of ['index.html', 'fr/index.html']) {
    assert.ok(res.files.get(home).includes(`href="news/${latest.slug}.html"`), home);
  }
});

test('le sitemap liste les deux langues de chaque page de l’actualité', () => {
  const sm = buildAll(root).files.get('sitemap.xml');
  for (const it of model().items) {
    assert.ok(sm.includes(`<loc>https://www.ai-kido.fr/news/${it.slug}.html</loc>`));
    assert.ok(sm.includes(`<loc>https://www.ai-kido.fr/fr/news/${it.slug}.html</loc>`));
  }
});

test('les images FR des articles remontent de deux niveaux', () => {
  const res = buildAll(root);
  const m = model();
  const it = m.items[0];
  const src = m.assets[it.image].src;
  assert.ok(res.files.get(`fr/news/${it.slug}.html`).includes(`src="../../${src}"`));
  assert.ok(res.files.get(`news/${it.slug}.html`).includes(`src="../${src}"`));
});

test('chaque article reçoit les classes de sa mise en page', () => {
  const res = buildAll(root);
  const m = model();
  for (const it of m.items) {
    const l = m.layouts[it.layout];
    const html = res.files.get(`news/${it.slug}.html`);
    assert.ok(html.includes(`nl-${l.id}`) && html.includes(`hero-${l.hero}`) && html.includes(`w-${l.width}`), it.slug);
    assert.ok(html.includes('news-layouts.css'), `${it.slug} : feuille de mise en page`);
  }
});

test('schémas : pas de classe d’animation sur le <svg>, flèches seules animées, reduced-motion respecté', () => {
  const res = buildAll(root);
  for (const [rel, html] of res.files) {
    if (!/news\//.test(rel)) continue;
    for (const mm of html.matchAll(/<svg class="([^"]+)"/g)) assert.doesNotMatch(mm[1], /\bdg-flow\b/, `${rel} : dg-flow sur le <svg>`);
    for (const mm of html.matchAll(/<text[^>]*class="[^"]*dg-flow/g)) assert.fail(`${rel} : texte animé`);
  }
  const css = fs.readFileSync(path.join(root, 'assets/css/news-layouts.css'), 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{[^}]*\.dg-flow\s*\{\s*animation:\s*none/);
  assert.doesNotMatch(css, /\.dg-node\s*\{[^}]*animation/, 'les nœuds (textes, boîtes) ne s’animent pas');
  assert.match(css, /\.dg-svg text[^{]*\{[^}]*animation:\s*none/);
});

test('les prompts et blocs de code passent à la ligne (pas de défilement horizontal)', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/news-layouts.css'), 'utf8');
  assert.match(css, /\.code-block pre\s*\{[^}]*white-space:\s*pre-wrap/);
  assert.match(css, /\.chat-bubble\s*\{[^}]*white-space:\s*pre-wrap/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});

test('les options de mise en page se retrouvent dans les classes de l’article', () => {
  const res = buildAll(root);
  const m = model();
  for (const it of m.items) {
    const l = m.layouts[it.layout];
    const html = res.files.get(`news/${it.slug}.html`);
    assert.ok(html.includes(`title-${l.title || 'normal'}`), `${it.slug} : titre`);
    assert.ok(html.includes(`meta-${l.meta || 'inline'}`), `${it.slug} : méta`);
    assert.ok(html.includes(`body-${l.body || 'prose'}`), `${it.slug} : corps`);
    assert.ok(html.includes('rail-toc-cta'), `${it.slug} : navigation persistante obligatoire`);
  }
});

test('tous les layouts conservent sommaire et consigne, y compris sous une image à gauche', () => {
  const m = cloneModel(model());
  for (const layout of Object.values(m.layouts)) {
    m.items[0].layout = layout.id;
    for (const lang of ['en', 'fr']) {
      const html = renderArticle(m, lang, 0);
      assert.match(html, /class="article-grid"/, layout.id);
      assert.match(html, /class="article-toc"/, layout.id);
      assert.match(html, /class="article-cta"/, layout.id);
      assert.match(html, /class="article-mobile-tools"/, layout.id);
      assert.match(html, /details name="article-tools"/, layout.id);
      assert.match(html, /news-navigation\.js/, layout.id);
      if (layout.hero === 'left') assert.match(html, /class="article-side"><img[\s\S]*?class="article-toc"[\s\S]*?class="article-cta"/, layout.id);
    }
  }
});

test('un article sans intertitre est refusé plutôt que livré sans navigation', () => {
  const m = cloneModel(model());
  m.items[0].en.body = m.items[0].en.body.filter((b) => !(b && typeof b === 'object' && 'h2' in b));
  assert.match(errorsOf(m), /intertitre h2 requis pour le sommaire/);
});

test('les styles sticky couvrent rails, colonne image et barre mobile', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/news-layouts.css'), 'utf8');
  assert.match(css, /\.article-grid > \.article-toc, \.article-grid > \.article-cta, \.article-side\s*\{[^}]*position: sticky/);
  assert.match(css, /\.article-mobile-tools\s*\{[^}]*position: sticky/);
  assert.match(css, /max-height: calc\(100dvh/);
  assert.match(css, /\.article-body h2\s*\{[^}]*scroll-margin-top:/);
});

test('learn distingue le principe historique, la commande et l’aperçu Tatami réel', () => {
  const m = model();
  const article = m.items.find((it) => it.slug === 'learn-rules');
  for (const lang of ['en', 'fr']) {
    const body = JSON.stringify(article[lang].body);
    assert.match(body, /blob\/1\.4\/prompts\/hard_points\/ai-kido\.md/);
    assert.match(body, /releases\/tag\/1\.5\.2/);
    assert.match(body, /@aikido-method\/cli/);
    assert(article[lang].body.some((b) => b?.figure === 'learn-command-tatami'));
    assert.match(body, lang === 'fr' ? /Aperçu de développement/ : /Development preview/);
  }
  assert.equal(m.assets['learn-command-tatami'].src, 'assets/images/news/learn-ecosystem-tatami.png');
  assert.equal(m.assets['learn-command-tatami'].width, 1200);
  assert.equal(m.assets['learn-command-tatami'].height, 664);
  for (const lang of ['en', 'fr']) {
    const figure = article[lang].body.find((b) => b?.figure === 'learn-command-tatami');
    assert.match(figure.caption, /href="(?:\.\.\/)?assets\/images\/news\/learn-ecosystem-tatami\.png"/);
    assert.match(m.assets['learn-command-tatami'].alt[lang], /Learn/);
  }
});

test('animate n’est accepté que pour un flux, et une barre exige une valeur', () => {
  const m = cloneModel(model());
  m.diagrams['truth-pyramid'].animate = true;
  assert.match(errorsOf(m), /animate n'a de sens que pour un flux/);
  const n = cloneModel(model());
  n.diagrams['designer-bars'].nodes[0].value = 0;
  assert.match(errorsOf(n), /sans value numérique positive/);
});

test('un schéma est statique par défaut : seuls les schémas qui le demandent sont animés', () => {
  const m = model();
  const animated = Object.values(m.diagrams).filter((d) => d.animate === true);
  assert.ok(animated.length <= Math.floor(Object.keys(m.diagrams).length / 2), 'trop de schémas animés');
  const res = buildAll(root);
  const staticHtml = res.files.get('news/source-hierarchy.html');
  assert.doesNotMatch(staticHtml, /class="dg-svg[^"]*animated/, 'la pyramide ne doit pas être animée');
});

test('deux articles qui se suivent ne sont pas animés tous les deux', () => {
  const m = cloneModel(model());
  const [a, b] = m.items;
  for (const it of [a, b]) {
    const id = Object.keys(m.diagrams).find((k) => k === 'det-flow');
    m.diagrams[id].animate = true;
    it.en.body.push({ diagram: id });
    it.fr.body.push({ diagram: id });
  }
  assert.match(errorsOf(m), /se suivent avec un schéma animé/);
});

test('les articles varient les types de visuels : au moins 5 types de schémas utilisés', () => {
  const m = model();
  const types = new Set(Object.values(m.diagrams).map((d) => d.type));
  for (const t of ['bars', 'pyramid', 'tree', 'flow']) assert.ok(types.has(t), `type ${t} utilisé`);
  assert.ok(types.size >= 5, `${types.size} types`);
});

test('les nouveaux articles ont une image, un texte alternatif EN/FR et un contenu FR comme EN', () => {
  const m = model();
  for (const slug of ['learn-rules', 'source-hierarchy', 'swarm-team', 'local-designer', 'task-store']) {
    const it = m.items.find((x) => x.slug === slug);
    assert.ok(it, slug);
    const a = m.assets[it.image];
    assert.ok(a.alt.en && a.alt.fr, `${slug} : alt`);
    assert.equal(it.en.body.length, it.fr.body.length, `${slug} : même nombre de blocs`);
  }
});

test('validation : bloc references (sources, https, doublons, appels {ref:N|mots}, [n] interdit, position en fin d’article)', () => {
  const m = model();
  const ok = [{ publisher: 'A', title: 'T1', url: 'https://example.com/a' }, { publisher: 'B', title: 'T2', url: 'https://example.com/b' }];
  const bad = (body) => { const c = cloneModel(m); c.items[0].en.body = body; return errorsOf(c); };
  assert.match(bad([{ references: [ok[0]] }]), /references attend au moins 2 sources/);
  assert.match(bad([{ references: [ok[0], { publisher: 'B', title: 'T', url: 'http://example.com/b' }] }]), /url https valide requise/);
  assert.match(bad([{ references: [ok[0], { publisher: '', title: 'T', url: 'https://example.com/b' }] }]), /publisher et title requis/);
  assert.match(bad([{ references: [ok[0], ok[0]] }]), /url en double/);
  assert.match(bad(['<p>Voir {ref:3|Kiro}</p>', { references: ok }]), /\{ref:3\} sans source correspondante/);
  assert.match(bad(['<p>Voir {ref:1|Kiro}</p>']), /appel de référence sans bloc references/);
  assert.match(bad(['<p>Voir {ref:1|}</p>', { references: ok }]), /sans mots porteurs/);
  assert.match(bad(['<p>Voir Kiro [1]</p>', { references: ok }]), /« \[n\] » interdit/);
  assert.match(bad(['<p>Voir <a href="#ref-1">Kiro</a></p>', { references: ok }]), /#ref-N interdit/);
  assert.match(bad(['<p>Voir <a class="src" href="https://example.com/a">Kiro</a></p>', { references: ok }]), /lien source sans title/);
  assert.match(bad([{ references: ok }, '<p>après</p>']), /termine l'article/);
  assert.doesNotMatch(bad(['<p>Voir {ref:2|Kiro}</p>', { references: ok }]), /references|ref|source/);
});

test('rendu : {ref:N|mots} devient un lien direct vers la source avec « Éditeur — Titre » au survol', () => {
  const m = cloneModel(model());
  const i = m.items.findIndex((x) => x.slug === 'source-hierarchy');
  const it = m.items[i];
  it.en.body = ['<p>Per {ref:2|Kiro} and {ref:1|GitHub}.</p>', it.en.body.at(-1)];
  const html = renderArticle(m, 'en', i);
  const r = it.en.body[1].references[1];
  const a = html.match(/<a class="src"[^>]*>Kiro<\/a>/)?.[0] || '';
  assert.ok(a.includes(`href="${r.url}"`), `href attendu : ${a}`);
  assert.ok(a.includes(`title="${r.publisher} — ${r.title}`), `title attendu : ${a}`);
  assert.match(a, /rel="noopener noreferrer" target="_blank"/);
  assert.doesNotMatch(html, /\{ref:/);
});

test('aucun article rendu ne porte de « [n] » dans le corps, et chaque lien source a un title', () => {
  for (const it of model().items) for (const lang of ['en', 'fr']) {
    const html = fs.readFileSync(path.join(root, lang === 'fr' ? 'fr' : '', `news/${it.slug}.html`), 'utf8');
    const start = html.indexOf('<div class="article-body"');
    const end = html.indexOf('<ol class="references"');
    const body = html.slice(start, end > 0 ? end : undefined).replace(/<pre[\s\S]*?<\/pre>/g, '');
    assert.doesNotMatch(body, /\[\d+\]/, `${it.slug} ${lang}: [n] dans le corps`);
    for (const a of body.match(/<a class="src"[^>]*>/g) || []) assert.match(a, /\stitle="[^"]+"/, `${it.slug} ${lang}: lien source sans title`);
  }
});

test('les références de source-hierarchy sont rendues : liste en fin d’article, liens https sûrs, au moins 8 sources liées depuis le texte', () => {
  for (const lang of ['en', 'fr']) {
    const html = fs.readFileSync(path.join(root, lang === 'fr' ? 'fr' : '', 'news/source-hierarchy.html'), 'utf8');
    const items = html.match(/<li id="ref-\d+">/g) || [];
    assert.ok(items.length >= 10, `${lang}: ${items.length} références`);
    for (const a of html.match(/<li id="ref-\d+">.*?<\/li>/gs) || []) assert.match(a, /<a href="https:\/\/[^"]+" rel="noopener noreferrer" target="_blank">/);
    const linked = new Set([...html.matchAll(/<a class="src" href="([^"]+)"/g)].map((x) => x[1]));
    assert.ok(linked.size >= 8, `${lang}: ${linked.size} sources liées dans le texte`);
  }
});

test('CSS : aucune mise en page ne colle un intertitre du corps à son texte (margin-bottom 0 interdit, h2 ≥ .7em)', () => {
  const css = ['assets/css/inner.css', 'assets/css/news-layouts.css'].map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  let checked = 0;
  for (const rule of css.match(/[^{}]*\bh2\b[^{}]*\{[^}]*\}/g) || []) {
    if (!/article-body/.test(rule) || /\+\s*\*|\+\s*p\b|::before|news-card|kicker/.test(rule)) continue;
    const mb = rule.match(/margin-bottom:\s*([^;]+)/) || rule.match(/margin:\s*(?:\S+\s+){2}(\S+?);?(?:\s+\S+)?;/);
    if (!mb) continue;
    checked++;
    const v = mb[1].trim().replace(/;$/, '');
    assert.notEqual(v, '0', `h2 sans respiration : ${rule.trim().slice(0, 80)}`);
    const em = v.match(/^([\d.]+)em$/);
    if (em) assert.ok(Number(em[1]) >= 0.7, `h2 margin-bottom ${v} < .7em : ${rule.trim().slice(0, 80)}`);
  }
  assert.ok(checked >= 2, `${checked} règles h2 contrôlées`);
  assert.match(css, /\.article-body h3 \{[^}]*margin:\s*[\d.]+em 0 (\.[5-9]|[1-9])/);
  assert.match(css, /\.article-body p \{[^}]*line-height:\s*1\.(6[5-9]|[7-9])/);
  assert.match(css, /\.article-body a\.src:focus-visible/);
});

test('validation et rendu du schéma quadrant (deux axes, cases, bande)', () => {
  const m = model();
  const c = cloneModel(m);
  c.diagrams['truth-quadrant'].axes.x.left = { en: 'x' };
  c.diagrams['truth-quadrant'].nodes[0].cell = 'milieu';
  const errors = errorsOf(c);
  assert.match(errors, /axes\.x\.left EN\/FR requis/);
  assert.match(errors, /cell doit valoir tl \| tr \| bl \| br \| band/);
  const html = fs.readFileSync(path.join(root, 'news/source-hierarchy.html'), 'utf8');
  assert.match(html, /dg-type-quadrant/);
  assert.match(html, /Greenfield/);
});
