import {
  createAbsenteesCard,
  createStatsCard,
} from "../../../components/card/card.js";
import { createClassFilters } from "../../../components/filter/filter.js";
import { createResponsiveAttacheHeader } from "../../../components/header/header.js";
import {
  createSidebar,
  setActiveLink,
} from "../../../components/sidebar/sidebar.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../../components/table/table.js";
import {
  createModalContent,
  findClassById,
  showClassNotFound,
  showOrUpdateModal,
} from "../../../helpers/attacher/classeHelpers.js";
import { navigateTo, navigateToAndReplace } from "../../../router/router.js";
import { getAllAnneesScolaires } from "../../../services/annees_scolaireService.js";
import {
  getClassesEtEtudiantsParAttache,
  getDashboardStatsAttacher,
  getTop5Absentees,
} from "../../../services/attacherService.js";
import { getAllFilieres } from "../../../services/filiereService.js";
import { createStyledElement } from "../../../utils/function.js";

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

export async function renderAttacheStatsCards(idAttache) {
  const stats = await getDashboardStatsAttacher(idAttache);
  const container = document.createElement("div");
  container.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5";

  const classesCard = createStatsCard({
    title: "Classes gérées",
    value: stats.nombreClasses,
    description: "Total des classes sous votre responsabilité",
    icon: "ri-building-line",
    color: "purple",
    onClick: () => navigateToAndReplace("/frontend/pages/attache/classe.html"),
  });

  const justificationsCard = createStatsCard({
    title: "Justifications",
    value: stats.justificationsEnAttente,
    description: "En attente de validation",
    icon: "ri-hourglass-fill",
    color: "orange",
    onClick: () => navigateTo("/frontend/pages/attache/justifications.html"),
  });

  const studentsCard = createStatsCard({
    title: "Étudiants",
    value: stats.nombreEtudiants,
    description: "Étudiants dans vos classes",
    icon: "ri-user-line",
    color: "green",
    onClick: () => navigateTo("/frontend/pages/attache/etudiant.html"),
  });

  container.appendChild(classesCard);
  container.appendChild(justificationsCard);
  container.appendChild(studentsCard);
  document.getElementById("stats-section").appendChild(container);
}

export function renderAttacheHeader(user) {
  const header = createResponsiveAttacheHeader({
    currentPage: "Dashboard",
    userName: user.prenom,
    notificationCount: 2,
  });
  document.getElementById("header").appendChild(header);
}

export async function renderAbsenteesCard(idAttache) {
  try {
    // Récupérer les données
    const absentees = await getTop5Absentees(idAttache);

    // Créer la carte
    const card = createAbsenteesCard({
      absentees,
      onStudentClick: (student) => {
        console.log("Élève sélectionné:", student);
      },
    });

    document.getElementById("absentees-section").appendChild(card);
  } catch (error) {
    console.error("Erreur création carte absences:", error);

    // Retourner une carte d'erreur
    const errorCard = document.createElement("div");
    errorCard.className =
      "bg-white rounded-lg shadow-sm p-6 text-center text-red-500";
    errorCard.textContent = "Erreur de chargement des données";
    document.getElementById("absentees-section").appendChild(errorCard);
  }
}

export function renderCalendar() {
  const calendar = document.createElement("div");
  calendar.innerHTML = `
  <calendar-date class="cally bg-base-100 border border-base-300 shadow-sm rounded-box w-full">
                <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                </svg>
                <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg>
                <calendar-month></calendar-month>
            </calendar-date>
  `;
  document.getElementById("calendar").appendChild(calendar);
}

export async function renderClassesTable(idAttache, filters = {}) {
  let classes = await getClassesEtEtudiantsParAttache(idAttache);

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    classes = classes.filter((classe) =>
      classe.libelle.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.filiere) {
    console.log(filters.filiere);

    classes = classes.filter((classe) => classe.idFiliere == filters.filiere);
  }

  if (filters.annee) {
    classes = classes.filter((classe) => classe.idAnnee == filters.annee);
  }

  const columns = [
    {
      header: "Classe",
      key: "libelle",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.libelle),
    },
    {
      header: "Niveau",
      key: "nomNiveau",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.nomNiveau),
    },
    {
      header: "Filiere",
      key: "nomFiliere",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.nomFiliere),
    },
    {
      header: "Capacité",
      key: "capacite_max",
      render: (classe) =>
        createStyledElement("span", "badge badge-soft ", classe.capacite_max),
    },
    {
      header: "Statut",
      key: "statut",
      render: (classe) => createStyledElement("span", `badge`, classe.statut),
    },
  ];
  // Configuration des actions (juste un bouton Détails)
  const actionsConfig = {
    type: "direct",
    idField: "id_classe", // Champ unique pour tout le tableau
    items: [
      {
        name: "details",
        label: "Détails",
        icon: "ri-eye-line",
        className: "btn-sm btn-primary",
        showLabel: true,
      },
    ],
  };

  const table = createDaisyUITable({
    tableId: "classes-table",
    columns,
    itemsPerPage: 2,
    data: classes,
    actions: actionsConfig,
    onAction: (action, id) => {
      if (action === "details") {
        showClassDetails(id, classes);
      }
    },
  });
  const container = document.getElementById("classes-container");
  container.innerHTML = "";
  container.appendChild(table);
  updateDaisyUITableData("classes-table", classes, 1, (action, id) => {
    if (action === "details") {
      showClassDetails(id, classes);
    }
  });
}

export function showClassDetails(classId, allClasses) {
  const classe = findClassById(classId, allClasses);
  if (!classe) {
    showClassNotFound();
    return;
  }

  const modalContent = createModalContent(classe);
  showOrUpdateModal(modalContent, classe.libelle);
}

export async function updateClassesTableWithFilters(idAttache, filters = {}) {
  await renderClassesTable(idAttache, filters);
}

export async function renderClasseTableFilter(idAttacher) {
  const [filieres, anneesScolaires] = await Promise.all([
    getAllFilieres(),
    getAllAnneesScolaires(),
  ]);
  const filters = createClassFilters({
    filieres,
    anneesScolaires,
    idAttache: idAttacher,
    onFilter: (filters) => updateClassesTableWithFilters(idAttacher, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}
