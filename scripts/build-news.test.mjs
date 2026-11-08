// Tests du générateur d'actualités. Lancer : node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll, validate, formatDate } from './build-news.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = () => JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));

test('formatDate : anglais et français', () => {
  assert.equal(formatDate('2026-10-28', 'en'), '28 October 2026');
  assert.equal(formatDate('2026-10-28', 'fr'), '28 octobre 2026');
  assert.equal(formatDate('2026-11-01', 'fr'), '1er novembre 2026');
});

test('la source actuelle est valide', () => {
  assert.deepEqual(validate(data(), root), []);
});

test('validation : slug en double, date invalide, image absente, bloc de langue manquant', () => {
  const d = clone(data());
  d.items[1].slug = d.items[0].slug;
  d.items[2].date = '2026-02-31';
  d.items[3].image.src = 'assets/images/nope.webp';
  delete d.items[0].fr;
  const errors = validate(d, root).join('\n');
  assert.match(errors, /slug en double/);
  assert.match(errors, /date AAAA-MM-JJ invalide/);
  assert.match(errors, /image introuvable/);
  assert.match(errors, /bloc "fr" manquant/);
});

test('validation : aucune rubrique « Limites » (intertitre ou encadré), en EN comme en FR', () => {
  const d = clone(data());
  d.items[0].en.body = [{ h2: 'Limits' }, '<p>x</p>'];
  d.items[0].fr.body = [{ callout: 'x', title: 'Limites' }, '<p>x</p>'];
  const errors = validate(d, root).join('\n');
  assert.match(errors, /intertitre « Limites » interdit/);
  assert.match(errors, /encadré « Limites » interdit/);
  // la source réelle n'en contient aucune
  const real = JSON.stringify(data());
  assert.doesNotMatch(real, /"h2":"(Limits|Limites)"/);
});

test('validation : lien local cassé, balises déséquilibrées, résumé trop long', () => {
  const d = clone(data());
  d.items[0].en.body = ['<p>Voir <a href="nexiste-pas.html">ici</a>.</p>'];
  d.items[0].fr.body = ['<p>Texte non fermé'];
  d.items[1].en.summary = 'x'.repeat(221);
  const errors = validate(d, root).join('\n');
  assert.match(errors, /lien local introuvable/);
  assert.match(errors, /balises du corps non équilibrées/);
  assert.match(errors, /summary trop long/);
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
  const latest = [...data().items].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  for (const home of ['index.html', 'fr/index.html']) {
    assert.ok(res.files.get(home).includes(`href="news/${latest.slug}.html"`), home);
  }
});

test('le sitemap liste les deux langues de chaque page de l’actualité', () => {
  const sm = buildAll(root).files.get('sitemap.xml');
  for (const it of data().items) {
    assert.ok(sm.includes(`<loc>https://www.ai-kido.fr/news/${it.slug}.html</loc>`));
    assert.ok(sm.includes(`<loc>https://www.ai-kido.fr/fr/news/${it.slug}.html</loc>`));
  }
});

test('les images FR des articles remontent de deux niveaux', () => {
  const res = buildAll(root);
  const it = data().items[0];
  assert.ok(res.files.get(`fr/news/${it.slug}.html`).includes(`src="../../${it.image.src}"`));
  assert.ok(res.files.get(`news/${it.slug}.html`).includes(`src="../${it.image.src}"`));
});
