import { showEmptyStateModal } from "../../components/modals/modal.js";
import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import { createClassProfesseur } from "../../services/classeServices.js";
import {
  createProfesseur,
  deleteClassProfesseur,
  getClassesByProfessor,
  updateProfesseur,
} from "../../services/professeurService.js";
import { createUser, updateUser } from "../../services/utilisateurService.js";
import { validateProfesseurData } from "../../validations/validation.js";

export async function handleProffRpSubmit(formElement) {
  const loadingModal = showLoadingModal("Création de la professeur...");
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);
    const profData = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      grade: formData.get("grade"),
      specialite: formData.get("specialite"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      avatar: formData.get("avatar"),
      adresse: formData.get("adresse"),
      password: formData.get("password"),
      classes: formData.getAll("classes"),
    };

    const result = await submitProfData(profData);
    loadingModal.close();
    return {
      success: true,
      data: { email: result.userCreated.email },
    };
  } catch (error) {
    loadingModal.close();
    if (error.name === "ValidationError") {
      showFormErrors(formElement, error.errors);
      return { success: false, errors: error.errors };
    }
    showEmptyStateModal(
      `Une erreur est survenue lors de la creation de la professeur ${error}`
    );
    return { success: false };
  }
}

async function submitProfData(professorData) {
  const errors = await validateProfesseurData(professorData);
  if (errors) throw { name: "ValidationError", errors };
  const userCreated = await createUser({
    nom: professorData.nom,
    prenom: professorData.prenom,
    email: professorData.email,
    password: professorData.password,
    id_role: "2",
    telephone: professorData.telephone || "",
    adresse: professorData.adresse || "",
    avatar: professorData.avatar || "default-avatar.jpg",
    state: "disponible",
  });

  const profCreated = await createProfesseur({
    id_utilisateur: userCreated.id,
    specialite: professorData.specialite,
    grade: professorData.grade,
    date_embauche: new Date().toISOString(),
  });
  const classAssignments = await Promise.all(
    professorData.classes.map(async (id_classe) => {
      return await createClassProfesseur({
        id_professeur: profCreated.id,
        id_classe: id_classe,
        date_affectation: new Date().toISOString().split("T")[0],
      });
    })
  );

  return { userCreated };
}

export async function handleProffRpUpdate(formElement, id) {
  const loadingModal = showLoadingModal("Modifications du professeur...");
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);
    const updateData = {
      id_utilisateur: formData.get("id_utilisateur"),
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      grade: formData.get("grade"),
      specialite: formData.get("specialite"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      avatar: formData.get("avatar"),
      adresse: formData.get("adresse"),
      password: formData.get("password"),
      classes: formData.getAll("classes"),
    };

    const result = await submitProfesseurUpdateData(updateData, id);

    loadingModal.close();
    return {
      success: true,
      data: { email: result.userUpdate.email },
    };
  } catch (error) {
    loadingModal.close();
    if (error.name === "ValidationError") {
      showFormErrors(formElement, error.errors);
      return { success: false, errors: error.errors };
    }
    showEmptyStateModal(
      `Une erreur est survenue lors de la modification du professeur ${error}`
    );
    return { success: false };
  }
}

async function submitProfesseurUpdateData(updatedData, id) {
  const errors = await validateProfesseurData(updatedData, true, id);
  if (errors) throw { name: "ValidationError", errors };
  const userUpdate = await updateUser(
    {
      nom: updatedData.nom,
      prenom: updatedData.prenom,
      email: updatedData.email,
      telephone: updatedData.telephone,
      adresse: updatedData.adresse,
      avatar: updatedData.avatar,
    },
    updatedData.id_utilisateur
  );
  const profUpdate = updateProfesseur(
    {
      specialite: updatedData.specialite,
      grade: updatedData.grade,
    },
    id
  );
  const currentClasses = await getClassesByProfessor(id);
  const newClasses = updatedData.classes;
  const classesToRemove = currentClasses.filter(
    (c) => !newClasses.includes(c.id)
  );
  await Promise.all(
    classesToRemove.map((c) => deleteClassProfesseur(id, c.id))
  );
  const classesToAdd = newClasses.filter(
    (id) => !currentClasses.some((c) => c.id === id)
  );
  await Promise.all(
    classesToAdd.map((id_classe) =>
      createClassProfesseur({
        id_professeur: id,
        id_classe,
        date_affectation: new Date().toISOString().split("T")[0],
      })
    )
  );
  return { userUpdate };
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
