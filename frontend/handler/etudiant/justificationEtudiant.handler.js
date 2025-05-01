import { showEmptyStateModal } from "../../components/modals/modal.js";
import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import { updateAbsenceStatus } from "../../services/absenceService.js";
import { saveJustification } from "../../services/justificationService.js";
import { validateJustificationData } from "../../validations/validation.js";

export async function handleJustificationSubmit(
  formElement,
  absenceId,
  idEtudiant
) {
  const loadingModal = showLoadingModal("Envoi de la justification...");
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);
    const justificationData = {
      id_absence: absenceId,
      id_etudiant: idEtudiant,
      motif: formData.get("motif"),
    };

    const result = await submitJustificationData(justificationData);

    loadingModal.close();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    loadingModal.close();

    if (error.name === "ValidationError") {
      showFormErrors(formElement, error.errors);
      return { success: false, errors: error.errors };
    }

    showEmptyStateModal(
      `Une erreur est survenue lors de l'envoi de la justification: ${error.message}`
    );
    return { success: false };
  }
}

async function submitJustificationData(justificationData) {
  try {
    const errors = validateJustificationData(justificationData);
    if (errors) throw { name: "ValidationError", errors };
    const payload = {
      id_absence: justificationData.id_absence,
      motif: justificationData.motif,
      id_etudiant: justificationData.id_etudiant,
      date_justification: new Date().toISOString(),
      statut: "en attente",
      id_traitant: null,
      pieces_jointes: null,
      date_traitement: null,
      commentaire_traitement: null,
    };
    const justificationCreated = await saveJustification(payload);
    await updateAbsenceStatus(justificationData.id_absence);
    return justificationCreated;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll("[data-error]");
  errorElements.forEach((element) => {
    element.textContent = "";
    element.classList.add("hidden");
  });
}

function showFormErrors(form, errors = {}) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = form.querySelector(`[data-error="${field}"]`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }
  });
}
