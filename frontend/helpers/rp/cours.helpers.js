import {
  createCoursCards,
  updateCoursCardsData,
} from "../../components/card/cardPaginated.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";

import { getAllCours } from "../../services/coursService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderCoursCardsRp(filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des cours...");

    // 1. Récupération des données
    let cours = await getAllCours();
    console.log(cours);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      cours = cours.filter(
        (c) =>
          c.module.nom_module.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    if (filters.semestre) {
      cours = cours.filter((c) => c.semestre.id == filters.semestre);
    }

    if (filters.module) {
      cours = cours.filter((c) => c.module.id == filters.module);
    }

    if (filters.professeur) {
      cours = cours.filter((c) => c.professeur.id == filters.professeur);
    }

    // 3. Configuration des actions
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        if (item.statut === "annuler") {
          return [
            {
              name: "restore",
              label: "Restaurer",
              icon: "ri-arrow-go-back-line",
              className: "text-success",
              type: "direct",
              showLabel: true,
            },
          ];
        }
        return [
          {
            name: "edit",
            label: "Modifier",
            icon: "ri-edit-line",
            className: "text-info",
          },
          {
            name: "archive",
            label: "Archiver",
            icon: "ri-archive-line",
            className: "text-error",
          },
          {
            name: "details",
            label: "Détails",
            icon: "ri-eye-line",
            className: "text-primary",
          },
        ];
      },
    };

    // 4. Gestion des actions
    const handleAction = async (action, id) => {
      const coursItem = cours.find((c) => c.id_cours == id);

      switch (action) {
        case "edit":
          console.log(id);
          //   await showEditCoursModal(id);
          break;
        case "archive":
          console.log(id);
          //   showDeleteConfirmation(id, coursItem.module.nom_module);
          break;
        case "details":
          console.log(id);
          //   showCoursDetailsModal(coursItem);
          break;
      }
    };

    // 5. Création du composant Cards
    const cardsContainer = createCoursCards({
      containerId: "cours-cards",
      data: cours,
      actions: actionsConfig,
      onAction: handleAction,
      itemsPerPage: 4,
      emptyMessage: "Aucun cours trouvé",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("cours-container");
    container.innerHTML = "";
    container.appendChild(cardsContainer);

    loadingModal.close();

    // 7. Mise à jour initiale
    updateCoursCardsData("cours-cards", cours, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des cours");
  }
}
