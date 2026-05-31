document.addEventListener('DOMContentLoaded', function() {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function() {
      var opened = mobileNav.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      resetHero();
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
      resetHero();
    });
  });

  startHero();

  var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

  panels.forEach(function(panel) {
    var scope = panel.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var input = panel.querySelector('.js-search-input');
    var region = panel.querySelector('.js-filter-region');
    var type = panel.querySelector('.js-filter-type');
    var year = panel.querySelector('.js-filter-year');
    var empty = scope.querySelector('.empty-state');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var keyword = valueOf(input);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var shown = 0;

      cards.forEach(function(card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && (card.dataset.region || '').toLowerCase() !== regionValue) {
          matched = false;
        }
        if (typeValue && (card.dataset.type || '').toLowerCase() !== typeValue) {
          matched = false;
        }
        if (yearValue && String(card.dataset.year || '').toLowerCase() !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, region, type, year].forEach(function(control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });
});
