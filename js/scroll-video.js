function setupVideoScroll(options = {}) {
        const {
            videoId = "myVideo",
            containerId = "videoContainer",
            speed = 100,
            triggerHook = 0,
            duration = 133200, // Duración fija en píxeles
            controller = new ScrollMagic.Controller()
        } = options;

        // Obtener elementos
        const video = document.getElementById(videoId);
        const container = document.getElementById(containerId);

        // Variable para evitar actualizaciones frecuentes
        let lastTime = 0;

        // Asegurarse de que el video está completamente cargado
        const ensureVideoLoaded = () => {
            if (video.readyState === 4) { // readyState 4 significa que el video está completamente cargado
                container.style.height = (video.duration * speed) + 'px';
                return true;
            }
            setTimeout(ensureVideoLoaded, 100); // Intentar nuevamente en 100ms
        };

        video.addEventListener('loadedmetadata', ensureVideoLoaded);

        // Sincronizar el video con el scroll
        const playVideo = () => {
            const scrollY = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = scrollY / height;
            const currentTime = video.duration * percentage;

            // Actualizar solo si el tiempo cambió significativamente
            if (!isNaN(currentTime) && Math.abs(currentTime - lastTime) > 0.1 && currentTime >= 0 && currentTime <= video.duration) {
                video.currentTime = currentTime;
                lastTime = currentTime;
            }

            window.requestAnimationFrame(playVideo);
        };

        // Usar requestAnimationFrame para optimizar el evento de scroll
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    playVideo();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Configurar ScrollMagic Scene
        document.addEventListener("DOMContentLoaded", () => {
            const mainPortadaVideo = document.getElementById('main-portada-video');
            const audioTrack = document.getElementById('track');

            const scene = new ScrollMagic.Scene({
                triggerElement: `#${containerId}`,
                triggerHook: triggerHook,
                duration: duration,
            })
                .setPin(`#${containerId}`)
                //.addIndicators({ name: "video scroll" }) // Habilita si necesitas depuración
                .on("start", () => {
                    if (!mainPortadaVideo.muted) {
                        mainPortadaVideo.muted = true;
                    }

                    if (audioTrack && !audioTrack.paused) {
                        audioTrack.play();
                    }
                })
                .on("end", () => {
                    const pinSpacer = document.querySelector('.scrollmagic-pin-spacer');
                    if (pinSpacer) {
                        pinSpacer.classList.add('adjust-height');
                    }

                    if (audioTrack && !audioTrack.paused) {
                        audioTrack.pause();
                        audioTrack.currentTime = 0;
                    }
                })
                .addTo(controller);
        });

        // Usar IntersectionObserver para optimizar reproducción solo cuando el contenedor es visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", onScroll);
                } else {
                    window.removeEventListener("scroll", onScroll);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(container);

        // Reproducir el video una vez que se carga completamente
        video.muted = true; // Silenciar el video para mejorar el rendimiento
        window.requestAnimationFrame(playVideo);
    }

    // Uso de la función
    setupVideoScroll({
        videoId: "myVideo",
        containerId: "videoContainer",
        speed: 100,
        triggerHook: 0,
        duration: 133200
    });