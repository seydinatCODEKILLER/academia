import {
  createCoursCardsProfessor,
  updateCoursCardsDataProfessor,
} from "../../components/card/cardCours.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { createClassSwitcher } from "../../components/switcher/switcher.js";
import { getActionsConfigAbsence } from "../../config/professor.config.js";
import { getCoursRemasteredById } from "../../services/coursService.js";
import { getProfessorWeeklyCourses } from "../../services/professeurService.js";
import { formatDate } from "../../utils/function.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

const createActionHandler = (idProfessor) => ({
  absence: async (id) => await showMarkAbsenceModal(id, idProfessor),
});

const filterCourses = (courses, filters) => {
  let filtered = [...courses];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter((c) =>
      c.module.libelle.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.statut) {
    filtered = filtered.filter((c) => c.statut == filters.statut);
  }

  return filtered;
};

const renderCards = (courses, idProfessor, containerId) => {
  const actionHandler = createActionHandler(idProfessor);

  return createCoursCardsProfessor({
    containerId,
    data: courses,
    onAction: (action, id) => actionHandler[action]?.(id),
    actions: getActionsConfigAbsence(),
    itemsPerPage: 3,
    emptyMessage: "Aucun cours trouvé",
  });
};

export const renderProfessorCourseCards = async (idProfessor, filters = {}) => {
  // const loadingModal = showLoadingModal("Chargement des cours...");
  const container = document.getElementById("cours-container");

  try {
    // 1. Récupération des données
    const courses = await getProfessorWeeklyCourses(idProfessor, 0);
    console.log(courses);

    // 2. Filtrage
    const filteredCourses = filterCourses(courses, filters);

    // 3. Rendu
    container.innerHTML = "";
    const cards = renderCards(filteredCourses, idProfessor, "cours-cards");
    container.appendChild(cards);

    // 4. Mise à jour initiale
    updateCoursCardsDataProfessor("cours-cards", filteredCourses, 1);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des cours");
  } finally {
    // loadingModal.close();
  }
};

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
