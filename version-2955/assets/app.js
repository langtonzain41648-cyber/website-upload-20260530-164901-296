
(function () {
  function qs(root, sel) { return root.querySelector(sel); }
  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  function setHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    const track = qs(slider, '[data-hero-track]');
    const slides = qsa(track, '[data-hero-slide]');
    const dotsWrap = qs(slider, '[data-hero-dots]');
    if (!track || !slides.length || !dotsWrap) return;
    let index = 0;

    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 张');
      btn.addEventListener('click', () => show(i));
      dotsWrap.appendChild(btn);
      return btn;
    });

    function show(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    let timer = setInterval(() => show(index + 1), 5000);
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => { timer = setInterval(() => show(index + 1), 5000); });
    show(0);
  }

  function setMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    const search = document.querySelector('.site-search');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      if (search) search.classList.toggle('is-open');
    });
  }

  function filterCards() {
    const inputs = qsa(document, '[data-search-input]');
    const grids = qsa(document, '[data-list-grid]');
    if (!inputs.length || !grids.length) return;
    const cards = qsa(document, '[data-card]');
    const countEl = document.querySelector('[data-result-count]');
    const sortSelect = document.querySelector('[data-sort-select]');

    function apply() {
      const query = inputs[0].value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const ok = !query || text.includes(query);
        card.setAttribute('data-search-hide', ok ? '0' : '1');
        if (ok) visible += 1;
      });
      if (countEl) countEl.textContent = String(visible);
    }

    function sortCards() {
      if (!sortSelect) return;
      const grid = grids[0];
      const arr = cards.slice();
      const mode = sortSelect.value;
      const byText = (a, b) => (a.textContent || '').localeCompare(b.textContent || '', 'zh-Hans-CN');
      arr.sort((a, b) => {
        const ya = parseInt(a.getAttribute('data-year') || '0', 10);
        const yb = parseInt(b.getAttribute('data-year') || '0', 10);
        const sa = parseInt(a.getAttribute('data-score') || '0', 10);
        const sb = parseInt(b.getAttribute('data-score') || '0', 10);
        if (mode === 'year-desc') return yb - ya || byText(a, b);
        if (mode === 'year-asc') return ya - yb || byText(a, b);
        if (mode === 'score-desc') return sb - sa || byText(a, b);
        return byText(a, b);
      });
      arr.forEach(card => grid.appendChild(card));
      apply();
    }

    inputs.forEach(input => input.addEventListener('input', apply));
    if (sortSelect) sortSelect.addEventListener('change', sortCards);
    apply();
    sortCards();
  }

  function setupPlayer() {
    const video = document.querySelector('#movie-player');
    if (!video) return;
    const playBtn = document.querySelector('[data-play-button]');
    const pauseBtn = document.querySelector('[data-pause-button]');
    if (playBtn) playBtn.addEventListener('click', () => video.play());
    if (pauseBtn) pauseBtn.addEventListener('click', () => video.pause());

    const hlsSrc = video.getAttribute('data-hls-src');
    if (hlsSrc && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
    }
  }

  function smoothBackToTop() {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setHeroSlider();
    setMobileMenu();
    filterCards();
    setupPlayer();
    smoothBackToTop();
  });
})();
