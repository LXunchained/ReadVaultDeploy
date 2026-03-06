/* app.js — ReadVault interactivity */
'use strict';

// ── Mobile nav toggle ─────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    // Animate hamburger → X
    const spans = navToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click (mobile)
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
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
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

// ── Category filter tabs (books.html) ────────────────────
const filterTabs = document.getElementById('filter-tabs');
const booksGrid  = document.getElementById('books-grid');
const noResults  = document.getElementById('no-results');

if (filterTabs && booksGrid) {
  // Read ?cat= from URL on load
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

  function applyFilter(cat) {
    const cards = booksGrid.querySelectorAll('.book-card');
    let visible = 0;
    cards.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }
}
