import {
  createCoursCardsProfessor,
  updateCoursCardsDataProfessor,
} from "../../components/card/cardCours.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import { getProfessorWeeklyCourses } from "../../services/professeurService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderCoursCardsProfeesor(idProfessor, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des cours...");

    // 1. Récupération des données
    let cours = await getProfessorWeeklyCourses(idProfessor, 0);
    console.log(cours);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      cours = cours.filter((c) =>
        c.module.libelle.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.statut) {
      cours = cours.filter((c) => c.statut == filters.statut);
    }

    // 3. Configuration des actions
    const actionsConfig = {
      items: (item) => {
        return [
          {
            name: "absence",
            label: "Marquer absence",
            icon: "ri-user-unfollow-line",
            className: "text-neutral",
            showLabel: true,
            type: "direct",
          },
        ];
      },
    };

    // 4. Gestion des actions
    const handleAction = async (action, id) => {
      switch (action) {
        case "absence":
          console.log(id);
          break;
      }
    };

    // 5. Création du composant Cards
    const cardsContainer = createCoursCardsProfessor({
      containerId: "cours-cards",
      data: cours,
      onAction: handleAction,
      actions: actionsConfig,
      itemsPerPage: 3,
      emptyMessage: "Aucun cours trouvé",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("cours-container");
    container.innerHTML = "";
    container.appendChild(cardsContainer);
    loadingModal.close();

    // 7. Mise à jour initiale
    updateCoursCardsDataProfessor("cours-cards", cours, 1);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des cours");
  }
}
