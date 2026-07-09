# Data Model & Build Pipeline

The library is **data-first**: every case study is a single JSON file in
`data/studies/`, and all other data files are **generated** from those sources
by the build pipeline. Never hand-edit the generated files.

## Source of truth — `data/studies/<slug>.json`

| Field       | Type   | Required | Notes |
|-------------|--------|----------|-------|
| `id`        | number | ✓ | Stable, unique. Controls default ordering. |
| `slug`      | string | ✓ | Unique, kebab-case. **Must equal the filename** (`<slug>.json`). |
| `title`     | string | ✓ | Display title. |
| `country`   | string | ✓ | Primary country (or `Global`). |
| `region`    | string | ✓ | One of the seven World-Bank-style regions. |
| `topic`     | string | ✓ | One of the ten topic labels. |
| `year`      | string | ✓ | e.g. `2007–present`, `1990s–2010`. |
| `summary`   | string | ✓ | 1–2 sentence card blurb (≥ 40 chars). |
| `keyData`   | array  | – | `{ "label", "value" }` pairs shown in the study sidebar. |
| `content`   | string | ✓ | Markdown body. Section headings drive the reader UI. |

### Recognised `content` section headings

The reader parses these headings to build the evidence card, references list,
and study framework:

- `## Results & Evidence` / `## Impact` / `## Outcomes` — mined for quantified findings.
- `## Key Lessons` / `## Lessons for Policymakers` — the "How to think about this" panel.
- `## References` / `## Sources` / `## Bibliography` — the citation list (drives the evidence tier).
- `## Further Reading` — supplementary reading list.
- `## Discussion Questions` — teaching prompts.

## Generated artefacts (do not edit)

| File | Produced by | Used by |
|------|-------------|---------|
| `data/master-list.json`  | `npm run build` | Card grid, filters, related studies. Enriched with `readingMinutes`, `words`, `refs`, `evidence`. |
| `data/search-index.json` | `npm run build` | (Reserved) lightweight client search index. |
| `data/stats.json`        | `npm run build` | The Insights dashboard on the home page. |
| `sitemap.xml`            | `npm run build` | Search-engine discovery (one URL per study). |

## Commands

```bash
npm run build      # regenerate all derived artefacts
npm run validate   # CI check: validate schema + fail if artefacts drift
npm run dev        # zero-dependency static server on :8000
```

Adding or editing a study is a two-step flow: edit the JSON in
`data/studies/`, then run `npm run build` and commit the regenerated files.
CI (`npm run validate`) fails the PR if you forget.
