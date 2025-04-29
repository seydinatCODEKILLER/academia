import {
  checkExistingClass,
  getClasseById,
} from "../services/classeServices.js";
import { getProfessorDetails } from "../services/professeurService.js";
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

export async function validateClassData(
  data,
  isUpdate = false,
  classId = null
) {
  const errors = {};

  if (!data.libelle?.trim()) {
    errors.libelle = "Le libellé est requis";
  } else if (data.libelle.length > 50) {
    errors.libelle = "Maximum 50 caractères";
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

  if (isUpdate) {
    const originalClass = await getClasseById(classId);
    if (data.libelle !== originalClass.libelle) {
      const exists = await checkExistingClass(data.libelle, classId);
      if (exists) {
        errors.libelle = "Cette classe existe déjà pour cette filière";
      }
    }
  } else {
    const exists = await checkExistingClass(data.libelle);
    if (exists) {
      errors.libelle = "Cette classe existe déjà pour cette filière";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export async function validateProfesseurData(
  data,
  isUpdate = false,
  profId = null
) {
  const errors = {};

  if (!data.nom?.trim()) {
    errors.nom = "Le nom est requis";
  } else if (data.nom.length > 50) {
    errors.nom = "Maximum 50 caractères";
  }

  if (!data.prenom?.trim()) {
    errors.prenom = "Le prenom est requis";
  } else if (data.prenom.length > 50) {
    errors.prenom = "Maximum 50 caractères";
  }

  if (!data.grade?.trim()) {
    errors.grade = "Le grade est requis";
  }

  if (!data.specialite?.trim()) {
    errors.specialite = "Le specialite est requis";
  }

  if (!data.telephone?.trim()) {
    errors.telephone = "Le telephone est requis";
  }

  if (!data.password?.trim()) {
    errors.password = "Le password est requis";
  }

  if (!data.avatar?.trim()) {
    errors.avatar = "Le avatar est requis";
  }

  if (!data.adresse?.trim()) {
    errors.adresse = "L'adresse est requis";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = "Email requis";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Email invalide";
  }

  if (!data.classes || data.classes.length === 0) {
    errors.classes = "Affectez au moins une classe";
  }

  if (isUpdate) {
    const originalProf = await getProfessorDetails(profId);
    if (data.email !== originalProf.informations.email) {
      const exists = await checkEmailExists(data.email);
      if (exists) {
        errors.email = "Cette email existe déjà";
      }
    }
  } else {
    const exists = await checkEmailExists(data.email);
    if (exists) {
      errors.email = "Cette email existe déjà";
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateCoursData(coursData) {
  const errors = {};

  if (!coursData.id_module) errors.id_module = "Module requis";
  if (!coursData.id_professeur) errors.id_professeur = "Professeur requis";
  if (!coursData.id_semestre) errors.id_semestre = "Semestre requis";
  if (!coursData.date_cours) errors.date_cours = "Date requise";
  if (!coursData.salle) errors.salle = "la salle requise";

  if (!coursData.heure_debut) {
    errors.heure_debut = "Heure de début requise";
  }

  if (!coursData.heure_fin) {
    errors.heure_fin = "Heure de fin requise";
  } else if (coursData.heure_debut >= coursData.heure_fin) {
    errors.heure_fin = "L'heure de fin doit être après l'heure de début";
  }

  if (coursData.classes.length === 0) {
    errors.classes = "Au moins une classe doit être sélectionnée";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
