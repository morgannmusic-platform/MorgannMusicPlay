document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("player-container");
    if (!container) return;

    fetch("/assets/player/player.html")
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;
            initPlayerLogic();
        })
        .catch(err => console.error("Erreur de chargement du lecteur :", err));
});

function initPlayerLogic() {
    const audio = document.getElementById("audio-element");
    const toggleBtn = document.getElementById("player-toggle");
    const titleEl = document.getElementById("player-title");
    const artistEl = document.getElementById("player-artist");
    const coverEl = document.getElementById("player-cover");

    if (!audio || !toggleBtn) return;

    let isPlaying = false;

    // 1. Sauvegarder l'état de la lecture juste avant de quitter la page
    window.addEventListener("beforeunload", () => {
        if (audio && !audio.paused && audio.src) {
            localStorage.setItem("mm_audio_state", JSON.stringify({
                url: audio.src,
                currentTime: audio.currentTime,
                isPlaying: true,
                title: titleEl.textContent,
                artist: artistEl.textContent,
                cover: coverEl.src
            }));
        }
    });

    toggleBtn.addEventListener("click", () => {
        if (!audio.src) return;
        if (isPlaying) {
            audio.pause();
            toggleBtn.textContent = "▶";
        } else {
            audio.play();
            toggleBtn.textContent = "⏸";
        }
        isPlaying = !isPlaying;
    });

    // Fonction globale pour lancer la lecture d'un morceau n'importe où sur le site
    window.mmPlayTrack = function (track) {
        if (!track || !track.url) return;
        audio.src = track.url;
        titleEl.textContent = track.title || "Morceau sans titre";
        artistEl.textContent = track.artist || "Morgann Music";
        if (track.cover) coverEl.src = track.cover;

        // Si un temps de départ est spécifié (ex: reprise après changement de page)
        if (track.startTime) {
            audio.currentTime = track.startTime;
        }

        audio.play().then(() => {
            isPlaying = true;
            toggleBtn.textContent = "⏸";
        }).catch(err => console.error("Erreur lecture audio:", err));
    };

    // 2. Restaurer et relancer la musique automatiquement si elle jouait avant le changement de page
    const savedState = localStorage.getItem("mm_audio_state");
    if (savedState) {
        localStorage.removeItem("mm_audio_state"); // Nettoyage immédiat
        try {
            const state = JSON.parse(savedState);
            if (state.isPlaying && state.url) {
                // Petit délai pour laisser le DOM et le lecteur s'initialiser proprement
                setTimeout(() => {
                    window.mmPlayTrack({
                        title: state.title,
                        artist: state.artist,
                        url: state.url,
                        cover: state.cover,
                        startTime: state.currentTime
                    });
                }, 200);
            }
        } catch (e) {
            console.error("Erreur lors de la restauration de l'état audio :", e);
        }
    }
}