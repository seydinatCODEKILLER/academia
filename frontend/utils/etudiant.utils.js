import { createResponsiveAttacheHeader } from "../components/header/header.js";
import { createSidebar, setActiveLink } from "../components/sidebar/sidebar.js";
import { navigateTo } from "../router/router.js";

export function handleEtudiantSidebar(user) {
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
        path: "/frontend/pages/etudiant/dashboard.html",
        icon: "ri-home-3-line",
      },
      {
        text: "Mes cours",
        path: "/frontend/pages/etudiant/cours.html",
        icon: "ri-archive-line",
      },
      {
        text: "Mes absences",
        path: "/frontend/pages/etudiant/absence.html",
        icon: "ri-group-3-line",
      },
      {
        text: "Justifications",
        path: "/frontend/pages/etudiant/justification.html",
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

export function renderEtudiantHeader(user, currentPage = "Dashboard") {
  const header = createResponsiveAttacheHeader({
    currentPage: currentPage,
    userName: user.prenom,
    notificationCount: 2,
  });
  document.getElementById("header").appendChild(header);
}
