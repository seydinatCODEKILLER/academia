import { showEmptyStateModal } from "../../components/modals/modal.js";
import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import { getCurrentAcademicYearId } from "../../services/annees_scolaireService.js";
import { createClasse } from "../../services/classeServices.js";
import { validateClassData } from "../../validations/validation.js";

export async function handleClassRpSubmit(formElement) {
  const loadingModal = showLoadingModal("Création de la classe...");
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);
    const data = {
      libelle: formData.get("libelle"),
      id_filiere: formData.get("id_filiere"),
      id_niveau: formData.get("id_niveau"),
      capacite_max: formData.get("capacite_max"),
      state: "disponible",
      id_annee: await getCurrentAcademicYearId(),
    };

    const result = await submitClasseData(data);
    loadingModal.close();
    return {
      success: true,
      data: { libelle: result.classeCreated.libelle },
    };
  } catch (error) {
    loadingModal.close();
    if (error.name === "ValidationError") {
      showFormErrors(formElement, error.errors);
      return { success: false, errors: error.errors };
    }
    showEmptyStateModal(
      "Une erreur est survenue lors de la creation de la classe"
    );
    return { success: false };
  }
}

async function submitClasseData(data) {
  const errors = await validateClassData(data);
  if (errors) throw { name: "ValidationError", errors };
  const classeCreated = createClasse(data);
  return { classeCreated };
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
