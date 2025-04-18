import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { getCurrentAcademicYear } from "../../services/annees_scolaireService.js";
import { getClassesByAttache } from "../../services/attacherService.js";
import {
  checkExistingReinscription,
  submitReinscription,
} from "../../services/inscriptionService.js";
import { checkReinscriptionPeriod } from "../../services/periodService.js";
import { showLoadingModal } from "./justificationHelpers.js";

// components/ReinscriptionForm.js
export function createReinscriptionForm(student, idAttache) {
  const form = document.createElement("form");
  form.className = "space-y-4 p-4";

  form.innerHTML = `
    <!-- En-tête étudiant -->
    <div class="bg-base-200 p-4 rounded-lg mb-4">
      <h4 class="font-bold">${student.prenom} ${student.nom}</h4>
      <p class="text-sm opacity-75">${student.matricule}</p>
      <p class="text-sm">Classe actuelle: ${student.classe.libelle}</p>
    </div>

    <!-- Nouvelle classe -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">Nouvelle classe *</span>
      </label>
      <select name="new_class_id" class="select select-bordered" required>
        <option value="">Sélectionner...</option>
      </select>
    </div>

    <!-- Statut -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">Situation *</span>
      </label>
      <div class="flex flex-col space-y-2">
        <label class="flex items-center space-x-2">
          <input type="radio" name="redoublement" value="false" checked class="radio radio-primary">
          <span>Passage normal</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" name="redoublement" value="true" class="radio radio-primary">
          <span>Redoublement</span>
        </label>
      </div>
    </div>

    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        Soumettre la demande
      </button>
    </div>
  `;

  // Remplissage des classes
  loadClassOptions(
    form.querySelector('select[name="new_class_id"]'),
    idAttache
  );

  return form;
}

async function loadClassOptions(selectElement, idAttache) {
  const classes = await getClassesByAttache(idAttache);
  classes.forEach((classe) => {
    const option = document.createElement("option");
    option.value = classe.id_classe;
    option.textContent = classe.libelle;
    selectElement.appendChild(option);
  });
}

export async function handleReinscriptionClick(student, idAttache) {
  try {
    // 1. Vérification période
    const isPeriodOpen = await checkReinscriptionPeriod();
    console.log(isPeriodOpen);

    if (!isPeriodOpen) {
      showEmptyStateModal("Les réinscriptions sont actuellement fermées");
      return;
    }

    // 2. Vérification si déjà réinscrit (adapté)
    const currentYear = await getCurrentAcademicYear();
    const alreadyReinscrit = await checkExistingReinscription(
      student.id_etudiant,
      currentYear
    );

    if (alreadyReinscrit) {
      showEmptyStateModal(
        `${student.prenom} est déjà réinscrit pour ${currentYear}`
      );
      return;
    }

    // 3. Affichage du formulaire
    const form = createReinscriptionForm(student, idAttache);
    const modal = createModal({
      title: `Réinscription - ${student.prenom} ${student.nom}`,
      content: form,
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const loadingModal = showLoadingModal();

      try {
        const formData = new FormData(form);
        console.log(formData.get("new_class_id"));

        await submitReinscription({
          id_etudiant: student.id_etudiant,
          id_classe: formData.get("new_class_id"),
          redoublement: formData.get("redoublement") === "true",
          annee_scolaire: currentYear,
          date_inscription: new Date().toISOString(),
        });

        loadingModal.close();
        modal.close();
      } catch (error) {
        loadingModal.close();
        showEmptyStateModal(`Erreur: ${error.message}`);
      }
    };

    document.body.appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Une erreur est survenue");
  }
}
