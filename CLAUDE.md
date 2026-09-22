# dev-case-studies

Research library of 204 cited development case studies from across the Global
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

## The evidence tier no longer distinguishes anything

`evidenceTier()` returns `strong` when `refs >= 4`. Every one of the 204
studies has four or five references, so after the reference fix the function
returns `strong` for all 204, and the `moderate` and `emerging` branches are
unreachable.

Before the fix, eight studies read `emerging`. All eight were among the fifteen
whose references were not being counted. **The tier was reporting the parser
bug rather than the evidence**, which is worth knowing before anyone reads
meaning into the field.

This is left as it is on purpose. What counts as strong evidence is an
editorial judgement about the library, not a bug to patch: the honest options
are to raise the threshold, weight the `hasRCT` and `hasMeta` signals that the
`refs >= 4` branch currently short-circuits, or drop the field and stop
implying a distinction the data does not carry. Picking one is the owner's
call.

## Watch out for

- **The sitemap uses query strings.** Every study is
  `/dev-case-studies/study.html?slug=<slug>`, rendered client side from
  `data/studies/<slug>.json`. A script comparing sitemap paths against files on
  disk will report all 204 as missing pages; compare slugs.
- **The GitHub Pages path prefix is in the sitemap** and not in the repository
  layout, for the same reason.
- **Counts stated in prose**: `README.md` says 204 case studies, which is
  correct today. Nothing checks it.

## Testing

`.github/workflows/ci.yml` runs `npm run validate` on every push and pull
request. The lychee link check moved to its own `link-check.yml` on
2026-09-22: it carried `fail: false` on pull requests, so a contributor got a
result they could neither act on nor be blocked by, and it shared a run with
the data validation, where a job cancelled by its own timeout cancels the whole
run and would have taken the validation down with it. On the daily schedule it
fails, because external link rot needs no commit to happen.
