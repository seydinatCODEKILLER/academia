import {
  checkEmailExists,
  checkMatriculeExists,
} from "../services/utilisateurService.js";

export function setupRealTimeValidation(form) {
  // Validation email
  form.querySelector('[name="email"]').addEventListener("blur", async (e) => {
    const email = e.target.value;
    const errorElement = form.querySelector('[data-error="email"]');

    if (!email) return;

    if (await checkEmailExists(email)) {
      errorElement.textContent = "Email déjà utilisé";
      errorElement.classList.remove("hidden");
    } else {
      errorElement.classList.add("hidden");
    }
  });

  // Validation matricule
  form
    .querySelector('[name="matricule"]')
    .addEventListener("blur", async (e) => {
      const matricule = e.target.value;
      const errorElement = form.querySelector('[data-error="matricule"]');

      if (!matricule) return;

      if (await checkMatriculeExists(matricule)) {
        errorElement.textContent = "Matricule déjà utilisé";
        errorElement.classList.remove("hidden");
      } else {
        errorElement.classList.add("hidden");
      }
    });

  // Validation mot de passe
  form
    .querySelector('[name="confirm_password"]')
    .addEventListener("input", (e) => {
      const password = form.querySelector('[name="password"]').value;
      const confirm = e.target.value;
      const errorElement = form.querySelector('[data-error="password"]');

      if (password && confirm && password !== confirm) {
        errorElement.textContent = "Les mots de passe ne correspondent pas";
        errorElement.classList.remove("hidden");
      } else {
        errorElement.classList.add("hidden");
      }
    });
}
