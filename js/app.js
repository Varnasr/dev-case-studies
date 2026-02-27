/* ==========================================================================
   Dev Case Studies — Application Logic
   Professional academic research library
   Features: Citation parsing, evidence summaries, literature maps,
             exportable notes, conceptual frameworks
   ========================================================================== */

(function () {
  'use strict';

  const DATA_BASE = './data';
  const DEBOUNCE_MS = 200;
  const SCROLL_TOP_THRESHOLD = 400;

  // ── Inline SVG Icons (Sargam-style line icons) ──────────────────────

  const ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    map: '<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    barChart: '<svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    factCheck: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    flowTree: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg>',
    article: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>',
    handwriting: '<svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    unlock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
  };

  function icon(name, cls) {
    const svg = ICONS[name] || '';
    return `<span class="si${cls ? ' ' + cls : ''}">${svg}</span>`;
  }

  // ── Utility Functions ──────────────────────────────────────────────

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }

  function setUrlParams(params) {
    const url = new URL(window.location);
    [...url.searchParams.keys()].forEach(k => url.searchParams.delete(k));
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    window.history.replaceState({}, '', url);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  function topicToClass(topic) {
    return 'topic-' + topic
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ── Citation Parser ────────────────────────────────────────────────
  // Extracts structured references from markdown content

  function parseCitations(content) {
    if (!content) return [];
    const refs = [];

    // Find ## References section
    const refMatch = content.match(/## (?:References|Sources|Bibliography)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!refMatch) return refs;

    const refBlock = refMatch[1].trim();
    const lines = refBlock.split('\n').filter(l => l.trim());

    for (const line of lines) {
      let text = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (!text || text.length < 20) continue;
      refs.push({ text: text });
    }

    return refs;
  }

  // ── Further Reading Parser ─────────────────────────────────────────

  function parseFurtherReading(content) {
    if (!content) return [];
    const items = [];

    const frMatch = content.match(/## (?:Further Reading|Recommended Reading|Additional Reading)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!frMatch) return items;

    const block = frMatch[1].trim();
    const lines = block.split('\n').filter(l => l.trim());

    for (const line of lines) {
      let text = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (!text || text.length < 15) continue;
      items.push({ text: text });
    }

    return items;
  }

  // ── Discussion Questions Parser ────────────────────────────────────

  function parseDiscussionQuestions(content) {
    if (!content) return [];
    const qs = [];

    const match = content.match(/## (?:Discussion Questions|Key Questions|Questions for Discussion)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!match) return qs;

    const block = match[1].trim();
    // Match numbered items with bold markers
    const items = block.split(/\n(?=\d+\.\s)/).filter(s => s.trim());

    for (const item of items) {
      let text = item.replace(/^\d+\.\s*/, '').replace(/\*\*([^*]+)\*\*\s*/, '').trim();
      if (text.length > 20) qs.push(text);
    }

    return qs;
  }

  // ── Evidence Summary Extractor ─────────────────────────────────────
  // Extracts key quantitative findings from content

  function extractEvidenceFindings(content) {
    if (!content) return [];
    const findings = [];

    // Look for Results & Evidence section
    const match = content.match(/## (?:Results & Evidence|Results|Evidence|Impact|Outcomes)\s*\n([\s\S]*?)(?=\n## |$)/i);
    const text = match ? match[1] : content;

    // Find sentences with quantitative claims
    const sentences = text.split(/(?<=[.!?])\s+/);
    const quantPattern = /\d+[\.\d]*\s*(%|percent|percentage|million|billion|trillion|fold|times|pp\b|point)/i;

    for (const s of sentences) {
      if (quantPattern.test(s) && s.length > 30 && s.length < 300) {
        // Clean markdown artifacts
        let clean = s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
        if (clean.length > 30) {
          findings.push(clean);
          if (findings.length >= 5) break;
        }
      }
    }

    return findings;
  }

  // ── Evidence Strength Calculator ───────────────────────────────────

  function calculateEvidenceStrength(content, citations) {
    const refCount = citations.length;
    const hasRCT = /\b(RCT|randomized|randomised|experiment|causal|quasi-experiment|difference.in.difference|regression discontinuity|instrumental variable)/i.test(content || '');
    const hasMeta = /\b(meta.analysis|systematic review|Cochrane|Campbell)/i.test(content || '');

    if (refCount >= 5 && (hasRCT || hasMeta)) return { level: 'strong', label: 'Strong Evidence Base', pct: 90 };
    if (refCount >= 4 || hasRCT) return { level: 'strong', label: 'Strong Evidence Base', pct: 80 };
    if (refCount >= 3) return { level: 'moderate', label: 'Moderate Evidence Base', pct: 60 };
    if (refCount >= 1) return { level: 'emerging', label: 'Emerging Evidence', pct: 35 };
    return { level: 'emerging', label: 'Limited Formal Evidence', pct: 15 };
  }

  // ── Lessons Parser ─────────────────────────────────────────────────

  function parseLessons(content) {
    if (!content) return [];
    const lessons = [];

    const match = content.match(/## (?:Key Lessons|Lessons|Lessons for Policymakers|Lessons Learned)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!match) return lessons;

    const block = match[1].trim();
    const items = block.split(/\n(?=[-*]\s|\d+\.\s)/).filter(s => s.trim());

    for (const item of items) {
      let text = item.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      // Extract bold header if present
      const boldMatch = text.match(/^\*\*([^*]+)\*\*[:\.]?\s*([\s\S]*)/);
      if (boldMatch) {
        lessons.push({ title: boldMatch[1].trim(), detail: boldMatch[2].trim() });
      } else if (text.length > 20) {
        lessons.push({ title: '', detail: text });
      }
    }

    return lessons;
  }

  // ── Simple Markdown Renderer ───────────────────────────────────────

  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Horizontal rules
    html = html.replace(/^-{3,}$/gm, '<hr>');

    // Tables
    html = html.replace(
      /(?:^(\|.+\|)\s*\n(\|[\s:|-]+\|)\s*\n((?:\|.+\|\s*\n?)*))/gm,
      function (match, headerRow, sepRow, bodyRows) {
        const headers = headerRow.split('|').filter(c => c.trim());
        const aligns = sepRow.split('|').filter(c => c.trim()).map(cell => {
          const t = cell.trim();
          if (t.startsWith(':') && t.endsWith(':')) return 'center';
          if (t.endsWith(':')) return 'right';
          return 'left';
        });
        let table = '<table><thead><tr>';
        headers.forEach((h, i) => {
          table += `<th style="text-align:${aligns[i] || 'left'}">${h.trim()}</th>`;
        });
        table += '</tr></thead><tbody>';
        const rows = bodyRows.trim().split('\n');
        rows.forEach(row => {
          const parts = row.replace(/^\|/, '').replace(/\|$/, '').split('|');
          table += '<tr>';
          parts.forEach((c, i) => {
            table += `<td style="text-align:${aligns[i] || 'left'}">${c.trim()}</td>`;
          });
          table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
      }
    );

    // Blockquotes
    html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');

    // Headings (add IDs for TOC)
    html = html.replace(/^### (.+)$/gm, (m, t) => {
      const id = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<h3 id="${id}">${t}</h3>`;
    });
    html = html.replace(/^## (.+)$/gm, (m, t) => {
      const id = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<h2 id="${id}">${t}</h2>`;
    });

    // Bold & Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    html = html.replace(/^(?:- (.+)\n?)+/gm, function (match) {
      const items = match.trim().split('\n');
      return '<ul>' + items.map(item =>
        '<li>' + item.replace(/^- /, '') + '</li>'
      ).join('') + '</ul>';
    });

    // Ordered lists
    html = html.replace(/^(?:\d+\. (.+)\n?)+/gm, function (match) {
      const items = match.trim().split('\n');
      return '<ol>' + items.map(item =>
        '<li>' + item.replace(/^\d+\.\s*/, '') + '</li>'
      ).join('') + '</ol>';
    });

    // Paragraphs
    const lines = html.split('\n\n');
    html = lines.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|hr|p|div)/.test(trimmed)) {
        return trimmed;
      }
      return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');

    return html;
  }

  // ── Extract headings for Table of Contents ─────────────────────────

  function extractTOC(content) {
    if (!content) return [];
    const toc = [];
    const regex = /^## (.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      toc.push({ title, id });
    }
    return toc;
  }

  // ── Scroll to Top Button ───────────────────────────────────────────

  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    function toggleVisibility() {
      btn.classList.toggle('visible', window.scrollY > SCROLL_TOP_THRESHOLD);
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ══════════════════════════════════════════════════════════════════
  //  INDEX PAGE
  // ══════════════════════════════════════════════════════════════════

  function initIndexPage() {
    let allStudies = [];
    let activeRegions = new Set();
    let activeTopics = new Set();
    let searchQuery = '';

    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const searchKbd = document.getElementById('search-kbd');
    const regionChips = document.getElementById('region-chips');
    const topicChips = document.getElementById('topic-chips');
    const activeFiltersEl = document.getElementById('active-filters');
    const resultsCountEl = document.getElementById('results-count');
    const cardGrid = document.getElementById('card-grid');

    if (!searchInput || !cardGrid) return;

    const params = getUrlParams();
    if (params.q) { searchQuery = params.q; searchInput.value = searchQuery; }
    if (params.regions) params.regions.split(',').forEach(r => activeRegions.add(r));
    if (params.topics) params.topics.split(',').forEach(t => activeTopics.add(t));

    fetch(`${DATA_BASE}/master-list.json`)
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
      .then(data => {
        allStudies = data;
        initChips();
        renderCards();
        updateSearchUI();
      })
      .catch(() => {
        cardGrid.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">${icon('info')}</div>
            <h3>Unable to Load Case Studies</h3>
            <p>There was a problem loading the data. Please check your connection and try refreshing.</p>
          </div>`;
      });

    function initChips() {
      const regions = [...new Set(allStudies.map(s => s.region))].sort();
      if (regionChips) {
        regionChips.innerHTML = regions.map(r =>
          `<button class="chip${activeRegions.has(r) ? ' active' : ''}" data-region="${escapeHtml(r)}">${escapeHtml(r)}</button>`
        ).join('');
        regionChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          const region = chip.dataset.region;
          if (activeRegions.has(region)) { activeRegions.delete(region); chip.classList.remove('active'); }
          else { activeRegions.add(region); chip.classList.add('active'); }
          renderCards(); updateActiveFilters(); syncUrlParams();
        });
      }

      const topics = [...new Set(allStudies.map(s => s.topic))].sort();
      if (topicChips) {
        topicChips.innerHTML = topics.map(t =>
          `<button class="chip${activeTopics.has(t) ? ' active' : ''}" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`
        ).join('');
        topicChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          const topic = chip.dataset.topic;
          if (activeTopics.has(topic)) { activeTopics.delete(topic); chip.classList.remove('active'); }
          else { activeTopics.add(topic); chip.classList.add('active'); }
          renderCards(); updateActiveFilters(); syncUrlParams();
        });
      }
      updateActiveFilters();
    }

    function updateActiveFilters() {
      if (!activeFiltersEl) return;
      const tags = [];
      activeRegions.forEach(r => {
        tags.push(`<span class="active-filter-tag" data-type="region" data-value="${escapeHtml(r)}">${escapeHtml(r)} <span class="remove">\u00D7</span></span>`);
      });
      activeTopics.forEach(t => {
        tags.push(`<span class="active-filter-tag" data-type="topic" data-value="${escapeHtml(t)}">${escapeHtml(t)} <span class="remove">\u00D7</span></span>`);
      });
      if (tags.length > 0) tags.push(`<button class="clear-all-btn" id="clear-all-filters">Clear all</button>`);
      activeFiltersEl.innerHTML = tags.join('');

      activeFiltersEl.querySelectorAll('.active-filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const { type, value } = tag.dataset;
          if (type === 'region') {
            activeRegions.delete(value);
            regionChips?.querySelector(`[data-region="${value}"]`)?.classList.remove('active');
          } else {
            activeTopics.delete(value);
            topicChips?.querySelector(`[data-topic="${value}"]`)?.classList.remove('active');
          }
          renderCards(); updateActiveFilters(); syncUrlParams();
        });
      });

      document.getElementById('clear-all-filters')?.addEventListener('click', () => {
        activeRegions.clear(); activeTopics.clear();
        regionChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        topicChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        renderCards(); updateActiveFilters(); syncUrlParams();
      });
    }

    const handleSearch = debounce(() => {
      searchQuery = searchInput.value.trim();
      renderCards(); syncUrlParams(); updateSearchUI();
    }, DEBOUNCE_MS);

    searchInput.addEventListener('input', handleSearch);

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = ''; searchQuery = '';
        renderCards(); syncUrlParams(); updateSearchUI();
        searchInput.focus();
      });
    }

    function updateSearchUI() {
      const hasValue = searchInput.value.length > 0;
      searchClear?.classList.toggle('visible', hasValue);
      if (searchKbd) searchKbd.style.display = hasValue ? 'none' : '';
    }

    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault(); searchInput.focus(); searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = ''; searchQuery = ''; searchInput.blur();
        renderCards(); syncUrlParams(); updateSearchUI();
      }
    });

    function syncUrlParams() {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (activeRegions.size) params.regions = [...activeRegions].join(',');
      if (activeTopics.size) params.topics = [...activeTopics].join(',');
      setUrlParams(params);
    }

    function getFilteredStudies() {
      let filtered = allStudies;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          (s.summary && s.summary.toLowerCase().includes(q)) ||
          s.topic.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q)
        );
      }
      if (activeRegions.size > 0) filtered = filtered.filter(s => activeRegions.has(s.region));
      if (activeTopics.size > 0) filtered = filtered.filter(s => activeTopics.has(s.topic));
      return filtered;
    }

    function renderCards() {
      const filtered = getFilteredStudies();
      if (resultsCountEl) {
        resultsCountEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${allStudies.length}</strong> case studies`;
      }

      if (filtered.length === 0) {
        cardGrid.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">${icon('search')}</div>
            <h3>No Case Studies Found</h3>
            <p>Try adjusting your search terms or removing some filters to see more results.</p>
          </div>`;
        return;
      }

      cardGrid.innerHTML = filtered.map((study, idx) => {
        const topicClass = topicToClass(study.topic);
        const summary = study.summary
          ? escapeHtml(study.summary)
          : 'Explore this development case study for evidence-based analysis and lessons.';
        const delay = Math.min(idx * 0.03, 0.5);

        return `
          <article class="case-card" style="animation-delay:${delay}s">
            <div class="card-body">
              <span class="card-topic ${topicClass}">${escapeHtml(study.topic)}</span>
              <h3 class="card-title">${escapeHtml(study.title)}</h3>
              <div class="card-meta">
                <span class="card-country">${icon('globe')} ${escapeHtml(study.country)}</span>
                <span class="card-year">${escapeHtml(study.year)}</span>
              </div>
              <p class="card-summary">${summary}</p>
              <a href="./study.html?slug=${encodeURIComponent(study.slug)}" class="card-link">
                Read study ${icon('arrowRight')}
              </a>
            </div>
          </article>`;
      }).join('');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  STUDY PAGE
  // ══════════════════════════════════════════════════════════════════

  function initStudyPage() {
    const params = getUrlParams();
    const slug = params.slug;
    const mainEl = document.getElementById('study-main');
    if (!mainEl) return;

    if (!slug) {
      showError('No Case Study Specified', 'Please select a case study from the library.');
      return;
    }

    mainEl.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><span class="loading-text">Loading case study...</span></div>`;

    Promise.all([
      fetch(`${DATA_BASE}/master-list.json`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${DATA_BASE}/studies/${encodeURIComponent(slug)}.json`).then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
    ])
      .then(([masterList, study]) => {
        renderStudy(study, masterList);
        document.title = `${study.title} | Dev Case Studies`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && study.summary) metaDesc.setAttribute('content', study.summary);
      })
      .catch(() => {
        showError('Case Study Not Found', `The case study "${escapeHtml(slug)}" could not be loaded.`);
      });

    function showError(title, message) {
      mainEl.innerHTML = `
        <div class="container">
          <div class="error-state">
            <div class="error-state-icon">${icon('book')}</div>
            <h2>${title}</h2>
            <p>${message}</p>
            <a href="./index.html" class="back-to-library">${icon('arrowLeft')} Back to Library</a>
          </div>
        </div>`;
    }

    function renderStudy(study, masterList) {
      const topicClass = topicToClass(study.topic);
      const currentIdx = masterList.findIndex(s => s.slug === study.slug);
      const prevStudy = currentIdx > 0 ? masterList[currentIdx - 1] : null;
      const nextStudy = currentIdx < masterList.length - 1 ? masterList[currentIdx + 1] : null;

      // Parse structured data from content
      const citations = parseCitations(study.content);
      const furtherReading = parseFurtherReading(study.content);
      const discussionQs = parseDiscussionQuestions(study.content);
      const evidenceFindings = extractEvidenceFindings(study.content);
      const evidenceStrength = calculateEvidenceStrength(study.content, citations);
      const lessons = parseLessons(study.content);
      const toc = extractTOC(study.content);

      // Related studies for literature map
      const related = masterList.filter(s =>
        s.slug !== study.slug && (s.topic === study.topic || s.region === study.region)
      );

      // Build content — strip References, Further Reading, Discussion Questions from main markdown
      // (we render them as structured sections below)
      let mainContent = study.content || '';
      mainContent = mainContent.replace(/## (?:References|Sources|Bibliography)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');
      mainContent = mainContent.replace(/## (?:Further Reading|Recommended Reading|Additional Reading)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');
      mainContent = mainContent.replace(/## (?:Discussion Questions|Key Questions|Questions for Discussion)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');

      let pageHtml = `<div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="./index.html">Library</a>
          <span class="sep">/</span>
          <a href="./index.html?regions=${encodeURIComponent(study.region)}">${escapeHtml(study.region)}</a>
          <span class="sep">/</span>
          <span>${escapeHtml(study.title)}</span>
        </nav>

        <header class="study-header">
          <span class="study-topic-tag ${topicClass}">${escapeHtml(study.topic)}</span>
          <h1 class="study-title">${escapeHtml(study.title)}</h1>
          <div class="study-meta">
            <span class="study-meta-item">
              ${icon('globe')} <span>${escapeHtml(study.country)}</span>
            </span>
            <span class="study-meta-item">
              ${icon('map')} <span class="study-meta-label">Region</span> ${escapeHtml(study.region)}
            </span>
            <span class="study-meta-item">
              ${icon('clock')} <span class="study-meta-label">Period</span> ${escapeHtml(study.year)}
            </span>
            ${citations.length > 0 ? `<span class="study-meta-item">
              ${icon('article')} <span class="study-meta-label">References</span> ${citations.length}
            </span>` : ''}
          </div>
        </header>

        <div class="study-layout">
          <div class="study-content">

            <!-- Evidence Summary Card -->
            ${evidenceFindings.length > 0 ? `
            <div class="evidence-card">
              <div class="evidence-card-header">
                ${icon('factCheck')}
                <span class="evidence-card-title">Evidence Summary</span>
              </div>
              <div class="evidence-meter">
                <div class="evidence-meter-bar">
                  <div class="evidence-meter-fill ${evidenceStrength.level}" style="width:${evidenceStrength.pct}%"></div>
                </div>
                <span class="evidence-meter-label ${evidenceStrength.level}">${evidenceStrength.label}</span>
              </div>
              <ul class="evidence-findings">
                ${evidenceFindings.map(f => `
                  <li>
                    <span class="finding-icon">${icon('check')}</span>
                    <span>${escapeHtml(f)}</span>
                  </li>`).join('')}
              </ul>
            </div>` : ''}

            <!-- Conceptual Framework -->
            ${(discussionQs.length > 0 || lessons.length > 0) ? `
            <div class="framework-card">
              <div class="framework-card-header">
                ${icon('lightbulb')}
                <span class="framework-card-title">How to Think About This</span>
              </div>
              ${lessons.length > 0 ? `
              <ul class="framework-questions">
                ${lessons.slice(0, 4).map((l, i) => `
                  <li>
                    <span class="q-marker">${i + 1}.</span>
                    <span>${l.title ? `<strong>${escapeHtml(l.title)}</strong> ` : ''}${escapeHtml(l.detail.substring(0, 200))}${l.detail.length > 200 ? '...' : ''}</span>
                  </li>`).join('')}
              </ul>` : ''}
              ${discussionQs.length > 0 ? `
              <div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid rgba(122,92,62,0.12)">
                <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-warm);margin-bottom:var(--sp-3)">Discussion Questions</div>
                <ul class="framework-questions">
                  ${discussionQs.slice(0, 3).map((q, i) => `
                    <li>
                      <span class="q-marker">Q${i + 1}</span>
                      <span>${escapeHtml(q.substring(0, 250))}${q.length > 250 ? '...' : ''}</span>
                    </li>`).join('')}
                </ul>
              </div>` : ''}
            </div>` : ''}

            <!-- Main Content -->
            ${renderMarkdown(mainContent)}

            <!-- Citations Section -->
            ${citations.length > 0 ? `
            <div class="citations-section">
              <div class="citations-header">
                <h2 class="citations-title">${icon('article')} References</h2>
              </div>
              ${citations.map((c, i) => `
                <div class="citation-item">
                  <span class="citation-number">${i + 1}</span>
                  <span class="citation-text">${renderCitationText(c.text)}</span>
                  <div class="citation-actions">
                    <button class="cite-btn" data-citation="${escapeHtml(c.text)}" title="Copy citation">
                      ${icon('copy')}
                    </button>
                  </div>
                </div>`).join('')}
            </div>` : ''}

            <!-- Further Reading -->
            ${furtherReading.length > 0 ? `
            <div class="further-reading-section">
              <h2 class="citations-title">${icon('book')} Further Reading</h2>
              ${furtherReading.map((r, i) => `
                <div class="reading-item">
                  <span class="reading-number">${i + 1}.</span>
                  <span class="reading-text">${renderCitationText(r.text)}</span>
                </div>`).join('')}
            </div>` : ''}

            <!-- Literature Map -->
            ${related.length > 0 ? `
            <div class="litmap-section">
              <div class="litmap-header">
                ${icon('flowTree')}
                <span class="litmap-title">Related Studies</span>
              </div>
              <p class="litmap-subtitle">Studies connected by shared topic or region. Click a node to explore.</p>
              <div class="litmap-canvas" id="litmap-canvas"></div>
            </div>` : ''}

            <!-- Notes Panel -->
            <div style="margin-top:var(--sp-10);padding-top:var(--sp-6);border-top:1px solid var(--border)">
              <button class="notes-toggle" id="notes-toggle">
                ${icon('edit')} Your Notes
              </button>
              <div class="notes-panel" id="notes-panel">
                <div class="notes-panel-header">
                  <span class="notes-panel-title">${icon('edit')} Notes on ${escapeHtml(study.title)}</span>
                  <div class="notes-toolbar">
                    <button class="notes-toolbar-btn" id="notes-handwrite-btn" title="Handwritten style">
                      ${icon('handwriting')} Hand
                    </button>
                  </div>
                </div>
                <textarea class="notes-textarea" id="notes-textarea" placeholder="Write your notes, observations, or questions about this case study..."></textarea>
                <div class="notes-footer">
                  <span id="notes-status">Notes saved locally</span>
                  <div style="display:flex;gap:var(--sp-2)">
                    <button class="notes-export-btn" id="notes-copy-btn">${icon('copy')} Copy</button>
                    <button class="notes-export-btn" id="notes-export-btn">${icon('download')} Export .md</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="study-nav" aria-label="Case study navigation">
              ${prevStudy ? `
                <a href="./study.html?slug=${encodeURIComponent(prevStudy.slug)}" class="study-nav-link prev">
                  <span class="study-nav-label">${icon('chevronLeft')} Previous</span>
                  <span class="study-nav-title">${escapeHtml(prevStudy.title)}</span>
                </a>` : '<div></div>'}
              ${nextStudy ? `
                <a href="./study.html?slug=${encodeURIComponent(nextStudy.slug)}" class="study-nav-link next">
                  <span class="study-nav-label">Next ${icon('chevronRight')}</span>
                  <span class="study-nav-title">${escapeHtml(nextStudy.title)}</span>
                </a>` : '<div></div>'}
            </nav>

            <a href="./index.html" class="back-to-library">${icon('arrowLeft')} Back to Library</a>
          </div>

          <!-- Sidebar -->
          <aside class="study-sidebar">
            ${study.keyData && study.keyData.length > 0 ? `
            <div class="sidebar-panel">
              <h3 class="sidebar-panel-title">${icon('barChart')} Key Data</h3>
              <div class="key-data-grid">
                ${study.keyData.map(d => `
                  <div class="key-data-item">
                    <div class="key-data-label">${escapeHtml(d.label)}</div>
                    <div class="key-data-value">${escapeHtml(d.value)}</div>
                  </div>`).join('')}
              </div>
            </div>` : ''}

            ${toc.length > 0 ? `
            <div class="sidebar-panel">
              <h3 class="sidebar-panel-title">${icon('bookmark')} Contents</h3>
              <ul class="toc-list">
                ${toc.map(t => `
                  <li><a href="#${t.id}">${escapeHtml(t.title)}</a></li>
                `).join('')}
                ${citations.length > 0 ? '<li><a href="#" onclick="document.querySelector(\'.citations-section\').scrollIntoView({behavior:\'smooth\'});return false;">References</a></li>' : ''}
              </ul>
            </div>` : ''}
          </aside>
        </div>
      </div>`;

      mainEl.innerHTML = pageHtml;

      // Initialize interactive features
      initNotesPanel(study.slug, study.title);
      initCitationCopy();
      if (related.length > 0) {
        initLitMap(study, related, masterList);
      }
      initTOCHighlight();
    }
  }

  // ── Citation text renderer (handles italic journal names) ──────────

  function renderCitationText(text) {
    // Escape HTML first
    let html = escapeHtml(text);
    // Italicize text between * markers (from markdown)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Try to italicize journal names in standard citation format
    // Pattern: "Title." Journal Name, Vol(Issue), Pages.
    html = html.replace(/&quot;([^&]+)&quot;/g, '"$1"');
    return html;
  }

  // ── Notes Panel ────────────────────────────────────────────────────

  function initNotesPanel(slug, title) {
    const toggle = document.getElementById('notes-toggle');
    const panel = document.getElementById('notes-panel');
    const textarea = document.getElementById('notes-textarea');
    const handwriteBtn = document.getElementById('notes-handwrite-btn');
    const copyBtn = document.getElementById('notes-copy-btn');
    const exportBtn = document.getElementById('notes-export-btn');
    const status = document.getElementById('notes-status');

    if (!toggle || !panel || !textarea) return;

    const storageKey = `devcs-notes-${slug}`;
    const handwriteKey = 'devcs-handwrite';

    // Load saved notes
    const saved = localStorage.getItem(storageKey);
    if (saved) textarea.value = saved;

    // Load handwrite preference
    if (localStorage.getItem(handwriteKey) === '1') {
      textarea.classList.add('handwritten');
      handwriteBtn?.classList.add('active');
    }

    // Toggle panel
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) textarea.focus();
    });

    // Auto-open if there are saved notes
    if (saved) panel.classList.add('open');

    // Save on input
    const saveNotes = debounce(() => {
      localStorage.setItem(storageKey, textarea.value);
      if (status) status.textContent = 'Saved';
      setTimeout(() => { if (status) status.textContent = 'Notes saved locally'; }, 1500);
    }, 500);
    textarea.addEventListener('input', saveNotes);

    // Handwrite toggle
    handwriteBtn?.addEventListener('click', () => {
      textarea.classList.toggle('handwritten');
      handwriteBtn.classList.toggle('active');
      localStorage.setItem(handwriteKey, textarea.classList.contains('handwritten') ? '1' : '0');
    });

    // Copy
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(textarea.value).then(() => showToast('Notes copied to clipboard'));
    });

    // Export as markdown
    exportBtn?.addEventListener('click', () => {
      const content = `# Notes: ${title}\n\n${textarea.value}\n`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-${slug}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Notes exported as Markdown');
    });
  }

  // ── Citation Copy Buttons ──────────────────────────────────────────

  function initCitationCopy() {
    document.querySelectorAll('.cite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.citation;
        if (text) {
          navigator.clipboard.writeText(text).then(() => showToast('Citation copied'));
        }
      });
    });
  }

  // ── TOC Scroll Highlight ───────────────────────────────────────────

  function initTOCHighlight() {
    const links = document.querySelectorAll('.toc-list a');
    if (links.length === 0) return;

    const headings = [];
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const el = document.getElementById(href.slice(1));
        if (el) headings.push({ el, link });
      }
    });

    if (headings.length === 0) return;

    function updateActive() {
      const scrollY = window.scrollY + 100;
      let current = headings[0];
      for (const h of headings) {
        if (h.el.offsetTop <= scrollY) current = h;
      }
      links.forEach(l => l.classList.remove('active'));
      current?.link.classList.add('active');
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  // ── Literature Map (Litmaps-inspired SVG) ──────────────────────────

  function initLitMap(currentStudy, relatedStudies, masterList) {
    const canvas = document.getElementById('litmap-canvas');
    if (!canvas) return;

    // Select top related studies (mix of same-topic and same-region)
    const sameTopic = relatedStudies.filter(s => s.topic === currentStudy.topic);
    const sameRegion = relatedStudies.filter(s => s.region === currentStudy.region && s.topic !== currentStudy.topic);

    let selected = [];
    // Take up to 8 from same topic
    selected.push(...sameTopic.slice(0, 8));
    // Fill with same region up to 12 total
    for (const s of sameRegion) {
      if (selected.length >= 12) break;
      if (!selected.find(x => x.slug === s.slug)) selected.push(s);
    }

    if (selected.length === 0) return;

    const width = canvas.clientWidth || 700;
    const height = Math.max(300, Math.min(400, selected.length * 28));
    const padX = 60;
    const padY = 40;

    // Position nodes: current study at center, related in a force-like layout
    const nodes = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // Current study node
    nodes.push({
      slug: currentStudy.slug,
      title: currentStudy.title,
      topic: currentStudy.topic,
      region: currentStudy.region,
      x: centerX,
      y: centerY,
      isCurrent: true
    });

    // Arrange related in an ellipse around the center
    const angleStep = (2 * Math.PI) / selected.length;
    const rx = (width - padX * 2) / 2 * 0.75;
    const ry = (height - padY * 2) / 2 * 0.8;

    selected.forEach((s, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const jitterX = (Math.random() - 0.5) * 30;
      const jitterY = (Math.random() - 0.5) * 20;
      nodes.push({
        slug: s.slug,
        title: s.title,
        topic: s.topic,
        region: s.region,
        x: Math.max(padX, Math.min(width - padX, centerX + rx * Math.cos(angle) + jitterX)),
        y: Math.max(padY, Math.min(height - padY, centerY + ry * Math.sin(angle) + jitterY)),
        isCurrent: false
      });
    });

    // Build edges (connect to center, and between same-topic nodes)
    let edgesSvg = '';
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      const isSameTopic = n.topic === currentStudy.topic;
      edgesSvg += `<line class="litmap-edge${isSameTopic ? ' same-topic' : ''}" x1="${nodes[0].x}" y1="${nodes[0].y}" x2="${n.x}" y2="${n.y}"/>`;
    }

    // Build node SVG
    let nodesSvg = '';
    for (const n of nodes) {
      const r = n.isCurrent ? 7 : 5;
      const fill = n.topic === currentStudy.topic ? 'var(--accent)' : 'var(--text-muted)';
      const stroke = n.isCurrent ? 'var(--primary)' : fill;
      const truncTitle = n.title.length > 28 ? n.title.substring(0, 26) + '...' : n.title;

      // Position label to avoid overlap with center
      const labelX = n.x > centerX ? n.x + 12 : n.x - 12;
      const anchor = n.x > centerX ? 'start' : 'end';

      nodesSvg += `
        <g class="litmap-node${n.isCurrent ? ' current' : ''}" data-slug="${escapeHtml(n.slug)}">
          <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${n.isCurrent ? 2.5 : 1.5}"/>
          <text x="${labelX}" y="${n.y + 3.5}" text-anchor="${anchor}">${escapeHtml(truncTitle)}</text>
        </g>`;
    }

    const svg = `<svg viewBox="0 0 ${width} ${height}" style="min-height:${height}px">${edgesSvg}${nodesSvg}</svg>`;

    const legend = `
      <div class="litmap-legend">
        <div class="litmap-legend-item">
          <span class="litmap-legend-dot" style="background:var(--accent);border-color:var(--accent)"></span>
          Same topic
        </div>
        <div class="litmap-legend-item">
          <span class="litmap-legend-dot" style="background:var(--text-muted);border-color:var(--text-muted)"></span>
          Same region
        </div>
        <div class="litmap-legend-item">
          <span class="litmap-legend-dot" style="background:var(--accent);border-color:var(--primary);border-width:2.5px"></span>
          Current study
        </div>
      </div>`;

    canvas.innerHTML = svg + legend;

    // Click handlers for nodes
    canvas.querySelectorAll('.litmap-node').forEach(node => {
      node.addEventListener('click', () => {
        const nodeSlug = node.dataset.slug;
        if (nodeSlug && nodeSlug !== currentStudy.slug) {
          window.location.href = `./study.html?slug=${encodeURIComponent(nodeSlug)}`;
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ══════════════════════════════════════════════════════════════════

  function init() {
    const path = window.location.pathname;
    const isStudyPage = path.endsWith('study.html') || document.getElementById('study-main') !== null;
    const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || document.getElementById('card-grid') !== null;

    if (isStudyPage) initStudyPage();
    else if (isIndexPage) initIndexPage();

    initScrollTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
