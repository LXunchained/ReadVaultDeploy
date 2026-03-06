/* app.js — ReadVault interactivity */
'use strict';

// ── Mobile nav toggle ─────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    const spans = navToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    })
  );
}

// ── Nav background on scroll ──────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(18,14,8,0.97)'
      : 'rgba(18,14,8,0.85)';
  }, { passive: true });
}

// ── Scroll reveal ─────────────────────────────────────────
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.visible)');
  if (!revealEls.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = (Array.from(entry.target.parentElement.children)
          .filter(c => c.classList.contains('reveal'))
          .indexOf(entry.target)) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}
initReveal();

// ── Dynamic books from data/books.json ────────────────────
const dynamicSection = document.getElementById('dynamic-books');
const skeleton = document.getElementById('books-skeleton');
const staticDivider = document.getElementById('static-divider');
const filterTabs = document.getElementById('filter-tabs');
const booksGrid = document.getElementById('books-grid');
const noResults = document.getElementById('no-results');

const BADGES = ['New Today 🔥', '#1 Bestseller', 'BookTok Pick', 'Must Read', 'Top Rated', 'Hot Pick'];

function _stars(rating) {
  if (!rating) return '';
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function _catSlug(cat) {
  return (cat || 'books').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function _renderBook(book, idx) {
  const cat = book.category || 'Books';
  const catSlug = _catSlug(cat);
  const badge = book.isHighlighted ? 'New Today 🔥' : BADGES[idx % BADGES.length];
  const stars = _stars(book.rating || 0);
  const subtitle = book.subtitle || '';
  const imgHtml = book.imageUrl
    ? `<img src="${book.imageUrl}" alt="${book.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
    : `<div class="no-img">📖</div>`;

  return `
    <div class="book-card reveal" data-cat="${catSlug}" data-source="dynamic">
      <div class="book-card-img">
        ${imgHtml}
        <span class="book-badge">${badge}</span>
        ${book.youtubeId ? `<a href="https://youtu.be/${book.youtubeId}" target="_blank" rel="noopener" class="video-badge" title="Watch review">▶</a>` : ''}
      </div>
      <div class="book-card-body">
        <span class="book-category">${cat}</span>
        <div class="book-title">${book.title}</div>
        ${book.author ? `<div class="book-author">by ${book.author}</div>` : ''}
        ${stars ? `<div class="book-rating"><span class="stars">${stars}</span><span class="rating-count">${subtitle}</span></div>` : ''}
        <a href="${book.url}" target="_blank" rel="noopener" class="btn btn-amazon">🛒 View on Amazon</a>
      </div>
    </div>`;
}

function _ensureFilterTab(catSlug, label) {
  if (!filterTabs) return;
  if (filterTabs.querySelector(`[data-cat="${catSlug}"]`)) return;
  const btn = document.createElement('button');
  btn.className = 'filter-tab';
  btn.dataset.cat = catSlug;
  btn.textContent = label;
  filterTabs.appendChild(btn);
}

async function loadDynamicBooks() {
  if (!dynamicSection) return;
  try {
    const res = await fetch('data/books.json?v=' + Date.now());
    if (!res.ok) throw new Error('Not found');
    const books = await res.json();
    if (!books.length) throw new Error('Empty');

    dynamicSection.innerHTML = books.map((b, i) => _renderBook(b, i)).join('');

    // Register any new categories in the filter tabs
    const seen = new Set();
    books.forEach(b => {
      const slug = _catSlug(b.category);
      const label = b.category || 'Books';
      if (!seen.has(slug)) { seen.add(slug); _ensureFilterTab(slug, label); }
    });

    if (staticDivider) staticDivider.style.display = '';
    initReveal();
    applyFilter(new URLSearchParams(window.location.search).get('cat') || 'all');
  } catch (_) {
    // data/books.json not available yet — static curated books still show
  } finally {
    if (skeleton) skeleton.style.display = 'none';
  }
}

if (dynamicSection) loadDynamicBooks();

// ── Category filter tabs ──────────────────────────────────
function applyFilter(cat) {
  if (!booksGrid) return;
  const cards = booksGrid.querySelectorAll('.book-card');
  let visible = 0;
  cards.forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  // Hide "Curated Classics" divider when filtering to a category with no dynamic hits
  if (staticDivider) {
    const dynVisible = [...booksGrid.querySelectorAll('[data-source="dynamic"]')]
      .filter(c => c.style.display !== 'none').length;
    staticDivider.style.display = dynVisible ? '' : 'none';
  }
  if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
}

if (filterTabs && booksGrid) {
  const urlCat = new URLSearchParams(window.location.search).get('cat') || 'all';
  applyFilter(urlCat);

  const tabForCat = filterTabs.querySelector(`[data-cat="${urlCat}"]`);
  if (tabForCat) {
    filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabForCat.classList.add('active');
  }

  filterTabs.addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    applyFilter(tab.dataset.cat);
  });
}
