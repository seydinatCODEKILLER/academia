import { showNotification } from "../../../components/notifications/notification.js";
import { navigateTo } from "../../../router/router.js";
import { login } from "../../../services/authServices.js";
import { setCurrentUser } from "../../../store/authStore.js";
import { setNotification } from "../../../store/notificationStore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let isValid = true;

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const errorEmail = document.getElementById("errorEmail");
    const errorPassword = document.getElementById("errorPassword");

    errorEmail.textContent = "";
    errorPassword.textContent = "";

    if (!email) {
      errorEmail.textContent = "l'email est requise";
      errorEmail.classList.add("text-red-500");
      isValid = false;
    }
    if (!password) {
      errorPassword.textContent = "le mot de passe est requis";
      errorPassword.classList.add("text-red-500");
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    try {
      const user = await login(email, password);
      setCurrentUser(user);
      setNotification("connexion réussit avec success");
      navigateTo(getDashboardPath(user.id_role));
    } catch (error) {
      console.log(error.message);
      showNotification(error.message, "error");
    }
  });
});

export function getDashboardPath(roleId) {
  const paths = {
    1: "pages/rp/dashboard.html",
    2: "pages/professeurs/dashboard.html",
    3: "pages/attache/dashboard.html",
    4: "pages/etudiant/dashboard.html",
  };
  return paths[roleId] || "/index.html";
}
