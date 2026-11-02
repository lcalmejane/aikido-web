# Design charter: aikido-web

> **Version**: 1.1 | **Date**: 2026-11-01 | **Statut**: Active

<!-- design-charter:begin -->

## Identity

- Client: AI-KIDO
- Message: Apprendre avec AI-KIDO, c'est entrer dans un dojo calme et lumineux où la connaissance se transmet par le geste et par la méthode.
- Audience: Développeurs et équipes qui découvrent AI-KIDO sur le site web : curieux, pressés, besoin de clarté et de confiance dès la première visite.
- Uses: web banner, hero de page d'accueil, illustrations de sections
- Format: 16:9 | Realism: photo
- Keywords: dojo, bois, lumière dorée, Japon, connaissance, geste, transmission, profondeur, allégorie

## Palette

| Role | Colour | Hex |
|---|---|---|
| primary | navy blue | `#0e386e` |
| accent | red | `#b85c38` |
| secondary | beige | `#c9a57b` |
| secondary | beige | `#e8c77a` |
| neutral | off-white | `#f6efe0` |
| secondary | beige | `#f8dbb2` |
| secondary | beige | `#a8b89a` |
| secondary | pink | `#e9b8b8` |
| secondary | charcoal | `#3d4e6b` |
| secondary | grey | `#727058` |
| neutral | black | `#111524` |

## Typography

Fonts: -

## Render style

- Style: `photo-depth-layers` (photo)
- Look: Layered photograph: sharp close-up object in the foreground, wide scene with strong depth behind
- Negative prompt: illustration, drawing, cartoon, anime, 3d render, painting, text, letters, watermark, logo, kanji, people, faces, hands, oversaturated, neon, harsh flash, blurry, deformed, weapons, robots, cyberpunk, stereotyped geisha, red torii cliche, face close-up

## Rules

- Forbidden: text, letters, logo, kanji, weapons, robots, neon, cyberpunk, stereotyped geisha, red torii cliche, face close-up
- Constraints: no text in the image, palette: all colours kept from the first board (washi cream, light wood, sunrise gold, matcha green, sakura pink, indigo) plus navy blue, sand beige, olive grey, ink black and brick red #B85C38 (complement of the blue), photographic realism with several shot scales: wide dojo, close-up of hands, sharp foreground with a deep wide background, natural hands with five fingers, no face, no identifiable person, leave empty space on one side for a title, calm and welcoming mood

## Validation

- Active, validated by Laurent on 2026-11-01 (mood board `2026-11-01-aikido-web-v2`).

## Decision log

| Date | By | Decision |
|---|---|---|
| 2026-11-01 | Laurent | Charter created from the validated mood board direction C (photo-depth-layers). |

## Machine-readable

Source of truth for the tools. Edit it, then run `charter render` to refresh the text above.

```json
{
  "schema": 1,
  "project": "aikido-web",
  "client": "AI-KIDO",
  "language": "fr",
  "status": "active",
  "revision": 1,
  "updated": "2026-11-01",
  "message": "Apprendre avec AI-KIDO, c'est entrer dans un dojo calme et lumineux où la connaissance se transmet par le geste et par la méthode.",
  "audience": "Développeurs et équipes qui découvrent AI-KIDO sur le site web : curieux, pressés, besoin de clarté et de confiance dès la première visite.",
  "use_cases": [
    "web banner",
    "hero de page d'accueil",
    "illustrations de sections"
  ],
  "realism": "photo",
  "format": {
    "ratio": "16:9"
  },
  "keywords": [
    "dojo",
    "bois",
    "lumière dorée",
    "Japon",
    "connaissance",
    "geste",
    "transmission",
    "profondeur",
    "allégorie"
  ],
  "brand": {
    "palette": [
      {
        "hex": "#0e386e",
        "name": "navy blue",
        "role": "primary"
      },
      {
        "hex": "#b85c38",
        "name": "red",
        "role": "accent"
      },
      {
        "hex": "#c9a57b",
        "name": "beige",
        "role": "secondary"
      },
      {
        "hex": "#e8c77a",
        "name": "beige",
        "role": "secondary"
      },
      {
        "hex": "#f6efe0",
        "name": "off-white",
        "role": "neutral"
      },
      {
        "hex": "#f8dbb2",
        "name": "beige",
        "role": "secondary"
      },
      {
        "hex": "#a8b89a",
        "name": "beige",
        "role": "secondary"
      },
      {
        "hex": "#e9b8b8",
        "name": "pink",
        "role": "secondary"
      },
      {
        "hex": "#3d4e6b",
        "name": "charcoal",
        "role": "secondary"
      },
      {
        "hex": "#727058",
        "name": "grey",
        "role": "secondary"
      },
      {
        "hex": "#111524",
        "name": "black",
        "role": "neutral"
      }
    ],
    "fonts": [],
    "forbidden": [
      "text",
      "letters",
      "logo",
      "kanji",
      "weapons",
      "robots",
      "neon",
      "cyberpunk",
      "stereotyped geisha",
      "red torii cliche",
      "face close-up"
    ]
  },
  "style": {
    "name": "photo-depth-layers",
    "category": "photo",
    "description": "Layered photograph: sharp close-up object in the foreground, wide scene with strong depth behind",
    "negative": "illustration, drawing, cartoon, anime, 3d render, painting, text, letters, watermark, logo, kanji, people, faces, hands, oversaturated, neon, harsh flash, blurry, deformed, weapons, robots, cyberpunk, stereotyped geisha, red torii cliche, face close-up",
    "params": {
      "steps": 24,
      "guidance": 4
    }
  },
  "style_candidates": [],
  "constraints": [
    "no text in the image",
    "palette: all colours kept from the first board (washi cream, light wood, sunrise gold, matcha green, sakura pink, indigo) plus navy blue, sand beige, olive grey, ink black and brick red #B85C38 (complement of the blue)",
    "photographic realism with several shot scales: wide dojo, close-up of hands, sharp foreground with a deep wide background",
    "natural hands with five fingers, no face, no identifiable person",
    "leave empty space on one side for a title",
    "calm and welcoming mood"
  ],
  "sources": {
    "moodboard": "2026-11-01-aikido-web-v2",
    "brief": true,
    "scan": false
  },
  "validated_by": "Laurent",
  "validated_at": "2026-11-01T17:48:19.965Z",
  "decisions": [
    {
      "at": "2026-11-01T17:49:37.045Z",
      "by": "Laurent",
      "note": "Charter created from the validated mood board direction C (photo-depth-layers)."
    }
  ]
}
```

<!-- design-charter:end -->


## Notes

Free notes. The tools never rewrite anything below the end marker.
