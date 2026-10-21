document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    // Charger le contenu HTML de la sidebar
    fetch("/assets/sidebar/sidebar.html")
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            initAuthSection();
        })
        .catch(err => console.error("Erreur de chargement de la sidebar :", err));
});

function initAuthSection() {
    const authSection = document.getElementById("auth-section");
    if (!authSection) return;

    // Simulation de vérification de session (ex: localStorage ou Firebase Auth)
    // Remplace cette logique par ta vraie vérification (ex: localStorage.getItem('user'))
    const loggedUser = localStorage.getItem("mm_user"); // Format attendu: objet JSON ou nom/prénom

    if (loggedUser) {
        // Si connecté : affiche le nom et prénom
        const user = JSON.parse(loggedUser);
        authSection.innerHTML = `
            <div class="user-profile">
                <span>👤 ${user.prenom} ${user.nom}</span>
            </div>
        `;
    } else {
        // Si déconnecté : affiche les boutons Connexion / Inscription en popup
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="#" id="open-login" class="btn-auth btn-login">Connexion</a>
                <a href="#" id="open-signup" class="btn-auth btn-signup">S'inscrire</a>
            </div>
        `;

        const openPopup = (e) => {
            e.preventDefault();
            // Ouvre login.html dans une petite fenêtre popup centrée
            const width = 450;
            const height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            window.open(
                "/login.html",
                "ConnexionMMP",
                `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
            );
        };

        document.getElementById("open-login").addEventListener("click", openPopup);
        document.getElementById("open-signup").addEventListener("click", openPopup);
    }
}