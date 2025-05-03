import { createResponsiveRPHeader } from "../components/header/headerRp.js";
import { createSidebar, setActiveLink } from "../components/sidebar/sidebar.js";
import { navigateTo } from "../router/router.js";

export function handleProfSidebar(user) {
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
        path: "/frontend/pages/professeurs/dashboard.html",
        icon: "ri-home-3-line",
      },
      {
        text: "Mes classes",
        path: "/frontend/pages/professeurs/classe.html",
        icon: "ri-archive-line",
      },
      {
        text: "Mes cours",
        path: "/frontend/pages/professeurs/cours.html",
        icon: "ri-group-3-line",
      },
      {
        text: "Gestion absences",
        path: "/frontend/pages/professeurs/absence.html",
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

export function renderProfHeader(user, currentPage = "Dashboard") {
  const header = createResponsiveRPHeader({
    currentPage: currentPage,
    userName: user.prenom,
  });
  document.getElementById("header").appendChild(header);
}
