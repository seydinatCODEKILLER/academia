import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import {
  handleEtudiantSidebar,
  renderEtudiantHeader,
} from "../../../utils/etudiant.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleEtudiantSidebar(user);
  renderEtudiantHeader(user, "Dashboard");
});
