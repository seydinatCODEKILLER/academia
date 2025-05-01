import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { getIdEtudiantByUserId } from "../../../services/etudiantService.js";
import {
  handleEtudiantSidebar,
  renderEtudiantHeader,
} from "../../../utils/etudiant.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleEtudiantSidebar(user);
  renderEtudiantHeader(user, "Justification");
  const idEtudiant = await getIdEtudiantByUserId(user.id);
});
