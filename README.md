# Dev Case Studies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Varnasr/dev-case-studies/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/Varnasr/dev-case-studies)](https://github.com/Varnasr/dev-case-studies/issues)
[![CI](https://github.com/Varnasr/dev-case-studies/actions/workflows/ci.yml/badge.svg)](https://github.com/Varnasr/dev-case-studies/actions/workflows/ci.yml)
[![Part of ImpactMojo](https://img.shields.io/badge/Part%20of-ImpactMojo-orange)](https://www.impactmojo.in)

**204 real development case studies from 117 countries — searchable, filterable, and fully cited.**

Part of the [ImpactMojo Learning Platform](https://impactmojo.in) and the [OpenStacks for Change](https://github.com/Varnasr/OpenStacks-for-Change) initiative.

---

## About

Dev Case Studies is a practitioner-oriented library of real-world development case studies drawn from across the Global South and beyond. Each case documents a programme, intervention, or policy with evidence of outcomes — positive, negative, or mixed — and ties every claim back to a citable source.

The library is designed to complement theory with evidence: to help practitioners, students, and researchers understand what development work actually looks like in practice. Read more on the [About & Methodology](about.html) page.

---

## Features

| Feature | Description |
|---------|-------------|
| **204 case studies** | Spanning 117 countries across the Global South and beyond, with ~870 cited references. |
| **Search & filter** | Full-text search plus faceted filters by topic, region, and decade — with an experimental research-question matcher. |
| **Insights dashboard** | Live statistics on how the collection is distributed across topics, regions, and decades. Click a bar to filter. |
| **Evidence tiers** | Every study is auto-tagged *strong / moderate / emerging* based on reference count and causal-identification methods. |
| **Saved studies** | Bookmark cases to a personal reading list stored in your browser — no account required. |
| **Reading experience** | Reading-time estimates, a scroll progress bar, share links, and per-study Cornell notes you can export as Markdown. |
| **Related studies map** | A small literature map surfaces cases connected by shared topic or region. |
| **Light / dark / system theme** | Persisted theme with a three-way toggle. |
| **Fast & durable** | Zero runtime dependencies — static HTML, CSS, and vanilla JS. |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vanilla HTML / CSS / JavaScript | No-framework, no-runtime-dependency search and browse |
| Data | Per-study JSON (source of truth) | Case study content and metadata |
| Build | Zero-dependency Node (ESM) pipeline | Validates data and generates the card index, search index, stats, and sitemap |
| CI | GitHub Actions | Validates the schema, fails on data drift, and checks links |
| Hosting | GitHub Pages | Static site deployment |

---

## Project Structure

```
dev-case-studies/
├── index.html            # Library: search, filter, insights dashboard
├── study.html            # Individual case study view
├── about.html            # About & methodology
├── css/style.css         # Design system (light/dark)
├── js/app.js             # Search, filter, render, bookmarks, insights
├── scripts/
│   ├── build.mjs         # Validate studies + generate derived data
│   └── serve.mjs         # Zero-dependency local dev server
├── data/
│   ├── studies/          # ← source of truth: one JSON per case study
│   ├── master-list.json  # generated — card index (do not edit)
│   ├── search-index.json # generated — search index (do not edit)
│   ├── stats.json        # generated — dashboard statistics (do not edit)
│   └── README.md         # data model & pipeline docs
├── sitemap.xml           # generated
└── package.json          # npm scripts (build / validate / dev)
```

---

## Local Development

```bash
git clone https://github.com/Varnasr/dev-case-studies.git
cd dev-case-studies

npm run dev        # serve locally on http://localhost:8000
npm run build      # regenerate master-list, search index, stats, sitemap
npm run validate   # CI check: validate the data & fail if artefacts drift
```

No dependencies are installed — the build and dev server use only the Node standard library (Node ≥ 18).

The data model and the recognised study-content headings are documented in [`data/README.md`](data/README.md).

---

## Contributing

Contributions are welcome — additional case studies, corrections, or improved citations.

**To add a case study:**

1. Create `data/studies/<slug>.json` following the [data model](data/README.md). Include:
   - programme name, country, region, topic, and years of operation
   - a 200–400 word description with cited evidence of outcomes
   - at least two verifiable sources in a `## References` section
2. Run `npm run build` and commit the regenerated data files.
3. Open a pull request. CI (`npm run validate`) will fail if the generated data is out of sync.

---

## Part of the ImpactMojo Ecosystem

**Related repositories:**
- [ImpactMojo](https://github.com/Varnasr/ImpactMojo) — Main platform
- [development-discourses](https://github.com/Varnasr/development-discourses) — 500+ curated open-access research papers
- [ImpactLex](https://github.com/Varnasr/ImpactLex) — Development sector terminology dictionary

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Citation

```
Sri Raman, V. (2025). Dev Case Studies: 204 real development case studies from 117 countries [Dataset].
ImpactMojo. https://github.com/Varnasr/dev-case-studies
```
