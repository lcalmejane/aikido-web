# Kido — fiche personnage (mascotte AI-KIDO)

> Source de vérité pour décrire et générer Kido. Le bloc canonique est figé : on ne le reformule jamais, on change seulement la scène. Les proportions viennent d'une **mesure** sur l'image de référence, pas d'une estimation (méthode : [`character-design.md`](../../../../aikido-skills/skills/local-designer/references/character-design.md)).

## Identité

Kido est un petit robot ami, en tenue d'aikido crème. Il est curieux, calme et attentif. Il lit, apprend, et accompagne le pratiquant dans le dojo. Il n'a pas de bouche : toute son expression passe par ses deux yeux, son attitude et ses mains.

## Références

`references/` contient les deux images d'origine (robot debout dans le dojo, robot qui lit). Elles priment sur toute description écrite : en cas de doute, on mesure à nouveau sur l'image.

## Proportions (mesurées sur la référence)

Unité : la hauteur de la tête. Précision d'environ ±5 %, la référence a un peu de perspective.

| Mesure | Valeur |
|---|---|
| Hauteur totale | **3,5 têtes** |
| Tête | 28 % de la hauteur, un peu plus large que haute |
| Menton → ceinture | 0,7 tête |
| Ceinture → ourlet du pantalon | 1,3 tête |
| Largeur du pantalon | 1,5 tête (1,3 fois la largeur de la tête) |
| Chevilles et chaussures | 0,5 tête |
| Bras | courts, ils finissent à hauteur des hanches |
| Avant-bras | bloc massif, aussi large que long |
| Main | environ la moitié de l'avant-bras |

Une version antérieure du bloc disait « la tête fait la moitié de la hauteur » : c'était faux et donnait un robot trop tête. La valeur mesurée est 28 %.

## Traits qui ne changent jamais

| Élément | Description |
|---|---|
| Tête | Dôme sphérique lisse, blanc nacré, sommet nu |
| Visage | Une large visière noire brillante, lisse, avec **deux disques cyan pleins et lumineux** pour yeux, rien d'autre |
| Côtés | Un petit écouteur rond blanc bordé d'un fin liseré noir, de chaque côté de la tête |
| Cou | Court cou fin, une bande de métal noir étroite |
| Tenue | Keikogi crème à manches courtes et col croisé large, ceinture crème nouée avec un nœud rond en forme de bille et deux pans courts, pantalon ballon très ample à gros plis |
| Articulations | **Mécaniques, en métal, fines et petites** : une bande noire étroite (large comme un doigt) avec un minuscule boulon argenté. Épaules, coudes, poignets, chevilles. Bien plus petites que les blocs d'avant-bras et les chaussures. Jamais du tissu ni du tricot, jamais de gros anneaux empilés (ils donnent des boudins noirs) |
| Bras | De l'épaule vers la main : manche courte, coude en bande de métal noir fine avec boulon, **gros bloc d'avant-bras blanc cassé rigide**, poignet en bande noire fine, petite main mécanique |
| Mains | **Mécaniques et rigides** : paume crème, **trois doigts séparés** en forme de gélule. Ni moufle, ni gant, ni main arrondie |
| Pieds | Chaussures blanches arrondies à bride, semelle grise fine, cheville en bande de métal noir fine au-dessus |
| Palette | Blanc nacré, crème, cyan lumineux (yeux), noir (visière et articulations), bois chaud en décor |

## Fiche de mesures et plan (norme model sheet)

Le texte seul donne un corps différent à chaque image : mesuré, le même bloc donnait 1,63 tête de large aux épaules sur la vue de face et 2,0 sur une autre. La norme des studios d'animation est la **model sheet** : le personnage dessiné une fois, avec des proportions mesurées en unités de tête, puis chaque image est contrôlée contre ce dessin.

| Fichier | Rôle |
|---|---|
| [`model-sheet.json`](model-sheet.json) | La fiche : formes simples placées en unités de tête, lues sur la référence avec une grille. C'est la source de vérité des proportions |
| `plans/plan-front.png`, `plan-back.png`, `plan-side.png` | Plans à plat tirés de la fiche, fond gris-bleu. Ce sont les images de départ de la génération |
| `render/front.webp`, `back.webp`, `side.webp` | Rendus finis, générés depuis les plans, tous `on-model` |

Processus (détail et chiffres : [`character-design.md`](../../../../aikido-skills/skills/local-designer/references/character-design.md), section 5) :

```bash
CLI=aikido-skills/skills/local-designer/scripts/local-designer.mjs
S=aikido-web/design/characters/kido/model-sheet.json
node $CLI character check $S
node $CLI character plan $S --view front --out plans/plan-front.png
node $CLI generate --style kido-mascot --prompt "front view, facing the camera, plain mid blue-grey background" \
  --init plans/plan-front.png --strength 0.75 --width 512 --height 512 --seed 42 --out render/front.png
node $CLI character audit $S render/front.png --view front
```

La force `0.75` est le réglage qui compte : `0.55` reste un dessin plat, `0.75` donne un rendu 3D qui garde la silhouette du plan. Le moteur n'accepte qu'**une image d'entrée** : la référence sert à mesurer, le plan porte la forme, et le premier rendu validé sert de cible aux suivants. La vue trois-quarts n'a pas de plan, on ne l'audite pas contre la face.

## Bloc canonique (à copier tel quel)

Le style de projet `kido-mascot` ([`design/styles/kido-mascot.json`](../../styles/kido-mascot.json)) contient ce bloc et l'injecte dans chaque génération. Ne décris donc que la scène :

```bash
node aikido-skills/skills/local-designer/scripts/local-designer.mjs generate \
  --style kido-mascot --model qwen_image_2512_bf16_i8x.ckpt \
  --prompt "reading a red book in a wooden dojo, warm morning light" \
  --width 512 --height 512 --steps 16 --guidance 4 --seed 42 \
  --out design/characters/kido/scenes/lecture.png --webp --sidecar
```

Le texte du bloc est dans le champ `template` du fichier JSON (en anglais, c'est la langue des modèles). Il commence par les **proportions chiffrées**, puis décrit la tête, le visage, le cou, la tenue, les articulations, les bras de l'épaule vers la main et les pieds.

**Format : 512 × 512, généré à la taille finale.** On ne génère pas en grand pour réduire ensuite, ni en petit pour agrandir : le rendu change à chaque redimensionnement et les détails mécaniques (boulons, doigts) se perdent. Un carré 512 est aussi trois à quatre fois plus rapide qu'un 1024. Pour une taille plus grande, on régénère à cette taille.

## Règles pour que Kido reste le même

1. **Jamais de négation dans le bloc.** « no antenna », « no smile » font apparaître une antenne et un sourire. On décrit ce qui est là (« sommet nu », « visière lisse »). Le prompt négatif du style est séparé.
2. **Les proportions sont chiffrées, en têtes, et en premier.** Un modèle suit « 3.5 heads tall » mieux que « chibi » ou « petit ».
3. **Décrire un membre dans l'ordre, de l'épaule vers la main.** Sans cet ordre, l'avant-bras et la main fusionnent en une moufle géante.
3 bis. **Choisir les mots d'après la matière réelle.** « ribbed » (côtelé) et « mitten-like » (en moufle) ont donné du tricot de coton et des mains arrondies : le modèle prend les mots au pied de la lettre. Écrire « plaques de métal noir empilées, boulons argentés » et « trois doigts rigides en forme de gélule » donne des articulations et des mains mécaniques.
4. **Pas de prompt négatif sur FLUX schnell.** Ce modèle l'ignore. Le négatif du style ne sert qu'avec Qwen.
5. **Modèle recommandé : Qwen Image 2512.** Il suit mieux les descriptions longues que FLUX schnell, mais prend environ 1 à 2 minutes par image à 512 px.
6. **Une seule scène par prompt, un seul personnage.**
7. **Garder la graine 42 pour une pose proche de la planche**, en changer pour varier.
8. **Après chaque génération, vérifier en recadrant** les mains et les coudes **et en les comparant à la référence** : yeux en disques pleins, visière sans bouche, sommet sans antenne, articulations **en métal** (pas en tissu), mains mécaniques à trois doigts, avant-bras massifs, tête à environ 28 % de la hauteur. Ne jamais valider d'après une impression d'ensemble.

## Planche de référence

Générée avec Qwen Image 2512, graine 42, en 512 × 512 (`face` : 256 × 256), dans `sheet/`, avec le bloc à joints fins. Chaque image a un fichier `.json` (sidecar) avec le prompt exact et les paramètres : on garde le WebP (8 à 23 Ko) et le `.json`, les PNG d'origine se régénèrent à partir du sidecar.

`front`, `side` et `back` sont générées **depuis les plans** de `plans/` (force 0,75) et auditées `on-model` contre [`model-sheet.json`](model-sheet.json). `three-quarter`, `reading` et `stance` n'ont pas de plan : elles viennent du texte seul, avec le même bloc et la même graine, et ne sont pas auditables.

| Image | Contenu |
|---|---|
| `front` | Face, plein pied, fond gris-bleu (la référence de la planche). Depuis le plan, `on-model` |
| `three-quarter` | Trois-quarts gauche. Texte seul, fond bleu plus sombre que les autres vues |
| `side` | Profil strict, visière à droite. Depuis le plan, `on-model` |
| `back` | Dos, dôme lisse sans visière. Depuis le plan, `on-model` |
| `face` | Portrait tête et épaules, recadrage 1:1 de `front` |
| `reading` | Lit un livre rouge dans le dojo. Texte seul |
| `stance` | Garde d'aikido dans le dojo. Texte seul |

Mesures de l'audit (largeur maximale en têtes, attendu → mesuré) : épaules et bras 1,99 → 1,96 (face), 1,97 (dos), 0,80 (profil, attendu 0,76) ; pantalon 1,78 → 1,82 (face), 1,86 (dos). Les pieds sont affichés mais ne comptent pas dans le verdict.

**À corriger sur `reading` et `stance`.** Les mains y ont quatre ou cinq doigts au lieu de trois : une pose avec les mains en avant ramène les doigts que le plan debout contenait. Le bloc dit « trois doigts », la scène l'emporte. Piste : un plan par pose (la fiche accepte `view` et des parties dédiées), ou recadrer et régénérer la main. Le fond de `three-quarter` est aussi à harmoniser (un plan trois-quarts n'existe pas).

**Salut (`bow`) : non obtenu, retiré de la planche.** Deux essais à 512 px : l'un donne un Kido accroupi de face, l'autre un Kido debout de face, bras le long du corps. Le bloc fixe décrit un personnage de face et la scène ne le surcharge pas. Piste à tester, comme pour le dos et le profil : remplacer dans le bloc les phrases qui imposent la face (visière, bras « le long du corps ») par une description du buste penché, vu de profil.

**Vue de dos et profil.** Le bloc décrit le visage, et ce texte l'emporte sur « vue de dos » : le robot reste de face, ou garde un œil sur le côté. Pour `back`, le plan de dos fixe la forme, et le prompt dit en tête ce qui est absent (« dôme lisse, sans visière, sans yeux, sans lumière ») avec les mots visière, yeux et lumière dans le prompt négatif. Pour `side`, le plan de profil suffit, la visière est dessinée dedans.

**Portrait.** En demandant un gros plan, le modèle grossit la tête sans réduire le corps, ou revient à un plein pied. `face` est donc **recadré dans `front`** : 256 × 256 pris tels quels, sans agrandissement ni img2img. Les proportions de la tête sont celles de `front` par construction, et rien n'est réinterprété.

## Limites actuelles

- **Le moteur n'utilise pas les images de référence.** Elles ont servi à mesurer et à écrire le bloc. Une génération guidée par l'image (img2img avec FLUX.2 klein) reste à tester pour la fidélité.
- Sans entraînement (LoRA), la cohérence repose sur le bloc de texte. Elle est bonne sur les proportions, la tête et la matière des articulations. Les détails fins (boulons, plis du pantalon) varient d'une image à l'autre.
- **Écarts connus avec la référence :**
  - l'avant-bras est plus fin et plus segmenté que le gros bloc arrondi de la référence ;
  - les mains ont souvent 4 ou 5 doigts au lieu de 3 ;
  - la ceinture et le keikogi sortent un peu plus clairs ;
  - le museau noir sous les yeux, visible sur la référence, n'est pas reproduit (il contredirait la règle « rien d'autre » sur la visière).
