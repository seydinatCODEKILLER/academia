import {
  checkEmailExists,
  checkMatriculeExists,
} from "../../services/utilisateurService.js";

export async function validateInscriptionData(data) {
  const errors = {};

  if (!data.nom) errors.nom = "un nom requis";
  if (!data.prenom) errors.prenom = "un prenom requis";
  if (!data.password) errors.password = "le mot de passe est requis";
  if (!data.adresse) errors.adresse = "l'adresse est requis";
  if (!data.avatar) errors.avatar = "l'avatar est requis";
  if (!data.telephone) errors.telephone = "le telephone est requis";
  if (!data.classe_id) errors.classe_id = "Vous devez selectionnez une classe";

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = "Email requis";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Email invalide";
  } else if (await checkEmailExists(data.email)) {
    errors.email = "Email déjà utilisé";
  }

  // Validation matricule
  if (!data.matricule) {
    errors.matricule = "Matricule requis";
  } else if (await checkMatriculeExists(data.matricule)) {
    errors.matricule = "Matricule déjà utilisé";
  }

  return Object.keys(errors).length ? errors : null;
}

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
