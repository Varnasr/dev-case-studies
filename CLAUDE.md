# dev-case-studies

Shared engineering standard: @.claude/engineering-standards.md. It applies to all work in this repository. This file adds what is specific to the project, and wins where the two disagree.

Research library of 208 cited development case studies from across the Global
South. Static HTML, no framework, one generator script. Deployed to GitHub
Pages under `/dev-case-studies/`.

## Commands

```bash
npm run validate     # node scripts/build.mjs --check, run by CI
npm run build        # rewrites master-list.json, search-index.json, stats.json, sitemap.xml
npm run dev          # local server
```

There are **no dependencies**. `package.json` declares neither `dependencies`
nor `devDependencies`, so there is no lockfile to commit and `npm ci` has
nothing to install. That is deliberate, not an omission.

## One source, four derived files

`data/studies/*.json` is the only thing anyone edits. `scripts/build.mjs`
derives `data/master-list.json`, `data/search-index.json`, `data/stats.json`
and `sitemap.xml` from it, and `--check` fails if any of the four has drifted.
Verified on 2026-09-22: all 204 slugs agree across all four.

## Two templates, and the citation heading differs between them

189 studies head their citations `## References`. The 15 written to the later,
longer template head them `## Further Reading`, and that set is almost exactly
South Asia: six India studies, two Bangladesh, two Nepal, Pakistan, Sri Lanka,
Bhutan, the Maldives and a regional stunting study.

`countReferences()` matched `References|Sources|Bibliography` and not
`Further Reading`, so it returned **0** for all fifteen. They carry five full
academic citations each (Imbert and Papp in *AEJ: Applied* 2015, Dreze and
Khera in *World Development* 2017, Sukhtankar in the *India Policy Forum*, and
so on), so the library reported 867 references where it holds **942**.

The `--check` run printed `no parseable References section` for each of them,
which reads as a content gap and was a heading the regex did not know. The
distinction matters: acting on the warning as written would mean adding
citations to studies that already have them. No study carries both headings,
so widening the regex counts nothing twice.

**If you add a third template, add its heading to that regex.**

## The evidence tier is by study design

Until 2026-10-30 `evidenceTier()` returned `strong` when `refs >= 4`, and every
study carries four or five references, so it was `strong` on all of them. The
owner chose to score it by design instead, from the two signals
`evidenceSignals()` already computed:

| tier | rule | studies on 2026-10-30 |
|---|---|---|
| strong | cites experimental or quasi-experimental work **and** a systematic review or meta-analysis | 7 |
| moderate | cites one of the two | 59 |
| emerging | cites neither | 142 |

The signals are keyword matches over the study's text, so the tier says what
kind of evidence a study draws on, not how good it is, and `about.html` says so
in those words. "Emerging" does not mean the programme was never evaluated; it
means the study does not cite that work. Do not describe it as a quality score.

Each entry shows the tier in its meta line, with the matching signal in the
tooltip. The Evidence filter still filters on the two signals directly.

## The interface on a phone

Three things were measured at 390x844 on 2026-09-23 and fixed:

- **The site had no name.** `.site-logo span:last-child { display: none }` at
  480px left a blue square in the corner and nothing else. The wordmark
  shortens to "Dev" instead, which the markup carries in its own span.
- **The welcome panel filled the whole first screen.** Over 600px of
  explanation before a single study, so a visitor landed on a help panel rather
  than on a library. Its feature grid is hidden and its description clamps to
  three lines below 700px; the panel is still dismissible and the text is still
  there. Two study cards are now above the fold.
- **The card footer put "Read study" and "5 sources" each across two lines**,
  because a link and three metadata items were competing for one row. The link
  takes its own line below 460px.

## The redesign of 21 November 2026

The owner called the design horrible and said the theme switcher did not work.
All three pages were rebuilt on one system: `css/style.css` was rewritten, the
header and the index body were rewritten in the HTML, and the card and study
templates in `js/app.js` were rewritten. Data, slugs, URLs, canonical and Open
Graph tags were left alone.

- **The look.** Source Serif 4 for titles and running text, Inter for labels and
  controls. A 2px ink rule opens each part of a page and a 1px hairline divides
  the items in it. There are no shadows and no rounded cards. The index opens
  with a masthead line and the three counts as figures, then search, then the
  studies as ruled entries: topic label, title, country and period, summary and
  one meta line (evidence tier, sources, read time). The filters are a plain
  list in a left rail from 960px and a drawer behind the Filters button below
  that. The button carries a count of the filters that are on.
- **The theme control is one button** (`#theme-toggle`) that steps through
  device setting, light and dark. `initTheme()` in `js/app.js` runs it on every
  page; the inline script in each `<head>` still sets `data-theme` before first
  paint and now also sets `data-theme-mode`, which the stylesheet uses to show
  the right icon. The key is still `imx_theme`, and no key means device setting.
  The old control was three icons of 26 to 28px in a tinted box with the larger "Aa"
  reading-font button pushed into the same box, so it read as four theme
  buttons of which the biggest did not change the theme. On `study.html` and
  `about.html` the header was a narrow `.container`, so at 1440px wide the
  navigation wrapped under the logo and the box sat on top of the breadcrumb.
- **The reading-font button** goes into `.header-tools`, which carries
  `data-dyslexia-slot`. `--dys-min-size` and `--dys-radius` in `:root` make it
  the same 40px square-cornered button as the theme control.
- **Ink and fill are separate tokens.** `--accent` and the ten `--topic-*`
  colours are ink on paper and change with the theme. A filled control is always
  `--fill` with `--on-fill`. Do not put white on `--accent`. The topic colours
  are now a label colour with a small square and no tinted chip behind it.

Traps met on the way, each found by running the page:

- **`escapeHtml()` did not escape quotation marks**, and it is used inside
  attribute values. A citation that opens a quotation ended its `data-citation`
  attribute at that mark, so the copy button copied `Jack, W. and Suri, T.
  (2014). ` and nothing after it. It escapes both kinds of quote now.
- **A heading with `&` in it had a dead Contents link.** `renderMarkdown()`
  escapes `&` to `&amp;` before it builds the heading id, so "Context &
  background" got the id `context-amp-background` while `extractTOC()` linked
  to `context-background`. The Contents list also linked to the References and
  Discussion sections that the page removes from the body.
- **The 15 studies on the longer template showed "0 cited sources"** and no
  reference count, because the page counted `## References` only. Their
  `## Further Reading` list is now shown once as the citation list and counted.
  Their lessons are bold paragraphs, not list items, and were printed as one
  item with raw asterisks; `parseLessons()` splits on those paragraphs now.
- **Sorting reordered the master list itself**, so choosing "Default order"
  after any other sort did nothing. `getFilteredStudies()` sorts a copy.
- **"Clear all" left the Evidence filter buttons looking selected.**
  `syncChips()` now sets every filter button from the four sets in one place.
- **The masthead figures set the width of the page at 320px.** A grid item's
  default `min-width: auto` let the three figures push the page 8px wide. The
  text column and the figures both carry `min-width: 0`.
- **The first study on a phone.** At 390x844 the first entry started at 376px
  before and starts at 359px now, with search on the first screen. The lede is
  hidden below 700px and the how-to note is one line there to keep it so.
  Measure again after adding anything above the list.

Checked in headless Chromium at 320, 360, 390, 768, 1024, 1280 and 1440 in both
themes on all three pages: no console errors and no sideways scroll. axe-core
4.x at 390 and 1280 in both themes reported no violations. The lowest measured
text contrast was 5.97:1 in the light theme (the search placeholder) and 7.15:1
in the dark theme (the Social Protection label). The check script was kept in
the session scratchpad and is not in the repository.

## Watch out for

- **The sitemap uses query strings.** Every study is
  `/dev-case-studies/study.html?slug=<slug>`, rendered client side from
  `data/studies/<slug>.json`. A script comparing sitemap paths against files on
  disk will report all 204 as missing pages; compare slugs.
- **The GitHub Pages path prefix is in the sitemap** and not in the repository
  layout, for the same reason.
- **Counts stated in prose**: `README.md` says 208 case studies, which is
  correct today. Nothing checks it.

## Testing

`.github/workflows/ci.yml` runs `npm run validate` on every push and pull
request. The lychee link check moved to its own `link-check.yml` on
2026-09-22: it carried `fail: false` on pull requests, so a contributor got a
result they could neither act on nor be blocked by, and it shared a run with
the data validation, where a job cancelled by its own timeout cancels the whole
run and would have taken the validation down with it. On the daily schedule it
fails, because external link rot needs no commit to happen.
