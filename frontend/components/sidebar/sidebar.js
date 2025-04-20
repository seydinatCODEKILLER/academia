import { setupLogout } from "../../router/router.js";

/**
 * Crée une sidebar personnalisable
 * @param {Object} options - Configuration de la sidebar
 * @param {Object} options.logo - Configuration du logo
 * @param {string} options.logo.icon - Classe de l'icône du logo
 * @param {string} options.logo.text - Texte du logo
 * @param {Object} options.user - Info utilisateur
 * @param {string} options.user.avatar - URL de l'avatar
 * @param {string} options.user.role - Rôle de l'utilisateur
 * @param {string} options.user.name - Nom complet de l'utilisateur
 * @param {Array} options.links - Liste des liens de navigation
 * @param {Function} options.onLogout - Callback pour la déconnexion
 * @param {Function} options.onNavigate - Callback pour la navigation
 * @returns {HTMLElement} L'élément sidebar
 */
export function createSidebar(options) {
  // Options par défaut
  const config = {
    logo: {
      icon: "ri-funds-fill",
      text: "Academica.co",
    },
    user: {
      avatar: "",
      role: "",
      name: "",
    },
    links: [],
    onLogout: () => setupLogout(),
    onNavigate: () => {},
    ...options,
  };

  // Création de l'élément principal
  const sidebar = document.createElement("div");
  sidebar.id = "sidebar";
  sidebar.className =
    "flex flex-col justify-between p-3 fixed left-0 shadow-md h-full bg-white text-gray-900 w-64 lg:w-52 md:flex transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0 z-50";

  // Construction des parties de la sidebar
  const header = createSidebarHeader(config.logo);
  const nav = createSidebarNavigation(config.links, config.onNavigate);
  const footer = createSidebarFooter(config.user, config.onLogout);

  // Assemblage
  const contentContainer = document.createElement("div");
  contentContainer.className = "flex flex-col gap-6";
  contentContainer.appendChild(header);
  contentContainer.appendChild(nav);

  sidebar.appendChild(contentContainer);
  sidebar.appendChild(footer);

  return sidebar;
}

/**
 * Crée l'en-tête de la sidebar
 */
function createSidebarHeader(logoConfig) {
  const header = document.createElement("div");
  header.className = "flex justify-between";

  // Logo
  const logo = document.createElement("div");
  logo.className = "flex items-center gap-2 text-md";
  logo.innerHTML = `
    <i class="${logoConfig.icon} text-xl"></i>
    <span class="font-medium">${logoConfig.text}</span>
  `;

  // Bouton fermeture (mobile)
  const closeBtn = document.createElement("div");
  closeBtn.className = "lg:hidden";
  closeBtn.id = "sidebar-close";
  closeBtn.innerHTML =
    '<i class="ri-layout-right-line text-lg font-semibold"></i>';
  closeBtn.addEventListener("click", toggleSidebar);

  header.appendChild(logo);
  header.appendChild(closeBtn);

  return header;
}

/**
 * Crée la navigation de la sidebar
 */
function createSidebarNavigation(links, onNavigate) {
  const nav = document.createElement("nav");
  const ul = document.createElement("ul");
  ul.className = "flex flex-col gap-1";

  links.forEach((link) => {
    const li = document.createElement("li");
    li.className = `py-2 px-4 hover:bg-gray-50 hover:rounded ${
      link.active ? "bg-purple-50 border border-purple-400" : ""
    }`;

    const a = document.createElement("a");
    a.href = link.path || "#";
    a.className = "font-medium gap-3 flex items-center text-sm";
    a.innerHTML = `
      <i class="${link.icon} text-lg"></i>
      <span>${link.text}</span>
    `;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      onNavigate(link.path);
      setActiveLink(link.path);
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  return nav;
}

/**
 * Crée le pied de page de la sidebar
 */
function createSidebarFooter(user, onLogout) {
  const footer = document.createElement("div");
  footer.className = "flex items-center justify-between ";

  // Info utilisateur
  const userInfo = document.createElement("div");
  userInfo.className = "flex gap-1";
  userInfo.innerHTML = `
    <img src="${user.avatar}" alt="Avatar" class="w-10 h-10 rounded object-cover">
    <div class="flex flex-col">
      <span class="text-sm text-purple-500 font-medium">${user.role}</span>
      <p class="font-medium text-gray-800 text-sm">${user.name}</p>
    </div>
  `;

  // Menu dropdown
  const dropdown = document.createElement("div");
  dropdown.className =
    "dropdown dropdown-top w-10 h-10 flex justify-center items-center hover:bg-gray-50 hover:rounded border border-gray-200";
  dropdown.innerHTML = `
    <i class="ri-expand-up-down-line" tabindex="0" role="button"></i>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-44 p-2 shadow-sm">
      <li>
        <a href="#/profile" class="text-sm font-semibold border-b border-gray-100">
          <i class="ri-settings-2-line font-medium"></i>
          <span>Mon compte</span>
        </a>
      </li>
      <li>
        <a id="logoutBtn" class="text-sm font-semibold logout-btn">
          <i class="ri-logout-box-r-line font-medium"></i>
          <span>Déconnexion</span>
        </a>
      </li>
    </ul>
  `;

  // Gestion du logout
  dropdown.querySelector(".logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    onLogout();
  });

  footer.appendChild(userInfo);
  footer.appendChild(dropdown);

  return footer;
}

/**
 * Bascule l'affichage de la sidebar (mobile)
 */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("-translate-x-full");
  }
}

/**
 * Met à jour le lien actif dans la sidebar
 */
export function setActiveLink(path) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  // Retirer active de tous les liens
  sidebar.querySelectorAll("li").forEach((li) => {
    li.classList.remove("bg-purple-50", "border-purple-400");
  });

  // Ajouter active au lien correspondant
  const activeLink = sidebar.querySelector(`a[href="${path}"]`);
  if (activeLink) {
    activeLink.parentElement.classList.add(
      "bg-purple-50",
      "border",
      "rounded",
      "border-purple-400"
    );
  }
}
