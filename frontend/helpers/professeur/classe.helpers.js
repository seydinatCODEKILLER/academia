import { createIllustratedBanner } from "../../components/banner/banner.js";
import { renderStudentCardForProfessor } from "../../components/card/card.js";
import {
  createProfessorClassesCards,
  updateProfessorClassesCardsData,
} from "../../components/card/cardClasses.js";
import { createClasseFiltersForProfessor } from "../../components/filter/filter.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { getActionsConfigClasses } from "../../config/professor.config.js";
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import {
  getProfessorClassesBasic,
  getProfessorClassesDetailed,
} from "../../services/professeurService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

const createClassesActionHandler = (idProfesseur) => ({
  details: async (id) => {
    console.log("details clicked", id);
    await showClassDetailsModal(id, idProfesseur);
  },
});

const filterClasses = (classes, filters) => {
  let filtered = [...classes];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter((c) =>
      c.libelle.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.filiere) {
    filtered = filtered.filter((c) => c.filiere === filters.filiere);
  }

  if (filters.niveau) {
    filtered = filtered.filter((c) => c.niveau === filters.niveau);
  }

  return filtered;
};

const renderClassesCards = (classes, idProfesseur, containerId) => {
  const actionHandler = createClassesActionHandler(idProfesseur);

  return createProfessorClassesCards({
    containerId,
    data: classes,
    onAction: (action, id) => actionHandler[action]?.(id),
    actions: getActionsConfigClasses(),
    itemsPerPage: 3,
    emptyMessage: "Aucune classe enregistrée pour cet professeur",
  });
};

export const renderClasseCardProfesseur = async (
  idProfesseur,
  filters = {}
) => {
  const loadingModal = showLoadingModal("Chargement des classes...");
  const container = document.getElementById("classes-container");

  try {
    // 1. Récupération des données
    const classes = await getProfessorClassesBasic(idProfesseur);
    console.log(classes);

    // 2. Filtrage
    const filteredClasses = filterClasses(classes, filters);

    // 3. Rendu
    container.innerHTML = "";
    const cards = renderClassesCards(
      filteredClasses,
      idProfesseur,
      "classes-cards"
    );
    container.appendChild(cards);

    // 4. Mise à jour initiale
    updateProfessorClassesCardsData("classes-cards", filteredClasses, 1);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des classes", error.message);
  } finally {
    loadingModal.close();
  }
};

export async function renderClasseCardFilterForProfessor(idProfesseur) {
  const [filieres, niveaux] = await Promise.all([
    getAllFilieres(),
    getAllNiveaux(),
  ]);
  const filters = createClasseFiltersForProfessor({
    filieres,
    niveaux,
    onFilter: (filters) =>
      updateClasseCardWithFiltersForProfessor(idProfesseur, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateClasseCardWithFiltersForProfessor(
  idProfesseur,
  filters = {}
) {
  await renderClasseCardProfesseur(idProfesseur, filters);
}

export function renderClasseBannerForProfessor() {
  const hero = createIllustratedBanner({
    title: "Suivez vos classes en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/class.svg",
    bgColor: "bg-gray-700",
    textColor: "text-white",
  });
  document.getElementById("banner-container").appendChild(hero);
}

const createClassInfoSection = (classe) => {
  const section = document.createElement("div");
  section.className = "space-y-4";

  section.innerHTML = `
    <h3 class="font-bold text-lg">Informations de base</h3>
    <div>
      <label class="text-sm text-gray-500">Filière</label>
      <p class="font-medium">${classe.filiere?.libelle || "Non renseignée"}</p>
    </div>
    <div>
      <label class="text-sm text-gray-500">Niveau</label>
      <p class="font-medium">${classe.niveau?.libelle || "Non renseigné"}</p>
    </div>
    <div>
      <label class="text-sm text-gray-500">Année scolaire</label>
      <p class="font-medium">${
        classe.annee_scolaire?.libelle || "Non renseignée"
      }</p>
    </div>
  `;

  return section;
};

const createStatsSection = (classe) => {
  const section = document.createElement("div");
  section.className = "space-y-4";

  section.innerHTML = `
    <h3 class="font-bold text-lg">Statistiques</h3>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Capacité</div>
        <div class="stat-value">${classe.capacite_max}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Étudiants</div>
        <div class="stat-value">${classe.nombre_etudiants}</div>
      </div>
    </div>
  `;

  return section;
};

const createStudentsSection = (etudiants) => {
  const section = document.createElement("div");
  section.className = "mt-8";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = `Étudiants inscrits (${etudiants.length})`;
  section.appendChild(title);

  if (etudiants.length > 0) {
    const grid = document.createElement("div");
    grid.className =
      "grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-44";

    etudiants.forEach((etudiant, index) => {
      grid.appendChild(renderStudentCardForProfessor(etudiant, index));
    });

    section.appendChild(grid);
  } else {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "text-gray-500";
    emptyMsg.textContent = "Aucun étudiant inscrit dans cette classe";
    section.appendChild(emptyMsg);
  }

  return section;
};

const buildClassDetailsModalContent = (classe) => {
  const content = document.createElement("div");

  // Section info + stats
  const infoStatsContainer = document.createElement("div");
  infoStatsContainer.className = "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8";
  infoStatsContainer.appendChild(createClassInfoSection(classe));
  infoStatsContainer.appendChild(createStatsSection(classe));

  content.appendChild(infoStatsContainer);
  content.appendChild(createStudentsSection(classe.etudiants));

  return content;
};

export const showClassDetailsModal = async (classId, idProfesseur) => {
  const loadingModal = showLoadingModal("Chargement des détails...");

  try {
    const classe = await getProfessorClassesDetailed(idProfesseur, classId);
    console.log(classe);

    if (!classe) {
      showEmptyStateModal("Classe introuvable");
      return;
    }

    const modal = createModal({
      title: `Détails de la classe ${classe.libelle}`,
      size: "3xl",
      content: buildClassDetailsModalContent(classe),
      scrollable: true,
    });

    document.getElementById("modal-classes-container").appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des détails");
  } finally {
    loadingModal.close();
  }
};
