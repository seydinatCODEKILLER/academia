import { createIllustratedBanner } from "../../components/banner/banner.js";
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

export async function displayProfessorCalendar(professorId) {
  const loading = showLoadingModal("Chargement des cours...");

  try {
    // Récupérer les cours initiaux
    const initialCourses = await getProfessorWeeklyCourses(professorId, 0);
    console.log(initialCourses);

    const fetchProfessorCourses = async (weekOffset) => {
      return await getProfessorWeeklyCourses(professorId, weekOffset);
    };

    const onDetails = async (course) => {
      const fullCourseDetails = await getCoursById(course.id);
      console.log(fullCourseDetails);

      showCourseDetailsModal(fullCourseDetails);
      // showCourseDetailsModal(course);
    };

    // Créer et afficher le calendrier
    const calendar = createCourseCalendar(initialCourses, {
      startHour: 8,
      endHour: 20,
      hourStep: 2,
      fetchData: fetchProfessorCourses,
      onDetails: onDetails,
      currentWeek: 0,
      professorId: professorId,
    });
    const container = document.getElementById("calendar-container");
    container.innerHTML = "";
    container.appendChild(calendar);
  } catch (error) {
    console.error("Erreur d'affichage:", error);
    container.innerHTML = `
      <div class="alert alert-error">
        <i class="ri-error-warning-line"></i>
        <span>Erreur de chargement: ${error.message}</span>
      </div>
    `;
  } finally {
    loading.close();
  }
}

export function showCourseDetailsModal(course) {
  const content = document.createElement("div");
  content.className = "space-y-4";

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-semibold text-gray-700">Module</h4>
        <p class="mt-1 badge badge-soft badge-primary">${
          course.module.libelle || "Non spécifié"
        }</p>
      </div>
      
      <div>
        <h4 class="font-semibold text-gray-700">Statut</h4>
        <p class="mt-1 badge badge-soft ${colorState(course.statut)}">${
    course.statut || "Non spécifié"
  }</p>
      </div>
      
      <div>
        <h4 class="font-semibold text-gray-700">Salle</h4>
        <p class="mt-1 badge badge-soft badge-secondary">${
          course.salle || "Non spécifié"
        }</p>
      </div>
      
      <div>
        <h4 class="font-semibold text-gray-700">Enseignant</h4>
        <div class="flex items-center gap-3 mt-2">
            <div class="avatar">
              <div class="mask mask-squircle h-10 w-10">
                <img
                  src="${course.professeur?.utilisateur?.avatar}"
                  alt="Avatar Tailwind CSS Component" />
              </div>
            </div>
            <div>
              <div class="font-bold">${
                course.professeur?.utilisateur?.prenom
              }</div>
              <div class="text-sm opacity-50">${
                course.professeur?.utilisateur?.email
              }</div>
            </div>
          </div>
      </div>
      
      <div>
        <h4 class="font-semibold text-gray-700"><i class="ri-calendar-check-line"></i> Jour</h4>
        <p class="mt-1 text-gray-900">${getDayName(course.date_cours)}</p>
      </div>
      
      <div>
        <h4 class="font-semibold text-gray-700">Horaire</h4>
        <p class="mt-1 text-gray-900">${formatTimeRange(
          course.heure_debut,
          course.heure_fin
        )}</p>
      </div>
    </div>
    
      <div>
        <h4 class="font-semibold text-gray-700">Classe participants</h4>
        ${course.classes.map((classe) => {
          return `
            <div class="badge badge-soft badge-info mt-2">
              <i class="ri-user-line"></i> ${classe.libelle}
            </div>
          `;
        })}
      </div>
  `;

  // Créer le modal avec votre composant existant
  const modal = createModal({
    title: "Détails du cours",
    content: content,
    size: "lg",
    scrollable: true,
  });

  // Ajouter le modal au DOM et l'afficher
  document.getElementById("modal-course-container").appendChild(modal);
  modal.showModal();
}
