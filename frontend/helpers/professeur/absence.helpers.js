import {
  createCoursCardsProfessor,
  updateCoursCardsDataProfessor,
} from "../../components/card/cardCours.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { createClassSwitcher } from "../../components/switcher/switcher.js";
import { getCoursRemasteredById } from "../../services/coursService.js";
import { getProfessorWeeklyCourses } from "../../services/professeurService.js";
import { formatDate } from "../../utils/function.js";
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
          await showMarkAbsenceModal(id, idProfessor);
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

export async function showMarkAbsenceModal(id, idProfesseur) {
  // 1. Récupérer les données complètes du cours
  const loading = showLoadingModal("Chargement des informations...");
  try {
    const fullCourse = await getCoursRemasteredById(id);

    // 2. Créer le contenu du modal
    const modalContent = document.createElement("div");
    modalContent.className = "flex flex-col h-full";

    // Section supérieure - Infos du cours
    const courseInfoSection = document.createElement("div");
    courseInfoSection.className = "border-b pb-4 mb-4";
    courseInfoSection.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold">Module</h4>
          <p>${fullCourse.module.libelle}</p>
        </div>
        <div>
          <h4 class="font-semibold">Date</h4>
          <p>${formatDate(fullCourse.date_cours)}</p>
        </div>
        <div>
          <h4 class="font-semibold">Horaire</h4>
          <p>${fullCourse.heure_debut} - ${fullCourse.heure_fin}</p>
        </div>
        <div>
          <h4 class="font-semibold">Salle</h4>
          <p>${fullCourse.salle}</p>
        </div>
      </div>
    `;

    // Section inférieure - Gestion des absences
    const absenceSection = document.createElement("div");
    absenceSection.className = "flex-1 overflow-hidden";

    // Créer le composant de navigation entre classes
    const classSwitcher = await createClassSwitcher(
      fullCourse.classes,
      fullCourse.etudiants,
      id,
      idProfesseur
    );
    absenceSection.appendChild(classSwitcher);

    // Assemblage
    modalContent.appendChild(courseInfoSection);
    modalContent.appendChild(absenceSection);

    // Créer le modal
    const modal = createModal({
      title: "Marquer les absences",
      content: modalContent,
      size: "xl",
      scrollable: true,
    });

    document.getElementById("modal-cours-container").appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur de chargement des données");
  } finally {
    loading.close();
  }
}
