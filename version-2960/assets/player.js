var MoviePlayer = (function () {
  function resolveElement(target) {
    if (typeof target === "string") {
      return document.querySelector(target);
    }
    return target;
  }

  function init(videoTarget, coverTarget, buttonTarget, source) {
    var video = resolveElement(videoTarget);
    var cover = resolveElement(coverTarget);
    var button = resolveElement(buttonTarget);
    if (!video || !cover || !source) {
      return;
    }

    var hls = null;
    var started = false;

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          cover.hidden = false;
        });
      }
    }

    function attachNative() {
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
    }

    function attachHls() {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(source);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
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
    }

    function start() {
      if (started) {
        cover.hidden = true;
        playVideo();
        return;
      }
      started = true;
      cover.hidden = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative();
      } else if (window.Hls && window.Hls.isSupported()) {
        attachHls();
      } else {
        attachNative();
      }
    }

    cover.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    Array.prototype.slice.call(document.querySelectorAll('a[href="#movie-player"]')).forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        video.scrollIntoView({ block: "center", behavior: "smooth" });
        start();
      });
    });
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  return {
    init: init
  };
})();
