import {
  renderCourseByTrackChart,
  renderCourseChart,
  renderRpStatsCards,
} from "../../../helpers/rp/dashboard.helpers.js";
import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import { handleSidebar, renderRpHeader } from "../../../utils/rp.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleSidebar(user);
  renderRpHeader(user, "Dashboard");
  await renderRpStatsCards();
  await renderCourseChart();
  await renderCourseByTrackChart();
});
