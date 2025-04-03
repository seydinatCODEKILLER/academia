import {
  clearUser,
  getCurrentUser,
  setCurrentUserRole,
} from "../store/authStore.js";

const getEnvironmentConfig = () => {
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return {
    basePath: isLocal ? "/frontend/" : "",
    loginPage: isLocal ? "/frontend/index.html" : "/index.html",
  };
};

const ROLE_PATHS = {
  1: "pages/rp/",
  2: "pages/professeurs/",
  3: "pages/attache/",
  4: "pages/etudiant/",
};

export function initRouter() {
  const { basePath, loginPage } = getEnvironmentConfig();
  const user = getCurrentUser();
  let currentPath = window.location.pathname;

  if (!user) {
    return navigateTo(loginPage);
  }

  if (!ROLE_PATHS[user.id_role]) {
    console.error("Rôle utilisateur invalide :", user.id_role);
    return navigateTo(loginPage);
  }

  const userBasePath = `${basePath}${ROLE_PATHS[user.id_role]}`;
  if (!currentPath.startsWith(userBasePath)) {
    console.warn(`Accès non autorisé : ${currentPath}`);
    return navigateTo(`${userBasePath}dashboard.html`);
  }

  setupLogout();
}

function setupLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearUser();
    navigateTo(getEnvironmentConfig().loginPage);
  });
}

export function navigateTo(path) {
  window.location.replace(path);
}
