import { initRouter } from "../../../router/router.js";
import { getIdAttacherByUserId } from "../../../services/attacherService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import {
  handleSidebar,
  renderAttacheHeader,
  renderClassesTable,
  renderClasseTableFilter,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
  renderAttacheHeader(user);
  const idAttacher = await getIdAttacherByUserId(user.id_utilisateur);
  await renderClasseTableFilter(idAttacher);
  await renderClassesTable(idAttacher);
});
