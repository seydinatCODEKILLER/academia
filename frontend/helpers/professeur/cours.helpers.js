import { createCourseCalendar } from "../../components/calendar/calendar.js";
import { createModal } from "../../components/modals/modal.js";
import { getCoursById } from "../../services/coursService.js";
import { getProfessorWeeklyCourses } from "../../services/professeurService.js";
import {
  colorState,
  formatTimeRange,
  getDayName,
} from "../../utils/function.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

const showCalendarError = (error) => {
  const container = document.getElementById("calendar-container");
  container.innerHTML = `
    <div class="alert alert-error">
      <i class="ri-error-warning-line"></i>
      <span>Erreur de chargement: ${error.message}</span>
    </div>
  `;
};

// 2. Configuration du calendrier
const getCalendarConfig = (professorId) => ({
  startHour: 8,
  endHour: 20,
  hourStep: 2,
  currentWeek: 0,
  professorId: professorId,
});

// 3. Gestionnaire d'événements
const createCalendarHandlers = (professorId) => ({
  fetchData: async (weekOffset) => {
    return await getProfessorWeeklyCourses(professorId, weekOffset);
  },
  onDetails: async (course) => {
    const fullCourseDetails = await getCoursById(course.id);
    console.log("Détails du cours:", fullCourseDetails);
    showCourseDetails(fullCourseDetails);
  },
});

// 4. Initialisation du calendrier
const initializeCalendar = async (professorId) => {
  const loading = showLoadingModal("Chargement des cours...");
  const container = document.getElementById("calendar-container");

  try {
    // Récupérer les cours initiaux
    const initialCourses = await getProfessorWeeklyCourses(professorId, 0);
    console.log("Cours chargés:", initialCourses);

    // Créer et afficher le calendrier
    const calendar = createCourseCalendar(initialCourses, {
      ...getCalendarConfig(professorId),
      ...createCalendarHandlers(professorId),
    });

    container.innerHTML = "";
    container.appendChild(calendar);
    return calendar;
  } catch (error) {
    console.error("Erreur d'affichage:", error);
    showCalendarError(error);
    return null;
  } finally {
    loading.close();
  }
};

// 5. Fonction principale exportée
export const renderProfessorCalendar = async (professorId) => {
  return await initializeCalendar(professorId);
};

const createInfoField = (label, value, badgeClass = "", icon = "") => {
  const container = document.createElement("div");
  container.innerHTML = `
    <h4 class="font-semibold text-gray-700">${
      icon ? `${icon} ` : ""
    }${label}</h4>
    <p class="mt-1 ${
      badgeClass ? `badge badge-soft ${badgeClass}` : "text-gray-900"
    }">
      ${value || "Non spécifié"}
    </p>
  `;
  return container;
};

// 2. Composant de professeur
const createProfessorField = (professor) => {
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="flex items-center gap-3 mt-2">
      <div class="avatar">
        <div class="mask mask-squircle h-10 w-10">
          <img src="${professor?.utilisateur?.avatar || "/default-avatar.png"}" 
               alt="Avatar" />
        </div>
      </div>
      <div>
        <div class="font-bold">${
          professor?.utilisateur?.prenom || "Non spécifié"
        }</div>
        <div class="text-sm opacity-50">${
          professor?.utilisateur?.email || ""
        }</div>
      </div>
    </div>
  `;
  return container;
};

// 3. Composant de classes participantes
const createClassesField = (classes) => {
  const container = document.createElement("div");
  const title = document.createElement("h4");
  title.className = "font-semibold text-gray-700";
  title.textContent = "Classes participantes";
  container.appendChild(title);

  if (classes?.length > 0) {
    classes.forEach((classe) => {
      const badge = document.createElement("div");
      badge.className = "badge badge-soft badge-info mt-2 mr-2";
      badge.innerHTML = `<i class="ri-user-line"></i> ${classe.libelle}`;
      container.appendChild(badge);
    });
  } else {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "text-gray-500 mt-1";
    emptyMsg.textContent = "Aucune classe spécifiée";
    container.appendChild(emptyMsg);
  }

  return container;
};

// 4. Construction du contenu du modal
const buildCourseDetailsContent = (course) => {
  const content = document.createElement("div");
  content.className = "space-y-4";

  // Grille principale
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

  // Ajout des champs d'information
  grid.appendChild(
    createInfoField("Module", course.module?.libelle, "badge-primary")
  );

  grid.appendChild(
    createInfoField("Statut", course.statut, colorState(course.statut))
  );

  grid.appendChild(createInfoField("Salle", course.salle, "badge-secondary"));

  // Champ professeur
  const professorField = document.createElement("div");
  professorField.innerHTML =
    '<h4 class="font-semibold text-gray-700">Enseignant</h4>';
  professorField.appendChild(createProfessorField(course.professeur));
  grid.appendChild(professorField);

  grid.appendChild(
    createInfoField(
      "Jour",
      getDayName(course.date_cours),
      "",
      '<i class="ri-calendar-check-line"></i>'
    )
  );

  grid.appendChild(
    createInfoField(
      "Horaire",
      formatTimeRange(course.heure_debut, course.heure_fin)
    )
  );

  content.appendChild(grid);
  content.appendChild(createClassesField(course.classes));

  return content;
};

// 5. Fonction principale exportée
export const showCourseDetails = (course) => {
  const modal = createModal({
    title: "Détails du cours",
    content: buildCourseDetailsContent(course),
    size: "lg",
    scrollable: true,
  });

  const container = document.getElementById("modal-course-container");
  container.innerHTML = "";
  container.appendChild(modal);
  modal.showModal();
};
