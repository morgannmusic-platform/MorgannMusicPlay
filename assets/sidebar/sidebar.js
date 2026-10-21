document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    fetch("/assets/sidebar/sidebar.html")
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            initSidebarControls();
            initAuthSection();
        })
        .catch(err => console.error("Erreur de chargement de la sidebar :", err));
});

function initSidebarControls() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const toggleBtn = document.getElementById("mobile-toggle-btn");
    const closeBtn = document.getElementById("mobile-close-btn");

    if (!sidebar || !overlay || !toggleBtn) return;

    const openSidebar = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    toggleBtn.addEventListener("click", openSidebar);
    overlay.addEventListener("click", closeSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    sidebar.querySelectorAll(".sidebar-nav a").forEach(link => {
        link.addEventListener("click", closeSidebar);
    });
}

function initAuthSection() {
    const authSection = document.getElementById("auth-section");
    if (!authSection) return;

    const loggedUser = localStorage.getItem("mm_user");

    if (loggedUser) {
        const user = JSON.parse(loggedUser);
        authSection.innerHTML = `
            <div class="user-profile">
                <span>👤 ${user.prenom} ${user.nom}</span>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="#" id="open-login" class="btn-auth btn-login">Connexion</a>
                <a href="#" id="open-signup" class="btn-auth btn-signup">S'inscrire</a>
            </div>
        `;

        const openPopup = (e) => {
            e.preventDefault();
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

        const loginBtn = document.getElementById("open-login");
        const signupBtn = document.getElementById("open-signup");
        if (loginBtn) loginBtn.addEventListener("click", openPopup);
        if (signupBtn) signupBtn.addEventListener("click", openPopup);
    }
}