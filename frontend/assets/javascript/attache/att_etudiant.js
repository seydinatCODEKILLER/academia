import { initRouter } from "../../../router/router.js";
import { getIdAttacherByUserId } from "../../../services/attacherService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import {
  handleSidebar,
  renderAbsencesTable,
  renderAbsencesTableFilter,
  renderAttacheHeader,
  renderBannerForAbsence,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
  renderAttacheHeader(user, "Absences");
  const idAttacher = await getIdAttacherByUserId(user.id);
  // renderBannerForAbsence();
  await renderAbsencesTableFilter(idAttacher);
  await renderAbsencesTable(idAttacher);
});
