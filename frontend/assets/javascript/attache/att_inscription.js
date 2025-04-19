import { initRouter } from "../../../router/router.js";
import { getIdAttacherByUserId } from "../../../services/attacherService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import {
  handleSidebar,
  renderAttacheHeader,
  renderBannerForInscription,
  renderFloatingButtonAdd,
  renderInscriptionsFilters,
  renderInscriptionTable,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
  renderAttacheHeader(user, "Inscriptions");
  renderBannerForInscription();
  const idAttacher = await getIdAttacherByUserId(user.id);
  renderFloatingButtonAdd(idAttacher);
  await renderInscriptionsFilters(idAttacher);
  await renderInscriptionTable(idAttacher);
});
