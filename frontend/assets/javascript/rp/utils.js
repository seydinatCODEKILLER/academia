import { createResponsiveRPHeader } from "../../../components/header/headerRp.js";
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
        path: "/frontend/pages/rp/dashboard.html",
        icon: "ri-home-3-line",
      },
      {
        text: "Gestions classes",
        path: "/frontend/pages/rp/classe.html",
        icon: "ri-archive-line",
      },
      {
        text: "Professeurs",
        path: "/frontend/pages/rp/professeurs.html",
        icon: "ri-group-3-line",
      },
      {
        text: "Gestion cours",
        path: "/frontend/pages/rp/cours.html",
        icon: "ri-megaphone-line",
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

export function renderRpHeader(user, currentPage = "Dashboard") {
  const header = createResponsiveRPHeader({
    currentPage: currentPage,
    userName: user.prenom,
  });
  document.getElementById("header").appendChild(header);
}
