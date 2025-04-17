import { createModernBanner } from "../../../components/banner/banner.js";
import {
  createAbsenteesCard,
  createStatsCard,
} from "../../../components/card/card.js";
import {
  createAbsencesFilters,
  createClassFilters,
} from "../../../components/filter/filter.js";
import { createResponsiveAttacheHeader } from "../../../components/header/header.js";
import {
  createSidebar,
  setActiveLink,
} from "../../../components/sidebar/sidebar.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../../components/table/table.js";
import { createAbsencesModalContent } from "../../../helpers/attacher/absenceHelpers.js";
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
  getEtudiantsAvecAbsences,
  getTop5Absentees,
} from "../../../services/attacherService.js";
import { getAllFilieres } from "../../../services/filiereService.js";
import { getAllNiveaux } from "../../../services/niveauxServices.js";
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

export function renderAttacheHeader(user, currentPage = "Dashboard") {
  const header = createResponsiveAttacheHeader({
    currentPage: currentPage,
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
      render: (classe) =>
        createStyledElement(
          "span",
          `badge badge-soft badge-${
            classe.statut == "disponible" ? "success" : "warning"
          }`,
          classe.statut
        ),
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

export function renderBannerForClasse() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des classes",
    subtitle: "Consulter et gérez les classe de votre établissement",
    imageUrl: "/frontend/assets/images/main.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}

export async function renderAbsencesTable(idAttache, filters = {}) {
  let etudiants = await getEtudiantsAvecAbsences(idAttache);
  console.log(etudiants);

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    etudiants = etudiants.filter(
      (etudiant) =>
        etudiant.nom.toLowerCase().includes(searchTerm) ||
        etudiant.prenom.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.niveau) {
    console.log(filters.niveau);

    etudiants = etudiants.filter(
      (etudiant) => etudiant.idNiveau == filters.niveau
    );
  }

  const columns = [
    {
      header: "Profil",
      key: "avatar",
      render: (etudiant) => `
      <div>
      <img src="${etudiant.avatar}" class="w-10 h-10 rounded object-cover" />
      </div>
      `,
    },
    {
      header: "Nom",
      key: "nom",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", ` ${etudiant.nom}`),
    },
    {
      header: "Prenom",
      key: "prenom",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", ` ${etudiant.prenom}`),
    },
    {
      header: "Matricule",
      key: "matricule",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm badge badge-soft",
          etudiant.matricule
        ),
    },
    {
      header: "Classe",
      key: "classeLibelle",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", etudiant.classeLibelle),
    },
    {
      header: "Filieres",
      key: "filiereLibelle",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm badge badge-soft badge-info",
          etudiant.filiereLibelle
        ),
    },
  ];

  const actionsConfig = {
    type: "direct",
    idField: "id_etudiant",
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
    tableId: "absences-table",
    columns,
    itemsPerPage: 4,
    data: etudiants,
    actions: actionsConfig,
    onAction: (action, id) => {
      if (action === "details") {
        showAbsencesDetails(id, etudiants);
      }
    },
  });

  const container = document.getElementById("absences-container");
  container.innerHTML = "";
  container.appendChild(table);
  updateDaisyUITableData("absences-table", etudiants, 1, (action, id) => {
    if (action === "details") {
      showAbsencesDetails(id, etudiants);
    }
  });
}

export function showAbsencesDetails(etudiantId, allEtudiants) {
  const etudiant = allEtudiants.find((e) => e.id_etudiant == etudiantId);
  if (!etudiant) {
    showEmptyStateModal("Étudiant introuvable");
    return;
  }

  const modalContent = createAbsencesModalContent(etudiant);
  showOrUpdateModal(modalContent, `${etudiant.prenom} ${etudiant.nom}`);
}

export async function renderAbsencesTableFilter(idAttacher) {
  const [niveaux] = await Promise.all([getAllNiveaux()]);

  const filters = createAbsencesFilters({
    niveaux,
    idAttache: idAttacher,
    onFilter: (filters) => updateAbsencesTableWithFilters(idAttacher, filters),
  });

  document.getElementById("filters-container").appendChild(filters);
}

export async function updateAbsencesTableWithFilters(idAttache, filters = {}) {
  await renderAbsencesTable(idAttache, filters);
}

export function renderBannerForAbsence() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des absences",
    subtitle: "Consulter et gérez les absences de chaque etudiant",
    imageUrl: "/frontend/assets/images/absence.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}
