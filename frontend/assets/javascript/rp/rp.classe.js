import {
  renderClassesTableRp,
  renderClasseTableFilterForRp,
} from "../../../helpers/rp/classe.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleSidebar, renderRpHeader } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
  renderRpHeader(user, "Mes classes");
  await renderClasseTableFilterForRp();
  await renderClassesTableRp();
});
