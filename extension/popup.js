const API_RADIO = "https://api.radio.play.morgannmusic.uk";
const API_MAIN = "https://api.worker.mm-cp.uk";

const radioAudio = document.getElementById("radioAudio");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const logoWrapper = document.getElementById("logoWrapper");
const radioStatusText = document.getElementById("radioStatusText");
const liveIndicator = document.getElementById("liveIndicator");
const radioCover = document.getElementById("radioCover");
const volumeSlider = document.getElementById("volumeSlider");

let currentStreamUrl = "";
let currentSeekOffset = 0;

async function fetchRadioLive() {
    try {
        const res = await fetch(`${API_RADIO}/api/radio`);
        const data = await res.json();

        if (data && data.success && data.currentTrack) {
            let audioPath = data.currentTrack.audioUrl;

            if (audioPath && String(audioPath) !== "undefined") {
                if (!audioPath.startsWith('http://') && !audioPath.startsWith('https://')) {
                    const cleanPath = audioPath.startsWith('/') ? audioPath : '/' + audioPath;
                    currentStreamUrl = `${API_MAIN}${cleanPath.startsWith('/api/') ? cleanPath : '/api/files' + cleanPath}`;
                } else {
                    currentStreamUrl = audioPath;
                }
            } else {
                radioStatusText.innerText = "Erreur : Piste audio indisponible";
                return;
            }

            currentSeekOffset = data.seekOffset || 0;
            radioStatusText.innerText = `${data.currentTrack.title} - ${data.currentTrack.artist}`;

            let coverPath = data.currentTrack.coverUrl;
            if (coverPath && String(coverPath) !== "undefined") {
                if (!coverPath.startsWith('http://') && !coverPath.startsWith('https://')) {
                    const cleanCover = coverPath.startsWith('/') ? coverPath : '/' + coverPath;
                    radioCover.src = `${API_MAIN}${cleanCover.startsWith('/api/') ? cleanCover : '/api/files' + cleanCover}`;
                } else {
                    radioCover.src = coverPath;
                }
            } else {
                radioCover.src = "https://mm-cp.uk/assets/img/icons/sombre.png";
            }

            if (!radioAudio.paused && radioAudio.src === currentStreamUrl) {
                return;
            }

            radioAudio.src = currentStreamUrl;
            radioAudio.currentTime = currentSeekOffset;
        } else {
            radioStatusText.innerText = "Aucun flux en direct disponible";
        }
    } catch (e) {
        console.warn("Erreur de récupération du direct radio :", e);
        radioStatusText.innerText = "Erreur de connexion au flux";
    }
}

function toggleRadio() {
    if (radioAudio.paused) {
        if (!radioAudio.src || radioAudio.src.includes("undefined") || radioAudio.src === window.location.href) {
            if (currentStreamUrl) {
                radioAudio.src = currentStreamUrl;
                radioAudio.currentTime = currentSeekOffset;
            } else {
                return;
            }
        }
        radioAudio.play().then(() => {
            playBtn.classList.add("isPlaying");
            logoWrapper.classList.add("playing");
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            liveIndicator.innerText = "🔴 Live Diffusion";
        }).catch(err => {
            console.error("Erreur lecture audio :", err);
        });
    } else {
        radioAudio.pause();
        playBtn.classList.remove("isPlaying");
        logoWrapper.classList.remove("playing");
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        liveIndicator.innerText = "Statique";
    }
}

playBtn.addEventListener("click", toggleRadio);

volumeSlider.addEventListener("input", (e) => {
    radioAudio.volume = e.target.value;
});

document.addEventListener("DOMContentLoaded", () => {
    fetchRadioLive();
});
