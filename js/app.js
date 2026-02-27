/* ==========================================================================
   Dev Case Studies — Application Logic
   Features: Sidebar filters, decade/tag/RQ search, sort, grid/list view,
             citation parsing, evidence summaries, literature maps,
             Cornell Notes, conceptual frameworks
   ========================================================================== */

(function () {
  'use strict';

  const DATA_BASE = './data';
  const DEBOUNCE_MS = 200;
  const SCROLL_TOP_THRESHOLD = 400;

  // ── Inline SVG Icons (Sargam-style) ────────────────────────────────

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
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    list: '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  };

  function icon(name, cls) {
    return `<span class="si${cls ? ' ' + cls : ''}">${ICONS[name] || ''}</span>`;
  }

  // ── Utilities ──────────────────────────────────────────────────────

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function getUrlParams() {
    var params = {};
    var sp = new URLSearchParams(window.location.search);
    sp.forEach(function(v, k) { params[k] = v; });
    return params;
  }

  function setUrlParams(params) {
    try {
      var url = new URL(window.location);
      var keys = [];
      url.searchParams.forEach(function(v, k) { keys.push(k); });
      keys.forEach(function(k) { url.searchParams.delete(k); });
      Object.keys(params).forEach(function(k) { if (params[k]) url.searchParams.set(k, params[k]); });
      window.history.replaceState({}, '', url);
    } catch (e) { /* ignore URL param errors */ }
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
    return 'topic-' + topic.toLowerCase().replace(/&/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  }

  // Extract start year from year string like "2007-present" or "1990s-2010"
  function extractStartYear(yearStr) {
    const m = (yearStr || '').match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // Extract decade label
  function extractDecade(yearStr) {
    const yr = extractStartYear(yearStr);
    if (!yr) return null;
    const dec = Math.floor(yr / 10) * 10;
    return `${dec}s`;
  }

  // ── Research Question Keywords ─────────────────────────────────────

  const RQ_KEYWORDS = {
    'poverty': ['poverty', 'poor', 'income', 'inequality', 'welfare', 'consumption'],
    'health': ['health', 'disease', 'mortality', 'HIV', 'malaria', 'nutrition', 'vaccine', 'hospital', 'medical'],
    'education': ['education', 'school', 'learning', 'literacy', 'enrollment', 'teacher', 'student'],
    'women': ['women', 'gender', 'female', 'girl', 'maternal', 'empowerment'],
    'microfinance': ['microfinance', 'microcredit', 'loan', 'banking', 'financial inclusion', 'mobile money'],
    'agriculture': ['agriculture', 'farm', 'crop', 'irrigation', 'food', 'land', 'seed'],
    'water': ['water', 'sanitation', 'clean water', 'WASH', 'hygiene'],
    'governance': ['governance', 'corruption', 'democracy', 'decentralization', 'institution', 'state', 'policy'],
    'trade': ['trade', 'export', 'import', 'tariff', 'industrial policy', 'manufacturing'],
    'climate': ['climate', 'environment', 'carbon', 'deforestation', 'renewable', 'energy'],
    'cash transfer': ['cash transfer', 'conditional', 'unconditional', 'social protection', 'safety net', 'welfare'],
    'technology': ['technology', 'digital', 'mobile', 'internet', 'innovation', 'ICT'],
    'conflict': ['conflict', 'war', 'peace', 'refugee', 'displacement', 'violence'],
    'urbanization': ['urban', 'city', 'housing', 'slum', 'infrastructure', 'transport'],
    'child': ['child', 'children', 'infant', 'stunting', 'early childhood'],
  };

  function matchResearchQuestion(query, studies) {
    if (!query || query.length < 3) return { filtered: studies, matchedTerms: [] };
    const q = query.toLowerCase();
    const matchedTerms = [];
    const matchedKeywords = new Set();

    // Find which keyword groups match the query
    for (const [group, keywords] of Object.entries(RQ_KEYWORDS)) {
      for (const kw of keywords) {
        if (q.includes(kw)) {
          matchedKeywords.add(kw);
          matchedTerms.push(group);
          break;
        }
      }
    }

    // Also do a general text search on the question
    const words = q.split(/\s+/).filter(w => w.length > 2);

    const scored = studies.map(s => {
      let score = 0;
      const searchable = `${s.title} ${s.country} ${s.topic} ${s.summary || ''}`.toLowerCase();

      // Keyword matches
      for (const kw of matchedKeywords) {
        if (searchable.includes(kw)) score += 3;
      }

      // General word matches
      for (const word of words) {
        if (searchable.includes(word)) score += 1;
      }

      return { study: s, score };
    });

    // Only return studies that match at least something
    const filtered = scored.filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.study);

    return { filtered: filtered.length > 0 ? filtered : studies, matchedTerms: [...new Set(matchedTerms)] };
  }

  // ── Content Parsers ────────────────────────────────────────────────

  function parseCitations(content) {
    if (!content) return [];
    const refs = [];
    const refMatch = content.match(/## (?:References|Sources|Bibliography)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!refMatch) return refs;
    const lines = refMatch[1].trim().split('\n').filter(l => l.trim());
    for (const line of lines) {
      let text = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (text.length >= 20) refs.push({ text });
    }
    return refs;
  }

  function parseFurtherReading(content) {
    if (!content) return [];
    const items = [];
    const frMatch = content.match(/## (?:Further Reading|Recommended Reading|Additional Reading)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!frMatch) return items;
    const lines = frMatch[1].trim().split('\n').filter(l => l.trim());
    for (const line of lines) {
      let text = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (text.length >= 15) items.push({ text });
    }
    return items;
  }

  function parseDiscussionQuestions(content) {
    if (!content) return [];
    const qs = [];
    const match = content.match(/## (?:Discussion Questions|Key Questions|Questions for Discussion)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!match) return qs;
    const items = match[1].trim().split(/\n(?=\d+\.\s)/).filter(s => s.trim());
    for (const item of items) {
      let text = item.replace(/^\d+\.\s*/, '').replace(/\*\*([^*]+)\*\*\s*/, '').trim();
      if (text.length > 20) qs.push(text);
    }
    return qs;
  }

  function extractEvidenceFindings(content) {
    if (!content) return [];
    const findings = [];
    const match = content.match(/## (?:Results & Evidence|Results|Evidence|Impact|Outcomes)\s*\n([\s\S]*?)(?=\n## |$)/i);
    const text = match ? match[1] : content;
    const sentences = text.split(/([.!?])\s+/).reduce(function(acc, part, i, arr) {
      if (i % 2 === 0) acc.push(part + (arr[i + 1] || ''));
      return acc;
    }, []);
    const quantPattern = /\d+[\.\d]*\s*(%|percent|percentage|million|billion|trillion|fold|times|pp\b|point)/i;
    for (const s of sentences) {
      if (quantPattern.test(s) && s.length > 30 && s.length < 300) {
        let clean = s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
        if (clean.length > 30) { findings.push(clean); if (findings.length >= 5) break; }
      }
    }
    return findings;
  }

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

  function parseLessons(content) {
    if (!content) return [];
    const lessons = [];
    const match = content.match(/## (?:Key Lessons|Lessons|Lessons for Policymakers|Lessons Learned)\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/i);
    if (!match) return lessons;
    const items = match[1].trim().split(/\n(?=[-*]\s|\d+\.\s)/).filter(s => s.trim());
    for (const item of items) {
      let text = item.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      const boldMatch = text.match(/^\*\*([^*]+)\*\*[:\.]?\s*([\s\S]*)/);
      if (boldMatch) lessons.push({ title: boldMatch[1].trim(), detail: boldMatch[2].trim() });
      else if (text.length > 20) lessons.push({ title: '', detail: text });
    }
    return lessons;
  }

  // ── Markdown Renderer ──────────────────────────────────────────────

  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/^-{3,}$/gm, '<hr>');
    // Tables
    html = html.replace(/(?:^(\|.+\|)\s*\n(\|[\s:|-]+\|)\s*\n((?:\|.+\|\s*\n?)*))/gm, function (m, hdr, sep, body) {
      const headers = hdr.split('|').filter(c => c.trim());
      const aligns = sep.split('|').filter(c => c.trim()).map(c => { const t = c.trim(); if (t.startsWith(':') && t.endsWith(':')) return 'center'; if (t.endsWith(':')) return 'right'; return 'left'; });
      let t = '<table><thead><tr>';
      headers.forEach((h, i) => { t += `<th style="text-align:${aligns[i]||'left'}">${h.trim()}</th>`; });
      t += '</tr></thead><tbody>';
      body.trim().split('\n').forEach(row => { const parts = row.replace(/^\|/,'').replace(/\|$/,'').split('|'); t += '<tr>'; parts.forEach((c,i) => { t += `<td style="text-align:${aligns[i]||'left'}">${c.trim()}</td>`; }); t += '</tr>'; });
      return t + '</tbody></table>';
    });
    html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');
    html = html.replace(/^### (.+)$/gm, (m, t) => `<h3 id="${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}">${t}</h3>`);
    html = html.replace(/^## (.+)$/gm, (m, t) => `<h2 id="${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}">${t}</h2>`);
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^(?:- (.+)\n?)+/gm, function (match) { const items = match.trim().split('\n'); return '<ul>' + items.map(i => '<li>' + i.replace(/^- /, '') + '</li>').join('') + '</ul>'; });
    html = html.replace(/^(?:\d+\. (.+)\n?)+/gm, function (match) { const items = match.trim().split('\n'); return '<ol>' + items.map(i => '<li>' + i.replace(/^\d+\.\s*/, '') + '</li>').join('') + '</ol>'; });
    html = html.split('\n\n').map(block => { const t = block.trim(); if (!t) return ''; if (/^<(h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|hr|p|div)/.test(t)) return t; return '<p>' + t.replace(/\n/g, '<br>') + '</p>'; }).join('\n');
    return html;
  }

  function extractTOC(content) {
    if (!content) return [];
    const toc = []; const re = /^## (.+)$/gm; let m;
    while ((m = re.exec(content)) !== null) {
      const t = m[1].trim();
      toc.push({ title: t, id: t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') });
    }
    return toc;
  }

  function renderCitationText(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return html;
  }

  // ── Scroll to Top ──────────────────────────────────────────────────

  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > SCROLL_TOP_THRESHOLD); }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ══════════════════════════════════════════════════════════════════
  //  INDEX PAGE — Sidebar Filters
  // ══════════════════════════════════════════════════════════════════

  function initIndexPage() {
    let allStudies = [];
    let activeRegions = new Set();
    let activeTopics = new Set();
    let activeDecades = new Set();
    let searchQuery = '';
    let rqQuery = '';
    let rqMatchedTerms = [];
    let sortMode = 'default';
    let viewMode = 'grid';

    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const searchKbd = document.getElementById('search-kbd');
    const rqInput = document.getElementById('rq-input');
    const rqHint = document.getElementById('rq-hint');
    const regionChips = document.getElementById('region-chips');
    const topicChips = document.getElementById('topic-chips');
    const decadeChips = document.getElementById('decade-chips');
    const activeFiltersEl = document.getElementById('active-filters');
    const resultsCountEl = document.getElementById('results-count');
    const cardGrid = document.getElementById('card-grid');
    const sortSelect = document.getElementById('sort-select');
    const viewGrid = document.getElementById('view-grid');
    const viewList = document.getElementById('view-list');
    const regionCount = document.getElementById('region-count');
    const topicCount = document.getElementById('topic-count');
    const decadeCount = document.getElementById('decade-count');

    if (!cardGrid) return;

    // Restore state from URL
    const params = getUrlParams();
    if (params.q && searchInput) { searchQuery = params.q; searchInput.value = searchQuery; }
    if (params.regions) params.regions.split(',').forEach(r => activeRegions.add(r));
    if (params.topics) params.topics.split(',').forEach(t => activeTopics.add(t));
    if (params.decades) params.decades.split(',').forEach(d => activeDecades.add(d));
    if (params.sort) sortMode = params.sort;
    if (params.view) viewMode = params.view;

    if (sortSelect && sortMode !== 'default') sortSelect.value = sortMode;

    // --- Init sidebar panel toggles ---
    document.querySelectorAll('.filter-panel-toggle[data-target]').forEach(btn => {
      const body = document.getElementById(btn.dataset.target);
      if (body) {
        body.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.addEventListener('click', () => {
          const open = body.classList.toggle('open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
    });

    // --- Mobile filter toggle ---
    const mobileToggle = document.getElementById('mobile-filter-toggle');
    const sidebar = document.getElementById('filter-sidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay && sidebar) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      sidebar.parentNode.insertBefore(overlay, sidebar.nextSibling);
    }

    function openSidebar() { sidebar?.classList.add('open'); overlay?.classList.add('visible'); }
    function closeSidebar() { sidebar?.classList.remove('open'); overlay?.classList.remove('visible'); }
    mobileToggle?.addEventListener('click', () => {
      sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    overlay?.addEventListener('click', closeSidebar);

    // --- Fetch data ---
    fetch(`${DATA_BASE}/master-list.json`)
      .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function(data) {
        allStudies = data;
        try {
          initAllFilters();
          renderCards();
          updateSearchUI();
          updateViewToggle();
        } catch (e) {
          console.error('Render error:', e);
          cardGrid.innerHTML = '<div class="no-results"><h3>Render Error</h3><p>' + escapeHtml(String(e)) + '</p></div>';
        }
      })
      .catch(function(err) {
        console.error('Fetch error:', err);
        cardGrid.innerHTML = '<div class="no-results"><h3>Unable to Load</h3><p>' + escapeHtml(String(err)) + '</p></div>';
      });

    // --- Init Filters ---
    function initAllFilters() {
      // Topics with counts
      const topicMap = {};
      allStudies.forEach(s => { topicMap[s.topic] = (topicMap[s.topic] || 0) + 1; });
      const topics = Object.keys(topicMap).sort();
      if (topicChips) {
        topicChips.innerHTML = topics.map(t =>
          `<button class="chip${activeTopics.has(t) ? ' active' : ''}" data-topic="${escapeHtml(t)}">${escapeHtml(t)} <span class="chip-count">${topicMap[t]}</span></button>`
        ).join('');
        topicChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip'); if (!chip) return;
          const topic = chip.dataset.topic;
          if (activeTopics.has(topic)) { activeTopics.delete(topic); chip.classList.remove('active'); }
          else { activeTopics.add(topic); chip.classList.add('active'); }
          onFilterChange();
        });
      }

      // Regions with counts
      const regionMap = {};
      allStudies.forEach(s => { regionMap[s.region] = (regionMap[s.region] || 0) + 1; });
      const regions = Object.keys(regionMap).sort();
      if (regionChips) {
        regionChips.innerHTML = regions.map(r =>
          `<button class="chip${activeRegions.has(r) ? ' active' : ''}" data-region="${escapeHtml(r)}">${escapeHtml(r)} <span class="chip-count">${regionMap[r]}</span></button>`
        ).join('');
        regionChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip'); if (!chip) return;
          const region = chip.dataset.region;
          if (activeRegions.has(region)) { activeRegions.delete(region); chip.classList.remove('active'); }
          else { activeRegions.add(region); chip.classList.add('active'); }
          onFilterChange();
        });
      }

      // Decades with counts
      const decadeMap = {};
      allStudies.forEach(s => { const d = extractDecade(s.year); if (d) decadeMap[d] = (decadeMap[d] || 0) + 1; });
      const decades = Object.keys(decadeMap).sort();
      if (decadeChips) {
        decadeChips.innerHTML = decades.map(d =>
          `<button class="chip${activeDecades.has(d) ? ' active' : ''}" data-decade="${d}">${d} <span class="chip-count">${decadeMap[d]}</span></button>`
        ).join('');
        decadeChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip'); if (!chip) return;
          const decade = chip.dataset.decade;
          if (activeDecades.has(decade)) { activeDecades.delete(decade); chip.classList.remove('active'); }
          else { activeDecades.add(decade); chip.classList.add('active'); }
          onFilterChange();
        });
      }

      updateActiveFilters();
    }

    function onFilterChange() {
      renderCards();
      updateActiveFilters();
      updateFilterCounts();
      syncUrlParams();
    }

    function updateFilterCounts() {
      if (topicCount) { topicCount.textContent = activeTopics.size; topicCount.classList.toggle('visible', activeTopics.size > 0); }
      if (regionCount) { regionCount.textContent = activeRegions.size; regionCount.classList.toggle('visible', activeRegions.size > 0); }
      if (decadeCount) { decadeCount.textContent = activeDecades.size; decadeCount.classList.toggle('visible', activeDecades.size > 0); }
    }

    function updateActiveFilters() {
      if (!activeFiltersEl) return;
      const tags = [];
      activeRegions.forEach(r => tags.push(`<span class="active-filter-tag" data-type="region" data-value="${escapeHtml(r)}">${escapeHtml(r)} <span class="remove">\u00D7</span></span>`));
      activeTopics.forEach(t => tags.push(`<span class="active-filter-tag" data-type="topic" data-value="${escapeHtml(t)}">${escapeHtml(t)} <span class="remove">\u00D7</span></span>`));
      activeDecades.forEach(d => tags.push(`<span class="active-filter-tag" data-type="decade" data-value="${d}">${d} <span class="remove">\u00D7</span></span>`));
      if (tags.length > 0) tags.push(`<button class="clear-all-btn" id="clear-all-filters">Clear all</button>`);
      activeFiltersEl.innerHTML = tags.join('');

      activeFiltersEl.querySelectorAll('.active-filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const { type, value } = tag.dataset;
          if (type === 'region') { activeRegions.delete(value); regionChips?.querySelector(`[data-region="${value}"]`)?.classList.remove('active'); }
          else if (type === 'topic') { activeTopics.delete(value); topicChips?.querySelector(`[data-topic="${value}"]`)?.classList.remove('active'); }
          else if (type === 'decade') { activeDecades.delete(value); decadeChips?.querySelector(`[data-decade="${value}"]`)?.classList.remove('active'); }
          onFilterChange();
        });
      });

      document.getElementById('clear-all-filters')?.addEventListener('click', () => {
        activeRegions.clear(); activeTopics.clear(); activeDecades.clear();
        regionChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        topicChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        decadeChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        onFilterChange();
      });

      updateFilterCounts();
    }

    // --- Search ---
    const handleSearch = debounce(() => {
      searchQuery = searchInput?.value.trim() || '';
      renderCards(); syncUrlParams(); updateSearchUI();
    }, DEBOUNCE_MS);

    searchInput?.addEventListener('input', handleSearch);
    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      renderCards(); syncUrlParams(); updateSearchUI();
      searchInput?.focus();
    });

    function updateSearchUI() {
      const hasValue = searchInput && searchInput.value.length > 0;
      searchClear?.classList.toggle('visible', hasValue);
      if (searchKbd) searchKbd.style.display = hasValue ? 'none' : '';
    }

    // --- Research Question Search ---
    const handleRQ = debounce(() => {
      rqQuery = rqInput?.value.trim() || '';
      if (rqQuery.length >= 3) {
        const result = matchResearchQuestion(rqQuery, allStudies);
        rqMatchedTerms = result.matchedTerms;
        if (rqMatchedTerms.length > 0) {
          rqHint.innerHTML = `Matching: <em>${rqMatchedTerms.join('</em>, <em>')}</em>`;
          rqHint.classList.add('visible');
        } else {
          rqHint.classList.remove('visible');
        }
      } else {
        rqMatchedTerms = [];
        rqHint?.classList.remove('visible');
      }
      renderCards(); syncUrlParams();
    }, DEBOUNCE_MS);

    rqInput?.addEventListener('input', handleRQ);

    // --- Sort ---
    sortSelect?.addEventListener('change', () => {
      sortMode = sortSelect.value;
      renderCards(); syncUrlParams();
    });

    // --- View toggle ---
    function updateViewToggle() {
      viewGrid?.classList.toggle('active', viewMode === 'grid');
      viewList?.classList.toggle('active', viewMode === 'list');
      cardGrid?.classList.toggle('list-view', viewMode === 'list');
    }

    viewGrid?.addEventListener('click', () => { viewMode = 'grid'; updateViewToggle(); syncUrlParams(); });
    viewList?.addEventListener('click', () => { viewMode = 'list'; updateViewToggle(); syncUrlParams(); });

    // --- Keyboard shortcuts ---
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== rqInput) {
        e.preventDefault(); searchInput?.focus(); searchInput?.select();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInput) {
          searchInput.value = ''; searchQuery = ''; searchInput.blur();
          renderCards(); syncUrlParams(); updateSearchUI();
        }
        closeSidebar();
      }
    });

    function syncUrlParams() {
      const p = {};
      if (searchQuery) p.q = searchQuery;
      if (activeRegions.size) p.regions = [...activeRegions].join(',');
      if (activeTopics.size) p.topics = [...activeTopics].join(',');
      if (activeDecades.size) p.decades = [...activeDecades].join(',');
      if (sortMode !== 'default') p.sort = sortMode;
      if (viewMode !== 'grid') p.view = viewMode;
      setUrlParams(p);
    }

    // --- Filter + Sort ---
    function getFilteredStudies() {
      let filtered = allStudies;

      // Text search
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

      // Research question search
      if (rqQuery && rqQuery.length >= 3) {
        const rqResult = matchResearchQuestion(rqQuery, filtered);
        filtered = rqResult.filtered;
      }

      // Region
      if (activeRegions.size > 0) filtered = filtered.filter(s => activeRegions.has(s.region));
      // Topic
      if (activeTopics.size > 0) filtered = filtered.filter(s => activeTopics.has(s.topic));
      // Decade
      if (activeDecades.size > 0) {
        filtered = filtered.filter(s => {
          const d = extractDecade(s.year);
          return d && activeDecades.has(d);
        });
      }

      // Sort
      if (sortMode === 'title-az') filtered.sort((a, b) => a.title.localeCompare(b.title));
      else if (sortMode === 'title-za') filtered.sort((a, b) => b.title.localeCompare(a.title));
      else if (sortMode === 'year-new') filtered.sort((a, b) => extractStartYear(b.year) - extractStartYear(a.year));
      else if (sortMode === 'year-old') filtered.sort((a, b) => extractStartYear(a.year) - extractStartYear(b.year));
      else if (sortMode === 'country-az') filtered.sort((a, b) => a.country.localeCompare(b.country));

      return filtered;
    }

    // --- Render Cards ---
    function renderCards() {
      const filtered = getFilteredStudies();
      if (resultsCountEl) {
        resultsCountEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${allStudies.length}</strong> case studies`;
      }

      if (filtered.length === 0) {
        cardGrid.innerHTML = `<div class="no-results"><div class="no-results-icon">${icon('search')}</div><h3>No Case Studies Found</h3><p>Try adjusting your search terms or removing some filters.</p></div>`;
        return;
      }

      cardGrid.innerHTML = filtered.map((study, idx) => {
        const topicClass = topicToClass(study.topic);
        const summary = study.summary ? escapeHtml(study.summary) : 'Evidence-based analysis and lessons from this development case study.';
        const decade = extractDecade(study.year);

        // Generate tags from content keywords
        const tags = [];
        if (decade) tags.push(decade);
        tags.push(study.region);

        return `
          <article class="case-card" style="animation-delay:${Math.min(idx * 0.02, 0.4)}s">
            <div class="card-body">
              <span class="card-topic ${topicClass}">${escapeHtml(study.topic)}</span>
              <h3 class="card-title">${escapeHtml(study.title)}</h3>
              <div class="card-meta">
                <span class="card-country">${icon('globe')} ${escapeHtml(study.country)}</span>
                <span class="card-year">${escapeHtml(study.year)}</span>
              </div>
              <div class="card-tags">
                ${tags.map(t => `<span class="card-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
              <p class="card-summary">${summary}</p>
              <div class="card-footer">
                <a href="./study.html?slug=${encodeURIComponent(study.slug)}" class="card-link">
                  Read study ${icon('arrowRight')}
                </a>
              </div>
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

    if (!slug) { showError('No Case Study Specified', 'Please select a case study from the library.'); return; }

    mainEl.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><span class="loading-text">Loading case study...</span></div>`;

    Promise.all([
      fetch(`${DATA_BASE}/master-list.json`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${DATA_BASE}/studies/${encodeURIComponent(slug)}.json`).then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
    ])
      .then(([masterList, study]) => {
        renderStudy(study, masterList);
        document.title = `${study.title} | Dev Case Studies`;
        const md = document.querySelector('meta[name="description"]');
        if (md && study.summary) md.setAttribute('content', study.summary);
      })
      .catch(() => { showError('Case Study Not Found', `The case study "${escapeHtml(slug)}" could not be loaded.`); });

    function showError(title, message) {
      mainEl.innerHTML = `<div class="container"><div class="error-state"><div class="error-state-icon">${icon('book')}</div><h2>${title}</h2><p>${message}</p><a href="./index.html" class="back-to-library">${icon('arrowLeft')} Back to Library</a></div></div>`;
    }

    function renderStudy(study, masterList) {
      const topicClass = topicToClass(study.topic);
      const currentIdx = masterList.findIndex(s => s.slug === study.slug);
      const prevStudy = currentIdx > 0 ? masterList[currentIdx - 1] : null;
      const nextStudy = currentIdx < masterList.length - 1 ? masterList[currentIdx + 1] : null;

      const citations = parseCitations(study.content);
      const furtherReading = parseFurtherReading(study.content);
      const discussionQs = parseDiscussionQuestions(study.content);
      const evidenceFindings = extractEvidenceFindings(study.content);
      const evidenceStrength = calculateEvidenceStrength(study.content, citations);
      const lessons = parseLessons(study.content);
      const toc = extractTOC(study.content);
      const related = masterList.filter(s => s.slug !== study.slug && (s.topic === study.topic || s.region === study.region));

      let mainContent = study.content || '';
      mainContent = mainContent.replace(/## (?:References|Sources|Bibliography)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');
      mainContent = mainContent.replace(/## (?:Further Reading|Recommended Reading|Additional Reading)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');
      mainContent = mainContent.replace(/## (?:Discussion Questions|Key Questions|Questions for Discussion)\s*\n[\s\S]*?(?=\n## |\n---\s*$|$)/i, '');

      let pageHtml = `<div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="./index.html">Library</a><span class="sep">/</span>
          <a href="./index.html?regions=${encodeURIComponent(study.region)}">${escapeHtml(study.region)}</a><span class="sep">/</span>
          <span>${escapeHtml(study.title)}</span>
        </nav>

        <header class="study-header">
          <span class="study-topic-tag ${topicClass}">${escapeHtml(study.topic)}</span>
          <h1 class="study-title">${escapeHtml(study.title)}</h1>
          <div class="study-meta">
            <span class="study-meta-item">${icon('globe')} <span>${escapeHtml(study.country)}</span></span>
            <span class="study-meta-item">${icon('map')} <span class="study-meta-label">Region</span> ${escapeHtml(study.region)}</span>
            <span class="study-meta-item">${icon('clock')} <span class="study-meta-label">Period</span> ${escapeHtml(study.year)}</span>
            ${citations.length > 0 ? `<span class="study-meta-item">${icon('article')} <span class="study-meta-label">Refs</span> ${citations.length}</span>` : ''}
          </div>
        </header>

        <div class="study-layout">
          <div class="study-content">

            ${evidenceFindings.length > 0 ? `
            <div class="evidence-card">
              <div class="evidence-card-header">${icon('factCheck')}<span class="evidence-card-title">Evidence Summary</span></div>
              <div class="evidence-meter">
                <div class="evidence-meter-bar"><div class="evidence-meter-fill ${evidenceStrength.level}" style="width:${evidenceStrength.pct}%"></div></div>
                <span class="evidence-meter-label ${evidenceStrength.level}">${evidenceStrength.label}</span>
              </div>
              <ul class="evidence-findings">
                ${evidenceFindings.map(f => `<li><span class="finding-icon">${icon('check')}</span><span>${escapeHtml(f)}</span></li>`).join('')}
              </ul>
            </div>` : ''}

            ${(discussionQs.length > 0 || lessons.length > 0) ? `
            <div class="framework-card">
              <div class="framework-card-header">${icon('lightbulb')}<span class="framework-card-title">How to Think About This</span></div>
              ${lessons.length > 0 ? `<ul class="framework-questions">${lessons.slice(0, 4).map((l, i) => `<li><span class="q-marker">${i+1}.</span><span>${l.title ? `<strong>${escapeHtml(l.title)}</strong> ` : ''}${escapeHtml(l.detail.substring(0,200))}${l.detail.length>200?'...':''}</span></li>`).join('')}</ul>` : ''}
              ${discussionQs.length > 0 ? `<div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid rgba(122,92,62,0.12)"><div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-warm);margin-bottom:var(--sp-3)">Discussion Questions</div><ul class="framework-questions">${discussionQs.slice(0,3).map((q,i) => `<li><span class="q-marker">Q${i+1}</span><span>${escapeHtml(q.substring(0,250))}${q.length>250?'...':''}</span></li>`).join('')}</ul></div>` : ''}
            </div>` : ''}

            ${renderMarkdown(mainContent)}

            ${citations.length > 0 ? `
            <div class="citations-section">
              <div class="citations-header"><h2 class="citations-title">${icon('article')} References</h2></div>
              ${citations.map((c, i) => `<div class="citation-item"><span class="citation-number">${i+1}</span><span class="citation-text">${renderCitationText(c.text)}</span><div class="citation-actions"><button class="cite-btn" data-citation="${escapeHtml(c.text)}" title="Copy citation">${icon('copy')}</button></div></div>`).join('')}
            </div>` : ''}

            ${furtherReading.length > 0 ? `
            <div class="further-reading-section">
              <h2 class="citations-title">${icon('book')} Further Reading</h2>
              ${furtherReading.map((r, i) => `<div class="reading-item"><span class="reading-number">${i+1}.</span><span class="reading-text">${renderCitationText(r.text)}</span></div>`).join('')}
            </div>` : ''}

            ${related.length > 0 ? `
            <div class="litmap-section">
              <div class="litmap-header">${icon('flowTree')}<span class="litmap-title">Related Studies</span></div>
              <p class="litmap-subtitle">Studies connected by shared topic or region. Click a node to explore.</p>
              <div class="litmap-canvas" id="litmap-canvas"></div>
            </div>` : ''}

            <!-- Cornell Notes -->
            <div class="cornell-notes" id="cornell-notes">
              <div class="cornell-notes-header">
                <span class="cornell-notes-title">${icon('edit')} Cornell Notes</span>
                <div class="cornell-notes-toolbar">
                  <button class="notes-toolbar-btn" id="cornell-hand-btn" title="Handwritten style">${icon('handwriting')} Hand</button>
                  <button class="notes-export-btn" id="cornell-copy-btn">${icon('copy')} Copy</button>
                  <button class="notes-export-btn" id="cornell-export-btn">${icon('download')} Export</button>
                </div>
              </div>
              <div class="cornell-grid">
                <div class="cornell-cues">
                  <div class="cornell-cues-label">Cues / Keywords</div>
                  <textarea id="cornell-cues-text" placeholder="Key terms, questions, prompts..."></textarea>
                </div>
                <div class="cornell-notes-area">
                  <div class="cornell-notes-label">Notes</div>
                  <textarea id="cornell-notes-text" placeholder="Detailed notes, evidence, arguments..."></textarea>
                </div>
              </div>
              <div class="cornell-summary">
                <div class="cornell-summary-label">Summary</div>
                <textarea id="cornell-summary-text" placeholder="Summarize the key takeaways in your own words..."></textarea>
              </div>
              <div class="cornell-footer">
                <span id="cornell-status">Notes saved locally</span>
                <span style="font-style:italic">Cornell method: cues left, notes right, summary below</span>
              </div>
            </div>

            <nav class="study-nav" aria-label="Case study navigation">
              ${prevStudy ? `<a href="./study.html?slug=${encodeURIComponent(prevStudy.slug)}" class="study-nav-link prev"><span class="study-nav-label">${icon('chevronLeft')} Previous</span><span class="study-nav-title">${escapeHtml(prevStudy.title)}</span></a>` : '<div></div>'}
              ${nextStudy ? `<a href="./study.html?slug=${encodeURIComponent(nextStudy.slug)}" class="study-nav-link next"><span class="study-nav-label">Next ${icon('chevronRight')}</span><span class="study-nav-title">${escapeHtml(nextStudy.title)}</span></a>` : '<div></div>'}
            </nav>
            <a href="./index.html" class="back-to-library">${icon('arrowLeft')} Back to Library</a>
          </div>

          <aside class="study-sidebar">
            ${study.keyData && study.keyData.length > 0 ? `
            <div class="sidebar-panel">
              <h3 class="sidebar-panel-title">${icon('barChart')} Key Data</h3>
              <div class="key-data-grid">
                ${study.keyData.map(d => `<div class="key-data-item"><div class="key-data-label">${escapeHtml(d.label)}</div><div class="key-data-value">${escapeHtml(d.value)}</div></div>`).join('')}
              </div>
            </div>` : ''}

            ${toc.length > 0 ? `
            <div class="sidebar-panel">
              <h3 class="sidebar-panel-title">${icon('bookmark')} Contents</h3>
              <ul class="toc-list">
                ${toc.map(t => `<li><a href="#${t.id}">${escapeHtml(t.title)}</a></li>`).join('')}
                ${citations.length > 0 ? '<li><a href="#" onclick="document.querySelector(\'.citations-section\').scrollIntoView({behavior:\'smooth\'});return false;">References</a></li>' : ''}
              </ul>
            </div>` : ''}
          </aside>
        </div>
      </div>`;

      mainEl.innerHTML = pageHtml;
      initCornellNotes(study.slug, study.title);
      initCitationCopy();
      if (related.length > 0) initLitMap(study, related, masterList);
      initTOCHighlight();
    }
  }

  // ── Cornell Notes ──────────────────────────────────────────────────

  function initCornellNotes(slug, title) {
    const cuesText = document.getElementById('cornell-cues-text');
    const notesText = document.getElementById('cornell-notes-text');
    const summaryText = document.getElementById('cornell-summary-text');
    const handBtn = document.getElementById('cornell-hand-btn');
    const copyBtn = document.getElementById('cornell-copy-btn');
    const exportBtn = document.getElementById('cornell-export-btn');
    const status = document.getElementById('cornell-status');

    if (!cuesText || !notesText || !summaryText) return;

    const key = `devcs-cornell-${slug}`;

    // Load saved
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved) {
        cuesText.value = saved.cues || '';
        notesText.value = saved.notes || '';
        summaryText.value = saved.summary || '';
      }
    } catch (e) { /* ignore */ }

    // Handwrite preference
    if (localStorage.getItem('devcs-handwrite') === '1') {
      notesText.classList.add('handwritten');
      handBtn?.classList.add('active');
    }

    // Auto-save
    const save = debounce(() => {
      localStorage.setItem(key, JSON.stringify({
        cues: cuesText.value,
        notes: notesText.value,
        summary: summaryText.value
      }));
      if (status) { status.textContent = 'Saved'; setTimeout(() => { status.textContent = 'Notes saved locally'; }, 1500); }
    }, 500);

    cuesText.addEventListener('input', save);
    notesText.addEventListener('input', save);
    summaryText.addEventListener('input', save);

    // Handwrite toggle
    handBtn?.addEventListener('click', () => {
      notesText.classList.toggle('handwritten');
      handBtn.classList.toggle('active');
      localStorage.setItem('devcs-handwrite', notesText.classList.contains('handwritten') ? '1' : '0');
    });

    // Copy all
    copyBtn?.addEventListener('click', () => {
      const text = `# Cornell Notes: ${title}\n\n## Cues\n${cuesText.value}\n\n## Notes\n${notesText.value}\n\n## Summary\n${summaryText.value}\n`;
      navigator.clipboard.writeText(text).then(() => showToast('Cornell notes copied'));
    });

    // Export as markdown
    exportBtn?.addEventListener('click', () => {
      const content = `# Cornell Notes: ${title}\n\n## Cues / Keywords\n${cuesText.value}\n\n## Notes\n${notesText.value}\n\n## Summary\n${summaryText.value}\n`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cornell-notes-${slug}.md`;
      a.click(); URL.revokeObjectURL(url);
      showToast('Cornell notes exported as Markdown');
    });
  }

  // ── Citation Copy ──────────────────────────────────────────────────

  function initCitationCopy() {
    document.querySelectorAll('.cite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.citation;
        if (text) navigator.clipboard.writeText(text).then(() => showToast('Citation copied'));
      });
    });
  }

  // ── TOC Highlight ──────────────────────────────────────────────────

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
    function update() {
      const y = window.scrollY + 100;
      let current = headings[0];
      for (const h of headings) { if (h.el.offsetTop <= y) current = h; }
      links.forEach(l => l.classList.remove('active'));
      current?.link.classList.add('active');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── Literature Map ─────────────────────────────────────────────────

  function initLitMap(currentStudy, relatedStudies, masterList) {
    const canvas = document.getElementById('litmap-canvas');
    if (!canvas) return;

    const sameTopic = relatedStudies.filter(s => s.topic === currentStudy.topic);
    const sameRegion = relatedStudies.filter(s => s.region === currentStudy.region && s.topic !== currentStudy.topic);
    let selected = [...sameTopic.slice(0, 8)];
    for (const s of sameRegion) { if (selected.length >= 12) break; if (!selected.find(x => x.slug === s.slug)) selected.push(s); }
    if (selected.length === 0) return;

    const width = canvas.clientWidth || 660;
    const height = Math.max(280, Math.min(380, selected.length * 28));
    const padX = 55, padY = 35;
    const cx = width / 2, cy = height / 2;

    const nodes = [{ slug: currentStudy.slug, title: currentStudy.title, topic: currentStudy.topic, x: cx, y: cy, isCurrent: true }];
    const step = (2 * Math.PI) / selected.length;
    const rx = (width - padX * 2) / 2 * 0.75;
    const ry = (height - padY * 2) / 2 * 0.8;

    selected.forEach((s, i) => {
      const angle = step * i - Math.PI / 2;
      nodes.push({
        slug: s.slug, title: s.title, topic: s.topic,
        x: Math.max(padX, Math.min(width - padX, cx + rx * Math.cos(angle) + (Math.random() - 0.5) * 25)),
        y: Math.max(padY, Math.min(height - padY, cy + ry * Math.sin(angle) + (Math.random() - 0.5) * 18)),
        isCurrent: false
      });
    });

    let edges = '', nodeSvg = '';
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      edges += `<line class="litmap-edge${n.topic === currentStudy.topic ? ' same-topic' : ''}" x1="${nodes[0].x}" y1="${nodes[0].y}" x2="${n.x}" y2="${n.y}"/>`;
    }
    for (const n of nodes) {
      const r = n.isCurrent ? 6 : 4;
      const fill = n.topic === currentStudy.topic ? 'var(--accent)' : 'var(--text-muted)';
      const lx = n.x > cx ? n.x + 10 : n.x - 10;
      const anchor = n.x > cx ? 'start' : 'end';
      const trunc = n.title.length > 26 ? n.title.substring(0, 24) + '...' : n.title;
      nodeSvg += `<g class="litmap-node${n.isCurrent ? ' current' : ''}" data-slug="${escapeHtml(n.slug)}"><circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" stroke="${n.isCurrent ? 'var(--primary)' : fill}" stroke-width="${n.isCurrent ? 2.5 : 1.5}"/><text x="${lx}" y="${n.y + 3}" text-anchor="${anchor}">${escapeHtml(trunc)}</text></g>`;
    }

    canvas.innerHTML = `<svg viewBox="0 0 ${width} ${height}" style="min-height:${height}px">${edges}${nodeSvg}</svg>
      <div class="litmap-legend">
        <div class="litmap-legend-item"><span class="litmap-legend-dot" style="background:var(--accent);border-color:var(--accent)"></span> Same topic</div>
        <div class="litmap-legend-item"><span class="litmap-legend-dot" style="background:var(--text-muted);border-color:var(--text-muted)"></span> Same region</div>
        <div class="litmap-legend-item"><span class="litmap-legend-dot" style="background:var(--accent);border-color:var(--primary);border-width:2.5px"></span> Current</div>
      </div>`;

    canvas.querySelectorAll('.litmap-node').forEach(node => {
      node.addEventListener('click', () => {
        const s = node.dataset.slug;
        if (s && s !== currentStudy.slug) window.location.href = `./study.html?slug=${encodeURIComponent(s)}`;
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════════════════════════════

  function init() {
    try {
      var path = window.location.pathname;
      var isStudyPage = path.endsWith('study.html') || document.getElementById('study-main') !== null;
      var isIndexPage = path.endsWith('index.html') || path.endsWith('/') || document.getElementById('card-grid') !== null;
      if (isStudyPage) initStudyPage();
      else if (isIndexPage) initIndexPage();
      initScrollTop();
    } catch (e) {
      console.error('Init error:', e);
      var target = document.getElementById('card-grid') || document.getElementById('study-main');
      if (target) target.innerHTML = '<div style="padding:2rem;color:#c00"><h3>Init Error</h3><p>' + String(e.message || e) + '</p><p>' + String(e.stack || '').substring(0,200) + '</p></div>';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
