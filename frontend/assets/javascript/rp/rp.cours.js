import { renderCoursCardsRp } from "../../../helpers/rp/cours.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleRpSidebar, renderRpHeader } from "../../../utils/rp.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  const user = getCurrentUser();
  handleRpSidebar(user);
  renderRpHeader(user, "Mes cours");
  await renderCoursCardsRp();
});
