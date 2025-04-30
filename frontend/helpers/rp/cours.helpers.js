import {
  createCoursCards,
  updateCoursCardsData,
} from "../../components/card/cardPaginated.js";
import { createCoursFiltersForRp } from "../../components/filter/filter.js";
import { createCoursForm } from "../../components/form/form.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { createFloatingButton } from "../../components/ui/floatingButton.js";
import { handleCoursRpSubmit } from "../../handler/rp/coursRp.handler.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";

import {
  getAllCours,
  getCoursById,
  handleArchiveCours,
  handleCancelCours,
  handleRestoreCours,
} from "../../services/coursService.js";
import { getAllSemestres } from "../../services/semestreService.js";
import {
  showConfirmationModal,
  showLoadingModal,
} from "../attacher/justificationHelpers.js";

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
          c.module.libelle.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    if (filters.semestre) {
      cours = cours.filter((c) => c.semestre.id == filters.semestre);
    }

    if (filters.annee) {
      cours = cours.filter((c) => c.semestre.annee_scolaire == filters.annee);
    }

    // 3. Configuration des actions
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        if (item.statut === "annuler") {
          return [
            {
              name: "archive",
              label: "Archiver",
              icon: "ri-archive-line",
              className: "text-error",
              type: "direct",
              showLabel: true,
            },
            {
              name: "restore",
              label: "Restorer",
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
            name: "annuler",
            label: "Annuler",
            icon: "ri-close-line",
            icon: "ri-archive-line",
            className: "text-error",
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
          await showEditCoursModalRp(id);
          break;
        case "archive":
          console.log(id);
          showArchiveCoursConfirmation(id);
          break;
        case "restore":
          console.log(id);
          showRestoreCoursConfirmation(id);
          break;
        case "annuler":
          console.log(id);
          showCancelCoursConfirmation(id);
          break;
      }
    };

    // 5. Création du composant Cards
    const cardsContainer = createCoursCards({
      containerId: "cours-cards",
      data: cours,
      actions: actionsConfig,
      onAction: handleAction,
      itemsPerPage: 3,
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

export async function renderCoursCardFilterForRp() {
  const [semestres, anneesScolaires] = await Promise.all([
    getAllSemestres(),
    getAllAnneesScolaires(),
  ]);
  const filters = createCoursFiltersForRp({
    semestres,
    anneesScolaires,
    onFilter: (filters) => updateCoursCardWithFiltersForRp(filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateCoursCardWithFiltersForRp(filters = {}) {
  await renderCoursCardsRp(filters);
}

export function renderFloatingButtonAddCours() {
  const button = createFloatingButton({
    id: "quick-add-btn",
    icon: "ri-add-line",
    title: "Création rapide",
    color: "warning",
    position: "bottom-right",
    onClick: async () => await showAddCoursModalRp(),
  });

  document.getElementById("floatingButton").appendChild(button);
}

export async function showAddCoursModalRp() {
  const form = await createCoursForm();
  const modal = createModal({
    title: "Ajouter une nouvelle cours",
    content: form,
    size: "xl",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleCoursRpSubmit(form);
    if (result.success) {
      modal.close();
      await renderCoursCardsRp();
    }
  };

  document.getElementById("modal-cours-container").appendChild(modal);
  modal.showModal();
}

export async function showEditCoursModalRp(id) {
  const existingCours = await getCoursById(id);
  console.log(existingCours);

  const form = await createCoursForm(existingCours);
  const modal = createModal({
    title: "Modifier le cours",
    content: form,
    size: "xl",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleCoursRpSubmit(form, existingCours);
    if (result.success) {
      modal.close();
      await renderCoursCardsRp();
    }
  };

  document.getElementById("modal-cours-container").appendChild(modal);
  modal.showModal();
}

function showCancelCoursConfirmation(courId) {
  showConfirmationModal({
    title: `Annuler le cours`,
    content: "Cette cours ne sera plus disponible.",
    confirmText: "Annuler le cours",
    confirmClass: "btn-warning",
    onConfirm: async () => {
      const loading = showLoadingModal("Annulation en cours...");
      try {
        await handleCancelCours(courId);
        await renderCoursCardsRp();
      } catch (error) {
        showEmptyStateModal("Erreur lors de l'annulation du cours");
      } finally {
        loading.close();
      }
    },
  });
}

function showRestoreCoursConfirmation(courId) {
  showConfirmationModal({
    title: `Restorer le cours`,
    content: "Cette cours sera de nouveau disponible.",
    confirmText: "Restorer le cours",
    confirmClass: "btn-success",
    onConfirm: async () => {
      const loading = showLoadingModal("Restauration en cours...");
      try {
        await handleRestoreCours(courId);
        await renderCoursCardsRp();
      } catch (error) {
        showEmptyStateModal("Erreur lors de la restauration du cours");
      } finally {
        loading.close();
      }
    },
  });
}

function showArchiveCoursConfirmation(courId) {
  showConfirmationModal({
    title: `Archiver le cours`,
    content: "Cette cours sera plus disponible",
    confirmText: "Archiver le cours",
    confirmClass: "btn-error",
    onConfirm: async () => {
      const loading = showLoadingModal("Annulation en cours...");
      try {
        await handleArchiveCours(courId);
        await renderCoursCardsRp();
      } catch (error) {
        showEmptyStateModal("Erreur lors de l'archivage du cours");
      } finally {
        loading.close();
      }
    },
  });
}
