import {
  renderFloatingButtonAddProfesseur,
  renderProfesseursTableRp,
  renderProfesseurTableFilterForRp,
} from "../../../helpers/rp/professeur.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleRpSidebar, renderRpHeader } from "../../../utils/rp.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleRpSidebar(user);
  renderRpHeader(user, "Mes professeurs");
  renderFloatingButtonAddProfesseur();
  await renderProfesseursTableRp();
  await renderProfesseurTableFilterForRp();
});
