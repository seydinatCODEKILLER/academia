import { renderProfessorCalendar } from "../../../helpers/professeur/cours.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getIdProfeseurByUserId } from "../../../services/professeurService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import {
  handleProfSidebar,
  renderProfHeader,
} from "../../../utils/prof.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleProfSidebar(user);
  renderProfHeader(user, "Cours");
  const idProfesseur = await getIdProfeseurByUserId(user.id);
  await renderProfessorCalendar(idProfesseur);
});
