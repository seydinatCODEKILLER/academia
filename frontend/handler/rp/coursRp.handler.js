import { showEmptyStateModal } from "../../components/modals/modal.js";
import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import {
  createCours,
  createCoursClasse,
  deleteCoursClasse,
  getClassesForCours,
} from "../../services/coursService.js";
import { calculateHeures } from "../../utils/function.js";
import { validateCoursData } from "../../validations/validation.js";

export async function handleCoursRpSubmit(formElement, existingCours = null) {
  const loadingModal = showLoadingModal(
    existingCours ? "Modification du cours..." : "Création du cours..."
  );
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);
    const coursData = {
      id_module: formData.get("id_module"),
      id_professeur: formData.get("id_professeur"),
      id_semestre: formData.get("id_semestre"),
      date_cours: formData.get("date_cours"),
      heure_debut: formData.get("heure_debut"),
      heure_fin: formData.get("heure_fin"),
      salle: formData.get("salle"),
      classes: formData.getAll("classes"),
      ...(existingCours ? { id_cours: formData.get("id_cours") } : {}),
    };

    const result = existingCours
      ? await submitCoursUpdateData(coursData)
      : await submitCoursData(coursData);

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
      `Une erreur est survenue lors de ${
        existingCours ? "la modification" : "la création"
      } du cours: ${error.message}`
    );
    return { success: false };
  }
}

async function submitCoursData(coursData) {
  // Validation des données
  const errors = validateCoursData(coursData);
  if (errors) throw { name: "ValidationError", errors };

  // Création du cours
  const coursCreated = await createCours({
    id_module: coursData.id_module,
    id_professeur: coursData.id_professeur,
    id_semestre: coursData.id_semestre,
    date_cours: coursData.date_cours,
    heure_debut: coursData.heure_debut,
    heure_fin: coursData.heure_fin,
    salle: coursData.salle,
    nombre_heures: calculateHeures(coursData.heure_debut, coursData.heure_fin),
    statut: "planifié",
  });

  // Assignation des classes
  await assignClassesToCours(coursCreated.id, coursData.classes);

  return coursCreated;
}

async function submitCoursUpdateData(updatedData) {
  const errors = validateCoursData(updatedData);
  if (errors) throw { name: "ValidationError", errors };

  const coursUpdated = await updateCours({
    id_cours: updatedData.id_cours,
    id_module: updatedData.id_module,
    id_professeur: updatedData.id_professeur,
    id_semestre: updatedData.id_semestre,
    date_cours: updatedData.date_cours,
    heure_debut: updatedData.heure_debut,
    heure_fin: updatedData.heure_fin,
    salle: updatedData.salle,
    nombre_heures: calculateHeures(
      updatedData.heure_debut,
      updatedData.heure_fin
    ),
  });

  await updateCoursClasses(updatedData.id_cours, updatedData.classes);
  return coursUpdated;
}

async function updateCoursClasses(id_cours, newClassesIds) {
  const currentClasses = await getClassesForCours(id_cours);

  const classesToRemove = currentClasses.filter(
    (id) => !newClassesIds.includes(id)
  );
  await Promise.all(
    classesToRemove.map((id_classe) => deleteCoursClasse(id_cours, id_classe))
  );

  const classesToAdd = newClassesIds.filter(
    (id) => !currentClasses.includes(id)
  );
  await assignClassesToCours(id_cours, classesToAdd);
}

async function assignClassesToCours(id_cours, classesIds) {
  return Promise.all(
    classesIds.map((id_classe) =>
      createCoursClasse({
        id_cours,
        id_classe,
      })
    )
  );
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
