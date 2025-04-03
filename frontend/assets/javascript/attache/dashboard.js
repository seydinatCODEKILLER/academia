import { initRouter } from "../../../router/router.js";
import { handleNotifications } from "../../../store/notificationStore.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  handleNotifications();
});
