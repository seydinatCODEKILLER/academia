import { renderCoursCardsProfeesor } from "../../../helpers/professeur/absence.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getIdProfeseurByUserId } from "../../../services/professeurService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import {
  handleProfSidebar,
  renderProfHeader,
} from "../../../utils/prof.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleProfSidebar(user);
  renderProfHeader(user, "Absences");
  const idProfesseur = await getIdProfeseurByUserId(user.id);
  await renderCoursCardsProfeesor(idProfesseur);
});
