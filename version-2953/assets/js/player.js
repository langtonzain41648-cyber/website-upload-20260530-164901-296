function bindMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var cover = document.getElementById(config.coverId);
  var loaded = false;
  var hlsInstance = null;

  function loadStream() {
    if (!video || loaded) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(config.url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.url;
    }
    loaded = true;
  }

  function playVideo() {
    if (!video) return;
    loadStream();
    if (cover) cover.classList.add('is-hidden');
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (cover) cover.classList.add('is-hidden');
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
}
