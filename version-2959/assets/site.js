(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;

            card.classList.toggle('is-filtered-out', !(queryMatch && filterMatch));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', filterCards);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            filterCards();
        });
    });

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var hlsInstance = null;
        var ready = false;

        if (!video || !cover) {
            return;
        }

        function attachStream() {
            if (ready) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        }

        function playVideo() {
            attachStream();
            cover.classList.add('is-hidden');
            var attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        cover.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        video.addEventListener('click', function () {
            if (!ready) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
