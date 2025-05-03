import {
  createProfessorClassesCards,
  updateProfessorClassesCardsData,
} from "../../components/card/cardClasses.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import { getProfessorClassesBasic } from "../../services/professeurService.js";
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
        c.filieres.toLowerCase().includes(searchTerm)
      );
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
          await showDetailsClasseModal(id, idProfesseur);
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
      itemsPerPage: 4,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune absence enregistrée pour cet étudiant",
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
