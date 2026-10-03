# aikido-web

Site vitrine de la méthode [AI-KIDO](https://github.com/lcalmejane/aikido), publié avec GitHub Pages.

URL : https://lcalmejane.github.io/aikido-web/

## Structure

```
aikido-web/
├── index.html          # page d'accueil
├── 404.html
├── .nojekyll           # désactive Jekyll : site statique servi tel quel
├── assets/css/         # styles
└── workspace/          # IGNORÉ par Git : documentation et matière de travail
```

Le site est en HTML/CSS statique, sans étape de build.

## Répertoire de travail

Le dossier `workspace/` est dans le `.gitignore`. Il n'est jamais commité ni publié.
Il sert à déposer la documentation et la matière brute pour construire le site. Voir `workspace/README.md` (local).

## Développement local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Publication

Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`.
Chaque push sur `main` republie le site.
