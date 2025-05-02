import {
  renderAbsenteeismChart,
  renderOtherStatisqueData,
} from "../../../helpers/professeur/dashboard.helpers.js";
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
  renderProfHeader(user, "Dashboard");
  const idProfesseur = await getIdProfeseurByUserId(user.id);
  await renderAbsenteeismChart(idProfesseur);
  await renderOtherStatisqueData(idProfesseur);
});
