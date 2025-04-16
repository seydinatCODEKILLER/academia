import {
  createSidebar,
  setActiveLink,
} from "../../../components/sidebar/sidebar.js";
import { navigateTo } from "../../../router/router.js";

export function handleSidebar(user) {
  const { avatar, nom, prenom } = user;
  const sidebar = createSidebar({
    logo: {
      icon: "ri-graduation-cap-fill",
      text: "Ecole 221",
    },
    user: {
      avatar: `${avatar}`,
      role: `${nom}`,
      name: `${prenom}`,
    },
    links: [
      {
        text: "Dashboard",
        path: "/frontend/pages/attache/dashboard.html",
        icon: "ri-home-3-line",
      },
      {
        text: "Mes classes",
        path: "/frontend/pages/attache/classe.html",
        icon: "ri-archive-line",
      },
      {
        text: "Mes etudiants",
        path: "/frontend/pages/attache/etudiant.html",
        icon: "ri-group-3-line",
      },
      {
        text: "Justifications",
        path: "/frontend/pages/attache/justifications.html",
        icon: "ri-megaphone-line",
      },
      {
        text: "Inscription",
        path: "/frontend/pages/attache/inscription.html",
        icon: "ri-file-marked-line",
      },
    ],
    onNavigate: (path) => {
      navigateTo(path);
      setActiveLink(path);
    },
  });
  document.getElementById("sidebar-container").appendChild(sidebar);
  setActiveLink(window.location.pathname);
}
