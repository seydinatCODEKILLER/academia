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
    return navigateToAndReplace(loginPage);
  }

  if (!ROLE_PATHS[user.id_role]) {
    console.error("Rôle utilisateur invalide :", user.id_role);
    return navigateToAndReplace(loginPage);
  }

  const userBasePath = `${basePath}${ROLE_PATHS[user.id_role]}`;
  if (!currentPath.startsWith(userBasePath)) {
    console.warn(`Accès non autorisé : ${currentPath}`);
    return navigateToAndReplace(`${userBasePath}dashboard.html`);
  }
}

export function setupLogout() {
  clearUser();
  navigateToAndReplace(getEnvironmentConfig().loginPage);
}

export function navigateTo(path) {
  window.location.href = path;
}

export function navigateToAndReplace(path) {
  window.location.replace(path);
}
