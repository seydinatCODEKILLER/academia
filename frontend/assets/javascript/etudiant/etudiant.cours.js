import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import { getIdEtudiantByUserId } from "../../../services/etudiantService.js";
import {
  handleEtudiantSidebar,
  renderEtudiantHeader,
} from "../../../utils/etudiant.utils.js";
import {
  rendeCoursBannerForEtudiant,
  renderCoursCardFilterForEtudiant,
  renderCoursCardsEtudiant,
} from "../../../helpers/etudiant/cours.helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleEtudiantSidebar(user);
  renderEtudiantHeader(user, "Cours");
  rendeCoursBannerForEtudiant();
  const idEtudiant = await getIdEtudiantByUserId(user.id);
  await renderCoursCardsEtudiant(idEtudiant);
  await renderCoursCardFilterForEtudiant(idEtudiant);
});
