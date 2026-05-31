(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var heroSlides = selectAll('[data-hero-slide]');
    var heroThumbs = selectAll('[data-hero-thumb]');
    var heroIndex = 0;

    function activateHero(index) {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;

        heroSlides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        heroThumbs.forEach(function(thumb, thumbIndex) {
            thumb.classList.toggle('is-active', thumbIndex === heroIndex);
        });
    }

    heroThumbs.forEach(function(thumb, index) {
        thumb.addEventListener('click', function() {
            activateHero(index);
        });
    });

    if (heroSlides.length > 1) {
        activateHero(0);
        setInterval(function() {
            activateHero(heroIndex + 1);
        }, 5200);
    }

    selectAll('[data-filter]').forEach(function(button) {
        button.addEventListener('click', function() {
            var value = button.getAttribute('data-filter');
            var cards = selectAll('[data-year]');
            selectAll('[data-filter]').forEach(function(item) {
                item.classList.toggle('is-active', item === button);
            });
            cards.forEach(function(card) {
                var year = card.getAttribute('data-year');
                var visible = value === 'all' || year === value;
                card.style.display = visible ? '' : 'none';
            });
        });
    });
})();
