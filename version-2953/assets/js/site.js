(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    start();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-filter-grid]');
  if (panel && grid) {
    var search = panel.querySelector('[data-filter-search]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilters() {
      var query = (search && search.value || '').trim().toLowerCase();
      var y = year && year.value || '';
      var r = region && region.value || '';
      var t = type && type.value || '';
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
        var visible = true;
        if (query && text.indexOf(query) === -1) visible = false;
        if (y && card.dataset.year !== y) visible = false;
        if (r && card.dataset.region !== r) visible = false;
        if (t && card.dataset.type !== t) visible = false;
        card.classList.toggle('is-hidden', !visible);
      });
    }

    [search, year, region, type].forEach(function (el) {
      if (el) el.addEventListener('input', applyFilters);
      if (el) el.addEventListener('change', applyFilters);
    });
  }
})();
