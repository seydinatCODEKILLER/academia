import {
  renderClasseBannerForProfessor,
  renderClasseCardFilterForProfessor,
  renderClasseCardProfesseur,
} from "../../../helpers/professeur/classe.helpers.js";
import { initRouter } from "../../../router/router.js";
import {
  getIdProfeseurByUserId,
  getProfessorClassesDetailed,
} from "../../../services/professeurService.js";
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
  renderProfHeader(user, "Classe");
  renderClasseBannerForProfessor();
  const idProfesseur = await getIdProfeseurByUserId(user.id);
  await renderClasseCardProfesseur(idProfesseur);
  await renderClasseCardFilterForProfessor(idProfesseur);
  console.log(await getProfessorClassesDetailed(idProfesseur, "2"));
});
