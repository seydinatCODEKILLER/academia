import { initRouter } from "../../../router/router.js";
import { getIdAttacherByUserId } from "../../../services/attacherService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import {
  handleSidebar,
  renderAttacheHeader,
  renderBannerForJustification,
  renderJustificationsTable,
  renderJustificationsTableFilter,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
  renderAttacheHeader(user, "Demandes justifications");
  // renderBannerForJustification();
  const idAttacher = await getIdAttacherByUserId(user.id);
  await renderJustificationsTableFilter(idAttacher);
  await renderJustificationsTable(idAttacher);
});
