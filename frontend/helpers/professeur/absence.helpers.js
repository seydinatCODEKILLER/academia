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

export const createCourseInfoSection = (course) => {
  const section = document.createElement("div");
  section.className = "border-b pb-4 mb-4";

  section.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-semibold">Module</h4>
        <p>${course.module.libelle}</p>
      </div>
      <div>
        <h4 class="font-semibold">Date</h4>
        <p>${formatDate(course.date_cours)}</p>
      </div>
      <div>
        <h4 class="font-semibold">Horaire</h4>
        <p>${course.heure_debut} - ${course.heure_fin}</p>
      </div>
      <div>
        <h4 class="font-semibold">Salle</h4>
        <p>${course.salle}</p>
      </div>
    </div>
  `;

  return section;
};

export const createAbsenceSection = async (
  classes,
  students,
  courseId,
  professorId
) => {
  const section = document.createElement("div");
  section.className = "flex-1 overflow-hidden";

  const classSwitcher = await createClassSwitcher(
    classes,
    students,
    courseId,
    professorId
  );

  section.appendChild(classSwitcher);
  return section;
};

export const showAbsenceManagementModal = async (courseId, professorId) => {
  const loading = showLoadingModal("Chargement des informations...");

  try {
    const course = await getCoursRemasteredById(courseId);
    const modalContent = await buildAbsenceModalContent(
      course,
      courseId,
      professorId
    );
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
};

const buildAbsenceModalContent = async (course, courseId, professorId) => {
  const modalContent = document.createElement("div");
  modalContent.className = "flex flex-col h-full";

  // Section supérieure - Infos du cours
  const courseInfo = createCourseInfoSection(course);

  // Section inférieure - Gestion des absences
  const absenceSection = await createAbsenceSection(
    course.classes,
    course.etudiants,
    courseId,
    professorId
  );

  modalContent.appendChild(courseInfo);
  modalContent.appendChild(absenceSection);

  return modalContent;
};

export const showMarkAbsenceModal = async (courseId, professorId) => {
  await showAbsenceManagementModal(courseId, professorId);
};
