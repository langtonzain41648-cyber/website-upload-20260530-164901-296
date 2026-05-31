(function () {
    const video = document.getElementById('moviePlayer');
    const startButton = document.querySelector('[data-player-start]');
    const status = document.getElementById('playerStatus');

    if (!video || !startButton) {
        return;
    }

    const source = video.getAttribute('data-source');
    let hlsInstance = null;
    let hlsLoadingPromise = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoadingPromise) {
            return hlsLoadingPromise;
        }

        hlsLoadingPromise = new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS 初始化失败'));
                }
            };
            script.onerror = function () {
                reject(new Error('HLS 播放库加载失败'));
            };
            document.head.appendChild(script);
        });

        return hlsLoadingPromise;
    }

    function attachNativeSource() {
        video.src = source;
        return video.play();
    }

    function attachHlsSource(Hls) {
        if (hlsInstance) {
            hlsInstance.destroy();
        }

        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        return new Promise(function (resolve, reject) {
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(resolve).catch(reject);
            });

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    reject(new Error('播放源载入失败'));
                }
            });
        });
    }

    function startPlayback() {
        if (!source) {
            setStatus('播放源未绑定。');
            return;
        }

        startButton.classList.add('is-hidden');
        setStatus('正在载入播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            attachNativeSource()
                .then(function () {
                    setStatus('正在播放。');
                })
                .catch(function () {
                    setStatus('浏览器阻止了自动播放，请再次点击播放器。');
                    startButton.classList.remove('is-hidden');
                });
            return;
        }

        loadHlsLibrary()
            .then(function (Hls) {
                if (!Hls.isSupported()) {
                    throw new Error('当前浏览器不支持 HLS 播放。');
                }
                return attachHlsSource(Hls);
            })
            .then(function () {
                setStatus('正在播放。');
            })
            .catch(function (error) {
                setStatus(error.message || '播放源暂时无法载入。');
                startButton.classList.remove('is-hidden');
            });
    }

    startButton.addEventListener('click', startPlayback);

    video.addEventListener('play', function () {
        startButton.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            startButton.classList.remove('is-hidden');
        }
    });
})();
