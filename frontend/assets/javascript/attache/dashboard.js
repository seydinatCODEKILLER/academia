import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import { handleSidebar } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleSidebar(user);
});
