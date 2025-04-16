import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleSidebar } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  const user = getCurrentUser();
  handleSidebar(user);
});
