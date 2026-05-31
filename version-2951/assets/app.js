(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupRails() {
    document.querySelectorAll(".rail-section").forEach(function (section) {
      var rail = section.querySelector("[data-rail]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupLocalFilters() {
    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.year,
            card.dataset.region,
            card.dataset.category
          ].join(" "));
          card.style.display = haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupSearchPage() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) {
      return;
    }
    var input = document.getElementById("searchInput");
    var category = document.getElementById("categoryFilter");
    var year = document.getElementById("yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-results] .searchable-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var q = normalize(input ? input.value : "");
      var c = normalize(category ? category.value : "");
      var y = normalize(year ? year.value : "");
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.region,
          card.dataset.category
        ].join(" "));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (c && normalize(card.dataset.category) !== c) {
          ok = false;
        }
        if (y && normalize(card.dataset.year) !== y) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    [input, category, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video[data-stream]");
      var button = shell.querySelector(".play-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hls = null;

      function attach() {
        if (!stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = stream;
        }
      }

      function play() {
        if (!video.src && !(hls && hls.url)) {
          attach();
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      attach();
      if (button) {
        button.addEventListener("click", play);
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (event.target.closest(".play-overlay")) {
          return;
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupRails();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
