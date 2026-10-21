export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        if (url.pathname === "/api/radio") {
            try {
                // Récupération des releases
                const releasesRes = await fetch("https://api.worker.mm-cp.uk/api/releases");
                const data = await releasesRes.json();
                const releases = data.releases || data || [];

                const directReleases = releases.filter(
                    (rel) => (rel.status || "").toLowerCase() === "direct"
                );

                let playlist = [];
                directReleases.forEach((rel) => {
                    // On vérifie que tracks existe et contient des éléments
                    if (rel.tracks && Array.isArray(rel.tracks) && rel.tracks.length > 0) {
                        rel.tracks.forEach((track) => {
                            playlist.push({
                                title: track.title || rel.title,
                                artist: rel.artistName || rel.artist_name || "Morgann Music CP",
                                // On ajoute fileUrl et file_url pour couvrir tous tes formats de base de données
                                audioUrl: track.fileUrl || track.file_url || track.audioUrl || track.url,
                                coverUrl: rel.coverUrl || rel.cover_url,
                                duration: track.duration || 180
                            });
                        });
                    } else {
                        // Fallback si la sortie n'a pas de tableau de tracks mais a un lien direct
                        const fallbackAudio = rel.fileUrl || rel.file_url || rel.audioUrl || rel.audio_url;
                        if (fallbackAudio) {
                            playlist.push({
                                title: rel.title,
                                artist: rel.artistName || rel.artist_name || "Morgann Music CP",
                                audioUrl: fallbackAudio,
                                coverUrl: rel.coverUrl || rel.cover_url,
                                duration: rel.duration || 180
                            });
                        }
                    }
                });

                // SÉCURITÉ CRUCIALE : On nettoie la playlist en supprimant les morceaux qui n'ont pas d'URL audio valide
                playlist = playlist.filter(track => track.audioUrl && String(track.audioUrl) !== "undefined");

                if (playlist.length === 0) {
                    return new Response(JSON.stringify({ success: false, error: "Aucune piste disponible" }), {
                        headers: { "Content-Type": "application/json", ...corsHeaders }
                    });
                }

                const totalPlaylistDuration = playlist.reduce((acc, track) => acc + (track.duration || 180), 0);
                const nowInSeconds = Math.floor(Date.now() / 1000);
                const currentPlaybackTime = nowInSeconds % totalPlaylistDuration;

                let accumulatedTime = 0;
                let activeTrack = playlist[0];
                let seekOffset = 0;

                for (let track of playlist) {
                    const trackDuration = track.duration || 180;
                    if (currentPlaybackTime < accumulatedTime + trackDuration) {
                        activeTrack = track;
                        seekOffset = currentPlaybackTime - accumulatedTime;
                        break;
                    }
                    accumulatedTime += trackDuration;
                }

                return new Response(
                    JSON.stringify({
                        success: true,
                        currentTrack: activeTrack,
                        seekOffset: seekOffset,
                        playlist: playlist
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            ...corsHeaders,
                        },
                    }
                );
            } catch (err) {
                return new Response(
                    JSON.stringify({ success: false, error: err.message }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }
        }
        // Pour les autres routes nécessitant une auth, tu laisses ta vérification ici...
    },
};