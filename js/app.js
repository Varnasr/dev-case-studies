/* ==========================================================================
   Global Development Case Study Library — Application Logic
   Pure JavaScript, no external dependencies
   ========================================================================== */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────

  const DATA_BASE = './data';
  const DEBOUNCE_MS = 200;
  const SCROLL_TOP_THRESHOLD = 400;

  // ── Country Flag Emoji Mapper ──────────────────────────────────────────

  const COUNTRY_CODES = {
    'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR',
    'Armenia': 'AM', 'Australia': 'AU', 'Austria': 'AT', 'Azerbaijan': 'AZ',
    'Bangladesh': 'BD', 'Belarus': 'BY', 'Belgium': 'BE', 'Bhutan': 'BT',
    'Bolivia': 'BO', 'Bosnia & Herzegovina': 'BA', 'Botswana': 'BW',
    'Brazil': 'BR', 'Burkina Faso': 'BF', 'Cambodia': 'KH', 'Cameroon': 'CM',
    'Canada': 'CA', 'Cape Verde': 'CV', 'Chile': 'CL', 'China': 'CN',
    'Colombia': 'CO', 'Costa Rica': 'CR', 'Croatia': 'HR',
    'Cuba': 'CU', "Côte d'Ivoire": 'CI', 'DRC': 'CD',
    'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypt': 'EG',
    'El Salvador': 'SV', 'Eritrea': 'ER', 'Estonia': 'EE', 'Ethiopia': 'ET',
    'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 'Georgia': 'GE',
    'Germany': 'DE', 'Ghana': 'GH', 'Greece': 'GR', 'Guatemala': 'GT',
    'Haiti': 'HT', 'Honduras': 'HN', 'Hungary': 'HU', 'India': 'IN',
    'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE',
    'Israel': 'IL', 'Italy': 'IT', 'Jamaica': 'JM', 'Japan': 'JP',
    'Jordan': 'JO', 'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Kosovo': 'XK',
    'Kuwait': 'KW', 'Kurdistan Region (Iraq)': 'IQ',
    'Kyrgyzstan': 'KG', 'Laos': 'LA',
    'Lebanon': 'LB', 'Lesotho': 'LS', 'Liberia': 'LR', 'Libya': 'LY',
    'Madagascar': 'MG', 'Malawi': 'MW', 'Malaysia': 'MY', 'Maldives': 'MV',
    'Mali': 'ML', 'Mauritius': 'MU', 'Mexico': 'MX', 'Moldova': 'MD',
    'Mongolia': 'MN', 'Montenegro': 'ME', 'Morocco': 'MA', 'Mozambique': 'MZ',
    'Myanmar': 'MM', 'Namibia': 'NA', 'Nepal': 'NP', 'Netherlands': 'NL',
    'New Zealand': 'NZ', 'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG',
    'North Macedonia': 'MK', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK',
    'Palestine': 'PS', 'Panama': 'PA', 'Papua New Guinea': 'PG',
    'Paraguay': 'PY', 'Peru': 'PE', 'Philippines': 'PH', 'Poland': 'PL',
    'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO', 'Russia': 'RU',
    'Rwanda': 'RW', 'Saudi Arabia': 'SA', 'Senegal': 'SN', 'Serbia': 'RS',
    'Sierra Leone': 'SL', 'Singapore': 'SG', 'Somalia': 'SO',
    'South Africa': 'ZA', 'South Korea': 'KR', 'Spain': 'ES',
    'Sri Lanka': 'LK', 'Sudan': 'SD', 'Sweden': 'SE', 'Switzerland': 'CH',
    'Taiwan': 'TW', 'Tajikistan': 'TJ', 'Tanzania': 'TZ', 'Thailand': 'TH',
    'Timor-Leste': 'TL', 'Trinidad & Tobago': 'TT', 'Tunisia': 'TN',
    'Turkey': 'TR', 'Turkmenistan': 'TM', 'UAE': 'AE', 'Uganda': 'UG',
    'Ukraine': 'UA', 'United Kingdom': 'GB', 'United States': 'US',
    'Uruguay': 'UY', 'Uzbekistan': 'UZ', 'Venezuela': 'VE', 'Vietnam': 'VN',
    'Yemen': 'YE', 'Zambia': 'ZM', 'Zimbabwe': 'ZW',
    'Regional': null,
    'Global': null,
    'Global (Bangladesh origin)': 'BD',
    'Global (Kenya, Uganda)': 'KE',
    'Global (Sub-Saharan Africa)': null,
    'Global (UK origin)': 'GB',
    'Global (Kenya origin)': 'KE'
  };

  function countryToFlag(country) {
    const code = COUNTRY_CODES[country];
    if (!code) {
      // Return a globe emoji for global / regional / unknown
      return '\u{1F310}';
    }
    // Convert country code to regional indicator symbols
    return String.fromCodePoint(
      ...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
  }

  // ── Topic Slug Mapper ──────────────────────────────────────────────────

  function topicToClass(topic) {
    return 'topic-' + topic
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ── Simple Markdown Renderer ───────────────────────────────────────────

  function renderMarkdown(md) {
    if (!md) return '';

    let html = md;

    // Escape HTML entities first (but preserve already-safe content)
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // --- Horizontal rules (before other processing)
    html = html.replace(/^-{3,}$/gm, '<hr>');

    // --- Tables
    html = html.replace(
      /(?:^(\|.+\|)\s*\n(\|[\s:|-]+\|)\s*\n((?:\|.+\|\s*\n?)*))/gm,
      function (match, headerRow, sepRow, bodyRows) {
        const headers = headerRow.split('|').filter(c => c.trim());
        // Parse alignment from separator
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
          const cells = row.split('|').filter(c => c.trim() !== '' || c === '');
          // Re-split properly
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

    // --- Blockquotes (multi-line aware)
    html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');

    // --- Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // --- Bold and Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // --- Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // --- Unordered lists
    html = html.replace(/^(?:- (.+)\n?)+/gm, function (match) {
      const items = match.trim().split('\n');
      return '<ul>' + items.map(item =>
        '<li>' + item.replace(/^- /, '') + '</li>'
      ).join('') + '</ul>';
    });

    // --- Ordered lists
    html = html.replace(/^(?:\d+\. (.+)\n?)+/gm, function (match) {
      const items = match.trim().split('\n');
      return '<ol>' + items.map(item =>
        '<li>' + item.replace(/^\d+\.\s*/, '') + '</li>'
      ).join('') + '</ol>';
    });

    // --- Paragraphs: wrap remaining untagged lines
    const lines = html.split('\n\n');
    html = lines.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Don't wrap blocks that are already HTML elements
      if (/^<(h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|hr|p|div)/.test(trimmed)) {
        return trimmed;
      }
      return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');

    return html;
  }

  // ── Utility Functions ──────────────────────────────────────────────────

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
    // Clear existing params
    [...url.searchParams.keys()].forEach(k => url.searchParams.delete(k));
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
    window.history.replaceState({}, '', url);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Scroll to Top Button ───────────────────────────────────────────────

  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    function toggleVisibility() {
      if (window.scrollY > SCROLL_TOP_THRESHOLD) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── INDEX PAGE (Library Listing) ───────────────────────────────────────

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

    // Restore state from URL params
    const params = getUrlParams();
    if (params.q) {
      searchQuery = params.q;
      searchInput.value = searchQuery;
    }
    if (params.regions) {
      params.regions.split(',').forEach(r => activeRegions.add(r));
    }
    if (params.topics) {
      params.topics.split(',').forEach(t => activeTopics.add(t));
    }

    // Fetch master list
    fetch(`${DATA_BASE}/master-list.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load case studies');
        return res.json();
      })
      .then(data => {
        allStudies = data;
        initChips();
        renderCards();
        updateSearchUI();
      })
      .catch(err => {
        console.error(err);
        cardGrid.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">\u26A0\uFE0F</div>
            <h3>Unable to Load Case Studies</h3>
            <p>There was a problem loading the data. Please check your connection and try refreshing.</p>
          </div>`;
      });

    // Initialize filter chips
    function initChips() {
      // Region chips
      const regions = [...new Set(allStudies.map(s => s.region))].sort();
      if (regionChips) {
        regionChips.innerHTML = regions.map(r =>
          `<button class="chip${activeRegions.has(r) ? ' active' : ''}" data-region="${escapeHtml(r)}">${escapeHtml(r)}</button>`
        ).join('');

        regionChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          const region = chip.dataset.region;
          if (activeRegions.has(region)) {
            activeRegions.delete(region);
            chip.classList.remove('active');
          } else {
            activeRegions.add(region);
            chip.classList.add('active');
          }
          renderCards();
          updateActiveFilters();
          syncUrlParams();
        });
      }

      // Topic chips
      const topics = [...new Set(allStudies.map(s => s.topic))].sort();
      if (topicChips) {
        topicChips.innerHTML = topics.map(t =>
          `<button class="chip${activeTopics.has(t) ? ' active' : ''}" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`
        ).join('');

        topicChips.addEventListener('click', e => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          const topic = chip.dataset.topic;
          if (activeTopics.has(topic)) {
            activeTopics.delete(topic);
            chip.classList.remove('active');
          } else {
            activeTopics.add(topic);
            chip.classList.add('active');
          }
          renderCards();
          updateActiveFilters();
          syncUrlParams();
        });
      }

      updateActiveFilters();
    }

    // Update active filter tags display
    function updateActiveFilters() {
      if (!activeFiltersEl) return;
      const tags = [];

      activeRegions.forEach(r => {
        tags.push(`<span class="active-filter-tag" data-type="region" data-value="${escapeHtml(r)}">${escapeHtml(r)} <span class="remove">\u00D7</span></span>`);
      });
      activeTopics.forEach(t => {
        tags.push(`<span class="active-filter-tag" data-type="topic" data-value="${escapeHtml(t)}">${escapeHtml(t)} <span class="remove">\u00D7</span></span>`);
      });

      if (tags.length > 0) {
        tags.push(`<button class="clear-all-btn" id="clear-all-filters">Clear all</button>`);
      }

      activeFiltersEl.innerHTML = tags.join('');

      // Click handlers for removing individual filters
      activeFiltersEl.querySelectorAll('.active-filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const type = tag.dataset.type;
          const value = tag.dataset.value;
          if (type === 'region') {
            activeRegions.delete(value);
            const chip = regionChips?.querySelector(`[data-region="${value}"]`);
            if (chip) chip.classList.remove('active');
          } else {
            activeTopics.delete(value);
            const chip = topicChips?.querySelector(`[data-topic="${value}"]`);
            if (chip) chip.classList.remove('active');
          }
          renderCards();
          updateActiveFilters();
          syncUrlParams();
        });
      });

      // Clear all button
      const clearAll = document.getElementById('clear-all-filters');
      if (clearAll) {
        clearAll.addEventListener('click', () => {
          activeRegions.clear();
          activeTopics.clear();
          regionChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          topicChips?.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          renderCards();
          updateActiveFilters();
          syncUrlParams();
        });
      }
    }

    // Search event handlers
    const handleSearch = debounce(() => {
      searchQuery = searchInput.value.trim();
      renderCards();
      syncUrlParams();
      updateSearchUI();
    }, DEBOUNCE_MS);

    searchInput.addEventListener('input', handleSearch);

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        renderCards();
        syncUrlParams();
        updateSearchUI();
        searchInput.focus();
      });
    }

    function updateSearchUI() {
      const hasValue = searchInput.value.length > 0;
      if (searchClear) {
        searchClear.classList.toggle('visible', hasValue);
      }
      if (searchKbd) {
        searchKbd.style.display = hasValue ? 'none' : '';
      }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchInput.blur();
        renderCards();
        syncUrlParams();
        updateSearchUI();
      }
    });

    function syncUrlParams() {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (activeRegions.size) params.regions = [...activeRegions].join(',');
      if (activeTopics.size) params.topics = [...activeTopics].join(',');
      setUrlParams(params);
    }

    // Filter logic
    function getFilteredStudies() {
      let filtered = allStudies;

      // Search filter
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

      // Region filter
      if (activeRegions.size > 0) {
        filtered = filtered.filter(s => activeRegions.has(s.region));
      }

      // Topic filter
      if (activeTopics.size > 0) {
        filtered = filtered.filter(s => activeTopics.has(s.topic));
      }

      return filtered;
    }

    // Render cards
    function renderCards() {
      const filtered = getFilteredStudies();
      const total = allStudies.length;

      // Update results count
      if (resultsCountEl) {
        resultsCountEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${total}</strong> case studies`;
      }

      if (filtered.length === 0) {
        cardGrid.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">\u{1F50D}</div>
            <h3>No Case Studies Found</h3>
            <p>Try adjusting your search terms or removing some filters to see more results.</p>
          </div>`;
        return;
      }

      cardGrid.innerHTML = filtered.map((study, idx) => {
        const flag = countryToFlag(study.country);
        const topicClass = topicToClass(study.topic);
        const summary = study.summary
          ? escapeHtml(study.summary)
          : 'Explore this development case study to learn about real-world interventions, evidence, and lessons.';
        const delay = Math.min(idx * 0.03, 0.6);

        return `
          <article class="case-card" style="animation-delay:${delay}s">
            <div class="card-body">
              <span class="card-topic ${topicClass}">${escapeHtml(study.topic)}</span>
              <h3 class="card-title">${escapeHtml(study.title)}</h3>
              <div class="card-meta">
                <span class="card-country">${flag} ${escapeHtml(study.country)}</span>
                <span class="card-year">${escapeHtml(study.year)}</span>
              </div>
              <p class="card-summary">${summary}</p>
              <a href="./study.html?slug=${encodeURIComponent(study.slug)}" class="card-link">
                Read Case Study <span class="arrow">\u2192</span>
              </a>
            </div>
          </article>`;
      }).join('');
    }
  }

  // ── STUDY PAGE (Individual Case Study) ─────────────────────────────────

  function initStudyPage() {
    const params = getUrlParams();
    const slug = params.slug;

    const breadcrumbEl = document.getElementById('study-breadcrumb');
    const headerEl = document.getElementById('study-header');
    const keyDataEl = document.getElementById('study-key-data');
    const contentEl = document.getElementById('study-content');
    const navEl = document.getElementById('study-nav');
    const mainEl = document.getElementById('study-main');

    if (!mainEl) return;

    if (!slug) {
      showError('No Case Study Specified', 'Please select a case study from the library.');
      return;
    }

    // Show loading state
    mainEl.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span class="loading-text">Loading case study...</span>
      </div>`;

    // We need both the master list (for navigation) and the individual study
    Promise.all([
      fetch(`${DATA_BASE}/master-list.json`).then(r => r.ok ? r.json() : Promise.reject('Failed to load master list')),
      fetch(`${DATA_BASE}/studies/${encodeURIComponent(slug)}.json`).then(r => {
        if (!r.ok) throw new Error('Study not found');
        return r.json();
      })
    ])
      .then(([masterList, study]) => {
        renderStudy(study, masterList);
        // Update page title
        document.title = `${study.title} | Global Development Case Study Library`;
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && study.summary) {
          metaDesc.setAttribute('content', study.summary);
        }
      })
      .catch(err => {
        console.error(err);
        showError(
          'Case Study Not Found',
          `The case study "${escapeHtml(slug)}" could not be loaded. It may not exist yet or there was a network error.`
        );
      });

    function showError(title, message) {
      mainEl.innerHTML = `
        <div class="container">
          <div class="error-state">
            <div class="error-state-icon">\u{1F4DA}</div>
            <h2>${title}</h2>
            <p>${message}</p>
            <a href="./index.html" class="back-to-library">\u2190 Back to Library</a>
          </div>
        </div>`;
    }

    function renderStudy(study, masterList) {
      const flag = countryToFlag(study.country);
      const topicClass = topicToClass(study.topic);

      // Find prev/next studies in the master list
      const currentIdx = masterList.findIndex(s => s.slug === study.slug);
      const prevStudy = currentIdx > 0 ? masterList[currentIdx - 1] : null;
      const nextStudy = currentIdx < masterList.length - 1 ? masterList[currentIdx + 1] : null;

      // Build the page content
      let pageHtml = `
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="./index.html">Library</a>
            <span class="sep">/</span>
            <a href="./index.html?regions=${encodeURIComponent(study.region)}">${escapeHtml(study.region)}</a>
            <span class="sep">/</span>
            <span>${escapeHtml(study.title)}</span>
          </nav>

          <!-- Header -->
          <header class="study-header">
            <span class="study-topic-tag ${topicClass}">${escapeHtml(study.topic)}</span>
            <h1 class="study-title">${escapeHtml(study.title)}</h1>
            <div class="study-meta">
              <span class="study-meta-item">
                ${flag} <span>${escapeHtml(study.country)}</span>
              </span>
              <span class="study-meta-item">
                <span class="study-meta-label">Region</span>
                ${escapeHtml(study.region)}
              </span>
              <span class="study-meta-item">
                <span class="study-meta-label">Period</span>
                ${escapeHtml(study.year)}
              </span>
            </div>
          </header>

          <!-- Main content layout -->
          <div class="study-layout">
            <!-- Content area -->
            <div class="study-content">
              ${renderMarkdown(study.content || '')}
            </div>

            <!-- Key Data sidebar -->
            ${study.keyData && study.keyData.length > 0 ? `
            <aside class="key-data">
              <h3>Key Data</h3>
              <div class="key-data-grid">
                ${study.keyData.map(d => `
                  <div class="key-data-item">
                    <div class="key-data-label">${escapeHtml(d.label)}</div>
                    <div class="key-data-value">${escapeHtml(d.value)}</div>
                  </div>
                `).join('')}
              </div>
            </aside>` : ''}
          </div>

          <!-- Navigation -->
          <nav class="study-nav" aria-label="Case study navigation">
            ${prevStudy ? `
              <a href="./study.html?slug=${encodeURIComponent(prevStudy.slug)}" class="study-nav-link prev">
                <span class="study-nav-label">\u2190 Previous</span>
                <span class="study-nav-title">${escapeHtml(prevStudy.title)}</span>
              </a>` : '<div></div>'}
            ${nextStudy ? `
              <a href="./study.html?slug=${encodeURIComponent(nextStudy.slug)}" class="study-nav-link next">
                <span class="study-nav-label">Next \u2192</span>
                <span class="study-nav-title">${escapeHtml(nextStudy.title)}</span>
              </a>` : '<div></div>'}
          </nav>

          <a href="./index.html" class="back-to-library">\u2190 Back to Library</a>
        </div>`;

      mainEl.innerHTML = pageHtml;
    }
  }

  // ── Initialization ─────────────────────────────────────────────────────

  function init() {
    // Determine which page we're on
    const path = window.location.pathname;
    const isStudyPage = path.endsWith('study.html') ||
                        document.getElementById('study-main') !== null;
    const isIndexPage = path.endsWith('index.html') ||
                        path.endsWith('/') ||
                        document.getElementById('card-grid') !== null;

    if (isStudyPage) {
      initStudyPage();
    } else if (isIndexPage) {
      initIndexPage();
    }

    initScrollTop();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
