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

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
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

function countReferences(content) {
  const m = (content || '').match(/## (?:References|Sources|Bibliography)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
  if (!m) return 0;
  return m[1].trim().split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter((l) => l.length >= 20).length;
}

function evidenceTier(content, refs) {
  const hasRCT = /\b(RCT|randomi[sz]ed|experiment|causal|quasi-experiment|difference.in.difference|regression discontinuity|instrumental variable)/i.test(content || '');
  const hasMeta = /\b(meta.analysis|systematic review|Cochrane|Campbell)/i.test(content || '');
  if (refs >= 5 && (hasRCT || hasMeta)) return 'strong';
  if (refs >= 4 || hasRCT) return 'strong';
  if (refs >= 3) return 'moderate';
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
      evidence: evidenceTier(s.content, refs),
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
    generatedAt: new Date().toISOString().slice(0, 10),
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
