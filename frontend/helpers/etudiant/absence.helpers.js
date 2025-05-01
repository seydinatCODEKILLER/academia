import {
  createAbsenceCards,
  updateAbsenceCardsData,
} from "../../components/card/cardAbsence.js";
import { createJustificationForm } from "../../components/form/form.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { getStudentAbsences } from "../../services/etudiantService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderAbsenceCardEtudiant(idEtudiant, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des absences...");
    const absencesData = await getStudentAbsences(idEtudiant);
    console.log(absencesData);

    // 2. Configurer les actions possibles
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        if (item.statut === "archiver") {
          return [
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
            name: "details",
            label: "Details",
            icon: "ri-information-line",
            className: "text-info",
          },
          {
            name: "justifier",
            label: " Justifier",
            icon: "ri-check-line",
            className: "text-error",
          },
        ];
      },
    };

    const handleAction = async (action, id) => {
      switch (action) {
        case "details":
          alert(`details clicked ${id}`);
          break;
        case "justifier":
          await showAddJustificationsModalEtudiant(id, idEtudiant);
          break;
        case "restore":
          console.log(id);
          break;
      }
    };

    // 3. Créer le composant d'affichage
    const absenceCards = createAbsenceCards({
      containerId: "absence-cards",
      data: absencesData,
      itemsPerPage: 4,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune absence enregistrée pour cet étudiant",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("absence-container");
    container.innerHTML = "";
    container.appendChild(absenceCards);

    loadingModal.close();
    updateAbsenceCardsData("absence-cards", absencesData, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal(
      "Erreur lors du chargement des absences",
      error.message
    );
  }
}

export async function showAddJustificationsModalEtudiant(
  absenceId,
  idEtudiant
) {
  const absences = await getStudentAbsences(idEtudiant);
  const absence = absences.find((a) => a.id_absence === absenceId);

  if (!absence) {
    throw new Error("Absence introuvable");
  }

  const form = await createJustificationForm(absence);
  const modal = createModal({
    title: "Demande de justification d'absence",
    content: form,
    size: "lg",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleJustificationSubmit(form, absenceId);

    if (result.success) {
      modal.close();
      await renderAbsenceCardEtudiant(absence.id_etudiant);
    }
  };

  document.getElementById("modal-absence-container").appendChild(modal);
  modal.showModal();
}
