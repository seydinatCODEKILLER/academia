import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { getIdEtudiantByUserId } from "../../../services/etudiantService.js";
import {
  handleEtudiantSidebar,
  renderEtudiantHeader,
} from "../../../utils/etudiant.utils.js";
import {
  rendeJustificationBannerForEtudiant,
  renderAbsenceCardEtudiant,
  renderJustificationCardFilterForEtudiant,
} from "../../../helpers/etudiant/absence.helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleEtudiantSidebar(user);
  renderEtudiantHeader(user, "Absences");
  const idEtudiant = await getIdEtudiantByUserId(user.id);
  await renderAbsenceCardEtudiant(idEtudiant);
  await renderJustificationCardFilterForEtudiant(idEtudiant);
  rendeJustificationBannerForEtudiant();
});
