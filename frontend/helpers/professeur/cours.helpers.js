import { createCourseCalendar } from "../../components/calendar/calendar.js";
import { getProfessorWeeklyCourses } from "../../services/professeurService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function displayProfessorCalendar(professorId) {
  const container = document.getElementById("calendar-container");
  if (!container) return;

  container.innerHTML = "";
  const loading = showLoadingModal("Chargement des cours...");

  try {
    // Récupérer les cours initiaux
    const initialCourses = await getProfessorWeeklyCourses(professorId, 0);
    console.log(initialCourses);

    // Créer et afficher le calendrier
    const calendar = createCourseCalendar(initialCourses, {
      startHour: 8,
      endHour: 22,
      hourStep: 2,
      professorId: professorId, // Active la navigation
    });

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
