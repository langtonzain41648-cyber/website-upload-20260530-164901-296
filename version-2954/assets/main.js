(function () {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let currentSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startAutoSlide() {
        if (slides.length <= 1) {
            return;
        }

        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            const index = Number(dot.getAttribute('data-target-slide')) || 0;
            showSlide(index);

            if (slideTimer) {
                window.clearInterval(slideTimer);
                startAutoSlide();
            }
        });
    });

    showSlide(0);
    startAutoSlide();

    const searchInput = document.getElementById('siteSearch');
    const filterButtons = Array.from(document.querySelectorAll('.filter-chip'));
    const cards = Array.from(document.querySelectorAll('.movie-card, .rank-row'));
    const resultBox = document.getElementById('globalSearchResults');
    let activeFilter = 'all';

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function applyPageFilter() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
            const text = cardText(card);
            const keywordMatch = !keyword || text.includes(keyword);
            const filterMatch = activeFilter === 'all' || text.includes(activeFilter.toLowerCase());
            card.classList.toggle('is-filter-hidden', !(keywordMatch && filterMatch));
        });
    }

    function renderGlobalResults(keyword) {
        if (!resultBox || !window.SEARCH_DATA) {
            return;
        }

        if (!keyword || keyword.length < 2) {
            resultBox.hidden = true;
            resultBox.innerHTML = '';
            return;
        }

        const lower = keyword.toLowerCase();
        const hits = window.SEARCH_DATA.filter(function (item) {
            return [item.title, item.year, item.genre, item.region, item.category]
                .join(' ')
                .toLowerCase()
                .includes(lower);
        }).slice(0, 12);

        if (!hits.length) {
            resultBox.hidden = true;
            resultBox.innerHTML = '';
            return;
        }

        const prefix = getAssetPrefix();
        resultBox.innerHTML = hits.map(function (item) {
            return '<a href="' + prefix + item.url + '">' +
                '<strong>' + escapeHtml(item.title) + '</strong>' +
                '<span>' + escapeHtml(String(item.year)) + ' · ' + escapeHtml(item.category) + '</span>' +
                '</a>';
        }).join('');
        resultBox.hidden = false;
    }

    function getAssetPrefix() {
        const path = window.location.pathname;
        if (path.includes('/movie/') || path.includes('/category/')) {
            return '../';
        }
        return '';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applyPageFilter();
            renderGlobalResults(searchInput.value.trim());
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyPageFilter();
        });
    });
})();
