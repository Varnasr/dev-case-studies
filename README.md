# Dev Case Studies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Varnasr/dev-case-studies/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/Varnasr/dev-case-studies)](https://github.com/Varnasr/dev-case-studies/issues)

**200 real development case studies from 117 countries** — searchable, filterable, and fully cited.

Part of the [ImpactMojo Learning Platform](https://impactmojo.in) and the [OpenStacks for Change](https://github.com/Varnasr) initiative.

## Features

- **200 case studies** spanning 117 countries across the Global South and beyond
- **Searchable** — find case studies by keyword, country, or theme
- **Filterable** — narrow results by region, sector, or development outcome
- **Fully cited** — every case study includes verifiable sources and references
- **Zero dependencies** — built with vanilla HTML, CSS, and JavaScript

## Tech Stack

| Language   | Share  |
|------------|--------|
| JavaScript | 49.6%  |
| CSS        | 36.2%  |
| HTML       | 14.2%  |

No build tools, no frameworks — just clean, standards-based web technologies.

## Getting Started

### Prerequisites

A modern web browser and one of the following local servers:

- Python 3.x, or
- Node.js / npm

### Local Setup

Clone the repository and start a local server:

```bash
git clone https://github.com/Varnasr/dev-case-studies.git
cd dev-case-studies

# Option 1: Python
python -m http.server 8000

# Option 2: npx
npx serve
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Project Structure

```
dev-case-studies/
├── index.html          # Main entry point
├── data/               # Case study data (JSON)
├── js/                 # Search, filter, and rendering logic
├── css/                # Styles and responsive layout
├── .github/            # Community health files
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   └── SECURITY.md
├── LICENSE
└── CITATION.cff
```

## Contributing

Contributions are welcome! Whether you want to add a case study, fix a bug, or improve the interface, please read our [Contributing Guidelines](.github/CONTRIBUTING.md) before getting started.

For case study corrections or content issues, please use the [Content Issue](https://github.com/Varnasr/dev-case-studies/issues/new?template=content_issue.md) template.

## Citation

If you use this resource in your research or teaching, please cite it using the information in [CITATION.cff](CITATION.cff).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Built with purpose by [@Varnasr](https://github.com/Varnasr) | [ImpactMojo](https://impactmojo.in)
