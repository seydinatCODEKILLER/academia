import { checkExistingClass } from "../services/classeServices.js";
import {
  checkEmailExists,
  checkMatriculeExists,
} from "../services/utilisateurService.js";

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

export async function validateClassData(data) {
  const errors = {};

  if (!data.libelle?.trim()) {
    errors.libelle = "Le libellé est requis";
  } else if (data.libelle.length > 50) {
    errors.libelle = "Maximum 50 caractères";
  } else if (await checkExistingClass(data.libelle)) {
    errors.libelle = "La classe existe deja";
  }
  if (!data.id_filiere) {
    errors.id_filiere = "Sélectionnez une filière";
  }

  if (!data.id_niveau) {
    errors.id_niveau = "Sélectionnez un niveau";
  }

  if (!data.capacite_max || data.capacite_max < 1) {
    errors.capacite_max = "Capacité invalide";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
