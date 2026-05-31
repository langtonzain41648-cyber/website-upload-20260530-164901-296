(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        shells.forEach(function(shell) {
            var video = shell.querySelector('video');
            var trigger = shell.querySelector('[data-play]');
            var stream = shell.getAttribute('data-stream');
            var started = false;

            function startPlayer() {
                if (!video || !stream) {
                    return;
                }

                if (!started) {
                    started = true;

                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });

                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function() {
                            video.play().catch(function() {});
                        });
                    } else {
                        video.src = stream;
                        video.play().catch(function() {});
                    }
                } else {
                    video.play().catch(function() {});
                }

                shell.classList.add('is-playing');
            }

            if (trigger) {
                trigger.addEventListener('click', startPlayer);
            }

            if (video) {
                video.addEventListener('click', startPlayer);
            }
        });
    });
})();
