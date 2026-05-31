(function () {
    function qsAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    qsAll('[data-hero]').forEach(function (hero) {
        var slides = qsAll('[data-hero-slide]', hero);
        var dots = qsAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    });

    qsAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.closest('main') || document;
        var input = panel.querySelector('[data-search-input]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var typeSelect = panel.querySelector('[data-type-filter]');
        var clearButton = panel.querySelector('[data-clear-filter]');
        var cards = qsAll('[data-card]', scope);

        function applyFilter() {
            var query = (input && input.value || '').trim().toLowerCase();
            var year = yearSelect && yearSelect.value || '';
            var type = typeSelect && typeSelect.value || '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || (card.getAttribute('data-year') || '') === year;
                var matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
                card.hidden = !(matchQuery && matchYear && matchType);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }
    });

    function loadHls(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', function () {
                callback(window.Hls);
            });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.defer = true;
        script.setAttribute('data-hls-loader', 'true');
        script.onload = function () {
            callback(window.Hls);
        };
        document.head.appendChild(script);
    }

    qsAll('[data-player]').forEach(function (player) {
        var button = player.querySelector('[data-player-button]');
        var video = player.querySelector('video');
        var src = player.getAttribute('data-src');
        if (!button || !video || !src) {
            return;
        }

        function start() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {});
                player.classList.add('playing');
                return;
            }

            loadHls(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    player.classList.add('playing');
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                    player.classList.add('playing');
                }
            });
        }

        button.addEventListener('click', start);
    });
})();
