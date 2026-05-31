document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startHero();
      });
    });

    startHero();
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var list = document.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchRegion = !region || card.dataset.region === region;
        card.classList.toggle('is-hidden-card', !(matchKeyword && matchYear && matchRegion));
      });
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');
    var layer = player.querySelector('[data-player-layer]');
    var status = player.querySelector('[data-player-status]');
    var source = player.dataset.videoSource;
    var hls = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
          setStatus('点击播放按钮继续观看');
        });
      }
    }

    function loadSource() {
      if (!video || !source) {
        setStatus('播放源暂不可用');
        return;
      }

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;
      setStatus('正在加载播放源');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成');
          if (layer) {
            layer.classList.add('is-hidden');
          }
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              setStatus('播放暂时不可用，请刷新后重试');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          if (layer) {
            layer.classList.add('is-hidden');
          }
          playVideo();
        }, { once: true });
      } else {
        setStatus('当前浏览器暂不支持此播放格式');
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        loadSource();
      });
    }

    if (layer) {
      layer.addEventListener('click', loadSource);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended && layer) {
          layer.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIE_SEARCH_DATA) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var status = searchPage.querySelector('[data-search-status]');
    var title = searchPage.querySelector('[data-search-title]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function resultCard(movie) {
      return '<article class="movie-card">' +
        '<a href="' + escapeHtml(movie.url) + '" class="movie-link" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
        '<span class="poster-frame">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
        '<span class="type-badge">' + escapeHtml(movie.category) + '</span>' +
        '</span>' +
        '<span class="movie-body">' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>' +
        '<span class="movie-meta">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</span>' +
        '</span>' +
        '</a>' +
        '</article>';
    }

    function runSearch(query) {
      var keyword = query.trim().toLowerCase();
      if (input) {
        input.value = query;
      }
      if (!keyword) {
        return;
      }
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (status) {
        status.textContent = '搜索结果';
      }
      if (title) {
        title.textContent = '关键词“' + query + '”找到 ' + matched.length + ' 个结果';
      }
      if (results) {
        results.innerHTML = matched.length ? matched.map(resultCard).join('') : '<p class="empty-result">未找到相关影片，请尝试其他关键词。</p>';
      }
    }

    if (initialQuery) {
      runSearch(initialQuery);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    }
  }
});
