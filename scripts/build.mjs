#!/usr/bin/env node
/* ==========================================================================
   Dev Case Studies — Build Pipeline
   --------------------------------------------------------------------------
   Zero-dependency Node build step that turns the individual study JSON files
   in data/studies/ into the derived data the front-end consumes:

     • data/master-list.json  — the card index (regenerated, never hand-edited)
     • data/search-index.json — lightweight full-text search index
     • data/stats.json        — aggregate statistics for the Insights dashboard
     • sitemap.xml            — one URL per study for search engines

   It also validates every study file (required fields, unique slugs/ids,
   filename ↔ slug agreement) and enriches each record with a computed
   reading time, reference count, and evidence-strength tier.

   Usage:
     node scripts/build.mjs           # validate + write all artefacts
     node scripts/build.mjs --check   # validate only; fail if artefacts drift
   ========================================================================== */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STUDIES_DIR = join(ROOT, 'data', 'studies');
const SITE_URL = (process.env.SITE_URL || 'https://varnasr.github.io/dev-case-studies').replace(/\/$/, '');

const CHECK_ONLY = process.argv.includes('--check');
const REQUIRED_FIELDS = ['id', 'slug', 'title', 'country', 'region', 'topic', 'year', 'summary', 'content'];
const WORDS_PER_MINUTE = 210;

const errors = [];
const warnings = [];

// ── Derived-metric helpers (kept in lockstep with js/app.js) ───────────────

function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(content) {
  return Math.max(1, Math.round(countWords(content) / WORDS_PER_MINUTE));
}

// The citation section is headed "References" in 189 studies and "Further
// Reading" in the 15 written to the later, longer template, which is every
// South Asia study bar two. Those 15 carry five full academic citations each
// (Imbert and Papp in AEJ: Applied, Dreze and Khera in World Development, and
// so on) and this function returned 0 for all of them, so the library reported
// 867 references where it holds 942, and the --check run printed "no parseable
// References section" as a warning that reads like missing citations and was
// in fact a heading this regex did not know. No study carries both headings,
// so nothing is counted twice.
function countReferences(content) {
  const m = (content || '').match(/## (?:References|Sources|Bibliography|Further Reading)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
  if (!m) return 0;
  return m[1].trim().split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter((l) => l.length >= 20).length;
}

/* The two signals the tier short-circuits.
 *
 * evidenceTier() below reaches `refs >= 4` first and returns 'strong' before
 * either of these is consulted, and every one of the 204 studies carries four
 * or five references, so the tier is 'strong' on all of them: a field with zero
 * variance, which is a constant with a label on it.
 *
 * These two are not constants. Measured over the library on 2026-09-23: 61 of
 * 204 studies cite experimental or quasi-experimental work, and 7 cite a
 * systematic review or meta-analysis. They were computed and thrown away. They
 * are recorded per study now, and the interface filters on them. */
function evidenceSignals(content) {
  return {
    citesExperimental: /\b(RCT|randomi[sz]ed|experiment|causal|quasi-experiment|difference.in.difference|regression discontinuity|instrumental variable)/i.test(content || ''),
    citesReview: /\b(meta.analysis|systematic review|Cochrane|Campbell)/i.test(content || ''),
  };
}

/* The tier by study design, chosen by the owner on 2026-10-30. Until then it
 * reached `refs >= 4` first and returned 'strong' for every study, because all
 * of them carry four or five references. It now reads only what the study
 * cites:
 *   strong    cites experimental or quasi-experimental work AND a systematic
 *             review or meta-analysis
 *   moderate  cites one of the two
 *   emerging  cites neither
 * The signals are keyword matches over the study's text, so the tier says what
 * kind of evidence a study draws on, not how good that evidence is. about.html
 * says so. */
function evidenceTier(content) {
  const { citesExperimental, citesReview } = evidenceSignals(content);
  if (citesExperimental && citesReview) return 'strong';
  if (citesExperimental || citesReview) return 'moderate';
  return 'emerging';
}

function extractStartYear(yearStr) {
  const m = (yearStr || '').match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

function extractDecade(yearStr) {
  const yr = extractStartYear(yearStr);
  return yr ? `${Math.floor(yr / 10) * 10}s` : null;
}

// ── Load + validate every study file ───────────────────────────────────────

function loadStudies() {
  const files = readdirSync(STUDIES_DIR).filter((f) => f.endsWith('.json')).sort();
  const studies = [];
  const seenSlugs = new Map();
  const seenIds = new Map();

  for (const file of files) {
    const path = join(STUDIES_DIR, file);
    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      errors.push(`${file}: invalid JSON — ${e.message}`);
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`${file}: missing required field "${field}"`);
      }
    }

    const expectedName = `${data.slug}.json`;
    if (data.slug && basename(file) !== expectedName) {
      errors.push(`${file}: filename does not match slug (expected "${expectedName}")`);
    }
    if (data.slug) {
      if (seenSlugs.has(data.slug)) errors.push(`${file}: duplicate slug "${data.slug}" (also in ${seenSlugs.get(data.slug)})`);
      seenSlugs.set(data.slug, file);
    }
    if (data.id !== undefined) {
      if (seenIds.has(data.id)) errors.push(`${file}: duplicate id ${data.id} (also in ${seenIds.get(data.id)})`);
      seenIds.set(data.id, file);
    }
    if (data.summary && data.summary.length < 40) {
      warnings.push(`${file}: summary is unusually short (${data.summary.length} chars)`);
    }
    if (!Array.isArray(data.keyData) || data.keyData.length === 0) {
      warnings.push(`${file}: no keyData entries`);
    }
    if (countReferences(data.content) === 0) {
      warnings.push(`${file}: no parseable References section`);
    }

    studies.push(data);
  }

  studies.sort((a, b) => (a.id || 0) - (b.id || 0));
  return studies;
}

// ── Artefact builders ──────────────────────────────────────────────────────

function buildMasterList(studies) {
  return studies.map((s) => {
    const refs = countReferences(s.content);
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      country: s.country,
      region: s.region,
      topic: s.topic,
      year: s.year,
      summary: s.summary,
      readingMinutes: readingMinutes(s.content),
      words: countWords(s.content),
      refs,
      evidence: evidenceTier(s.content),
      ...evidenceSignals(s.content),
    };
  });
}

function buildSearchIndex(studies) {
  return studies.map((s) => ({
    slug: s.slug,
    title: s.title,
    country: s.country,
    region: s.region,
    topic: s.topic,
    year: s.year,
    // Flattened haystack for instant client-side matching.
    text: [s.title, s.country, s.region, s.topic, s.summary,
      (s.keyData || []).map((k) => `${k.label} ${k.value}`).join(' ')].join(' ').toLowerCase(),
  }));
}

function buildStats(master) {
  const tally = (key, transform = (v) => v) => {
    const out = {};
    for (const s of master) {
      const k = transform(s[key]);
      if (k) out[k] = (out[k] || 0) + 1;
    }
    return Object.entries(out).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
  };

  const totalWords = master.reduce((sum, s) => sum + (s.words || 0), 0);
  const totalRefs = master.reduce((sum, s) => sum + (s.refs || 0), 0);

  return {
    // NB: intentionally no timestamp here — the build must be deterministic so
    // `--check` (CI) only fails on real data changes, not on the calendar date.
    totals: {
      studies: master.length,
      countries: new Set(master.map((s) => s.country)).size,
      regions: new Set(master.map((s) => s.region)).size,
      topics: new Set(master.map((s) => s.topic)).size,
      references: totalRefs,
      words: totalWords,
    },
    byTopic: tally('topic'),
    byRegion: tally('region'),
    byDecade: tally('year', extractDecade).sort((a, b) => a.label.localeCompare(b.label)),
    byEvidence: tally('evidence'),
  };
}

function buildSitemap(master) {
  const urls = [
    `  <url><loc>${SITE_URL}/index.html</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${SITE_URL}/about.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    ...master.map((s) =>
      `  <url><loc>${SITE_URL}/study.html?slug=${encodeURIComponent(s.slug)}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
  ];
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.join('\n') + '\n</urlset>\n';
}

// ── Static page heads ──────────────────────────────────────────────────────
// index.html, about.html and study.html are written by hand, not generated.
// Each lists its own canonical address (the same form the sitemap uses) and a
// matching og:url. study.html is deliberately the exception: it is one page
// that renders 200+ studies from ?slug=, so a static canonical would fold them
// all into one. js/app.js sets it per study, and this check holds both halves.

// A preview picture must be a JPEG or PNG (LinkedIn does not read WebP) of at most
// 250 KB (WhatsApp drops larger ones), at the size the tags declare. The one card
// serves every page, including each study, whose own tags js/app.js sets.
function imageSize(buf) {
  if (buf.length > 24 && buf.toString('latin1', 1, 4) === 'PNG') return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xc2) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

function checkShareCard(files) {
  const base = `${SITE_URL}/`;
  const attr = (html, re) => (html.match(re) || [])[1];
  for (const file of files) {
    const html = readFileSync(join(ROOT, file), 'utf8');
    const img = attr(html, /<meta property="og:image" content="([^"]*)"/);
    if (!img || !img.startsWith(base)) { errors.push(`${file}: og:image must be an address under ${base}`); continue; }
    if (attr(html, /<meta name="twitter:image" content="([^"]*)"/) !== img) errors.push(`${file}: twitter:image differs from og:image`);
    if (attr(html, /<meta property="og:image:width" content="([^"]*)"/) !== '1200') errors.push(`${file}: og:image:width is not 1200`);
    if (attr(html, /<meta property="og:image:height" content="([^"]*)"/) !== '630') errors.push(`${file}: og:image:height is not 630`);
    if (!attr(html, /<meta property="og:image:alt" content="([^"]+)"/)) errors.push(`${file}: missing og:image:alt`);
    const rel = img.slice(base.length);
    const path = join(ROOT, rel);
    if (!existsSync(path)) { errors.push(`${file}: ${img} has no file at ${rel}`); continue; }
    const buf = readFileSync(path);
    if (buf.length > 250000) errors.push(`${rel} is ${buf.length} bytes; WhatsApp drops previews over about 250 KB`);
    const size = imageSize(buf);
    if (!size) errors.push(`${rel} is not a JPEG or PNG`);
    else if (size[0] !== 1200 || size[1] !== 630) errors.push(`${rel} is ${size[0]}x${size[1]}, the tags say 1200x630`);
  }
}

function checkPageHeads() {
  const attr = (html, re) => (html.match(re) || [])[1];
  for (const file of ['index.html', 'about.html']) {
    const html = readFileSync(join(ROOT, file), 'utf8');
    const want = `${SITE_URL}/${file}`;
    const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
    const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
    if (canon !== want) errors.push(`${file}: canonical is ${canon || 'missing'}, expected ${want}`);
    if (ogUrl !== want) errors.push(`${file}: og:url is ${ogUrl || 'missing'}, expected ${want}`);
    if (!/<meta name="twitter:card" content="summary_large_image">/.test(html)) errors.push(`${file}: twitter:card is not summary_large_image`);
  }
  checkShareCard(['index.html', 'about.html', 'study.html']);
  const study = readFileSync(join(ROOT, 'study.html'), 'utf8');
  if (/<link rel="canonical"/.test(study)) errors.push('study.html: a static canonical would fold every study into one page; js/app.js sets it per study');
  const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
  if (!/canon\.href = studyUrl/.test(app)) errors.push('js/app.js: no longer sets the per-study canonical');
}

// ── Write / check ──────────────────────────────────────────────────────────

function emit(relPath, content) {
  const path = join(ROOT, relPath);
  const next = typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n';
  if (CHECK_ONLY) {
    let current = '';
    try { current = readFileSync(path, 'utf8'); } catch { /* missing */ }
    if (current !== next) {
      errors.push(`${relPath}: out of date — run "npm run build" and commit the result`);
    }
    return;
  }
  writeFileSync(path, next);
  console.log(`  ✓ ${relPath}`);
}

function main() {
  console.log(CHECK_ONLY ? 'Validating case-study data…' : 'Building case-study data…');
  const studies = loadStudies();
  const master = buildMasterList(studies);

  emit('data/master-list.json', master);
  emit('data/search-index.json', buildSearchIndex(studies));
  emit('data/stats.json', buildStats(master));
  emit('sitemap.xml', buildSitemap(master));
  checkPageHeads();

  if (warnings.length) {
    console.warn(`\n${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 25)) console.warn(`  ⚠ ${w}`);
    if (warnings.length > 25) console.warn(`  …and ${warnings.length - 25} more`);
  }

  if (errors.length) {
    console.error(`\n✗ ${errors.length} error(s):`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }

  console.log(`\n✓ ${studies.length} studies processed cleanly${CHECK_ONLY ? ' (check mode)' : ''}.`);
}

main();
