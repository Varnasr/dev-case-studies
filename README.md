# Dev Case Studies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Varnasr/dev-case-studies/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/Varnasr/dev-case-studies)](https://github.com/Varnasr/dev-case-studies/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/Varnasr/dev-case-studies)](https://github.com/Varnasr/dev-case-studies/commits/main)
[![Part of ImpactMojo](https://img.shields.io/badge/Part%20of-ImpactMojo-orange)](https://www.impactmojo.in)

**200 real development case studies from 117 countries — searchable, filterable, and fully cited.**

Part of the [ImpactMojo Learning Platform](https://impactmojo.in) and the [OpenStacks for Change](https://github.com/Varnasr/OpenStacks-for-Change) initiative.

---

## About

Dev Case Studies is a practitioner-oriented library of real-world development case studies drawn from across the Global South and beyond. Each case study documents a programme, intervention, or policy with evidence of outcomes — positive, negative, or mixed.

The library is designed to complement theory with evidence: to help practitioners, students, and researchers understand what development work actually looks like in practice.

---

## Features

| Feature | Description |
|---------|-------------|
| **200 Case Studies** | Spanning 117 countries across the Global South and beyond |
| **Searchable** | Full-text search by keyword, country, programme name, or theme |
| **Filterable** | Narrow by region, sector, development outcome, and evidence type |
| **Fully Cited** | Every case includes verifiable sources, evaluation reports, and primary references |
| **Individual Case Pages** | Dedicated `study.html` views with full detail and citation links |
| **Zero Dependencies** | Vanilla HTML, CSS, and JavaScript — no build step, no framework |

---

## Sectors Covered

| Sector | Example Cases |
|--------|--------------|
| **Health & Nutrition** | BRAC Community Health Workers (Bangladesh), Progresa/Oportunidades (Mexico) |
| **Education** | Pratham's Teaching at the Right Level (India), Girls' education programmes (Niger) |
| **Gender & Women's Empowerment** | Self-help group models (India), Gender-responsive budgeting (Rwanda) |
| **Livelihoods & Labour** | Graduation programmes, youth employment schemes |
| **Agriculture** | Smallholder extension, climate-smart agriculture |
| **Social Protection** | Cash transfer programmes, universal basic income pilots |
| **Governance** | Community monitoring, social accountability mechanisms |
| **Climate & Environment** | Adaptation programmes, REDD+, urban resilience |
| **Digital Development** | Last-mile connectivity, digital financial services |

---

## Project Structure

```
dev-case-studies/
├── index.html          # Main library (search + filter interface)
├── study.html          # Individual case study view
├── data/               # Case study data files (JSON/CSV)
├── css/                # Stylesheets
├── js/                 # Search, filter, and render logic
├── CITATION.cff        # Citation metadata
├── LICENSE             # MIT License
└── README.md           # This file
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vanilla HTML / CSS / JavaScript | No-dependency search and browse |
| Data | JSON / CSV | Case study content and metadata |
| Hosting | GitHub Pages | Static site deployment |

---

## Local Development

```bash
git clone https://github.com/Varnasr/dev-case-studies.git
cd dev-case-studies
open index.html
# or
python3 -m http.server 8000
```

---

## Contributing

Contributions are welcome — additional case studies, corrections, or improved citations.

See the [issues tracker](https://github.com/Varnasr/dev-case-studies/issues) for open requests, or open a pull request directly.

**For each new case study, please provide:**
- Programme name, country, and years of operation
- Programme description (200–400 words)
- Evidence of outcomes (with citations)
- At least two verifiable sources

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
Sri Raman, V. (2025). Dev Case Studies: 200 real development case studies from 117 countries [Dataset].
ImpactMojo. https://github.com/Varnasr/dev-case-studies
```
