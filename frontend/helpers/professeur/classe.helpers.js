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
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import {
  getProfessorClassesBasic,
  getProfessorClassesDetailed,
} from "../../services/professeurService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderClasseCardProfesseur(idProfesseur, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des classes...");
    let classes = await getProfessorClassesBasic(idProfesseur);
    console.log(classes);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      classes = classes.filter((c) =>
        c.libelle.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.filiere) {
      classes = classes.filter((classe) => classe.filiere == filters.filiere);
    }
    if (filters.niveau) {
      classes = classes.filter((classe) => classe.niveau == filters.niveau);
    }

    // 2. Configurer les actions possibles
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        return [
          {
            name: "details",
            label: "Details",
            icon: "ri-arrow-go-back-line",
            className: "text-error",
            type: "direct",
            showLabel: true,
          },
        ];
      },
    };

    const handleAction = async (action, id) => {
      switch (action) {
        case "details":
          console.log("details clicked", id);

          await showClasseProfDetailsModal(id, idProfesseur);
          break;
        case "archive":
          alert(`archive clicked ${id}`);
          break;
      }
    };

    // 3. Créer le composant d'affichage
    const classesCards = createProfessorClassesCards({
      containerId: "classes-cards",
      data: classes,
      itemsPerPage: 3,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune classe enregistrée pour cet professeur",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("classes-container");
    container.innerHTML = "";
    container.appendChild(classesCards);

    loadingModal.close();
    updateProfessorClassesCardsData("classes-cards", classes, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des classes", error.message);
  }
}

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

export async function showClasseProfDetailsModal(classId, idProfesseur) {
  const loadingModal = showLoadingModal("Chargement des détails...");

  try {
    const classe = await getProfessorClassesDetailed(idProfesseur, classId);
    console.log(classe);

    if (!classe) {
      showEmptyStateModal("Classe introuvable");
      return;
    }

    const classInfoSection = document.createElement("div");
    classInfoSection.className = "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8";
    classInfoSection.innerHTML = `
      <div class="space-y-4">
        <h3 class="font-bold text-lg">Informations de base</h3>
        <div>
          <label class="text-sm text-gray-500">Filière</label>
          <p class="font-medium">${
            classe.filiere?.libelle || "Non renseignée"
          }</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Niveau</label>
          <p class="font-medium">${
            classe.niveau?.libelle || "Non renseigné"
          }</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Année scolaire</label>
          <p class="font-medium">${
            classe.annee_scolaire?.libelle || "Non renseignée"
          }</p>
        </div>
      </div>
      
      <div class="space-y-4">
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
      </div>
    `;

    const studentsSection = document.createElement("div");
    studentsSection.className = "mt-8";
    studentsSection.innerHTML = `<h3 class="font-bold text-lg mb-4">Étudiants inscrits (${classe.etudiants.length})</h3>`;

    if (classe.etudiants.length > 0) {
      const studentsGrid = document.createElement("div");
      studentsGrid.className =
        "grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-44";

      classe.etudiants.forEach((etudiant, index) => {
        const card = renderStudentCardForProfessor(etudiant, index);
        studentsGrid.appendChild(card);
      });

      studentsSection.appendChild(studentsGrid);
    } else {
      studentsSection.innerHTML += `<p class="text-gray-500">Aucun étudiant inscrit dans cette classe</p>`;
    }

    const modalContent = document.createElement("div");
    modalContent.appendChild(classInfoSection);
    modalContent.appendChild(studentsSection);

    const modal = createModal({
      title: `Détails de la classe ${classe.libelle}`,
      size: "3xl",
      content: modalContent,
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
}
