import { getCurrentAcademicYear } from "./annees_scolaireService.js";
import { API_BASE_URL, fetchData, generateId } from "./api.js";

/**
 * Récupère tous les cours avec les informations de base
 * @returns {Promise<Array>} Liste des cours avec les informations principales
 */
export async function getAllCours() {
  try {
    // Récupère l'année en cours
    const anneeEnCours = await getCurrentAcademicYear();

    // Récupère tous les cours
    const tousLesCours = await fetchData("cours");

    // Récupère les semestres de l'année en cours
    const tousLesSemestres = await fetchData("semestres");
    const semestresAnneeEnCours = tousLesSemestres.filter(
      (s) => s.annee_scolaire === anneeEnCours
    );

    // Filtre les cours qui appartiennent aux semestres de l'année en cours
    const coursAnneeEnCours = tousLesCours.filter((c) =>
      semestresAnneeEnCours.some((s) => s.id === c.id_semestre)
    );

    // Pour chaque cours, on récupère les détails
    const coursAvecDetails = await Promise.all(
      coursAnneeEnCours.map(async (c) => {
        const module = await fetchData("modules", c.id_module);
        const professeur = await fetchData("professeurs", c.id_professeur);
        const utilisateurProfesseur = await fetchData(
          "utilisateurs",
          professeur.id_utilisateur
        );
        const semestre = await fetchData("semestres", c.id_semestre);

        // Récupère les classes associées
        const classesIds = await fetchData("cours_classes").then((cc) =>
          cc
            .filter((item) => item.id_cours === c.id)
            .map((item) => item.id_classe)
        );
        const classes = await Promise.all(
          classesIds.map((id) => fetchData("classes", id))
        );

        return {
          ...c,
          module,
          professeur: {
            ...professeur,
            utilisateur: utilisateurProfesseur,
          },
          semestre,
          classes,
        };
      })
    );

    return coursAvecDetails;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des cours de l'année en cours:",
      error
    );
    throw error;
  }
}

/**
 * Récupère un cours spécifique avec tous ses détails par son ID
 * @param {number} id_cours - L'ID du cours à récupérer
 * @returns {Promise<Object>} Le cours avec tous ses détails
 */

export async function getCoursById(id_cours) {
  try {
    // Récupère l'année en cours
    const anneeEnCours = await getCurrentAcademicYear();

    // Récupère le cours
    const cours = await fetchData("cours", id_cours);
    if (!cours) {
      throw new Error("Cours non trouvé");
    }

    // Vérifie que le cours appartient à l'année en cours
    const semestre = await fetchData("semestres", cours.id_semestre);
    if (semestre.annee_scolaire !== anneeEnCours) {
      throw new Error(
        "Ce cours ne fait pas partie de l'année scolaire en cours"
      );
    }

    // Récupère les détails comme avant
    const module = await fetchData("modules", cours.id_module);
    const professeur = await fetchData("professeurs", cours.id_professeur);
    const utilisateurProfesseur = await fetchData(
      "utilisateurs",
      professeur.id_utilisateur
    );

    // Récupère les classes associées
    const classesIds = await fetchData("cours_classes").then((cc) =>
      cc
        .filter((item) => item.id_cours === cours.id_cours)
        .map((item) => item.id_classe)
    );
    const classes = await Promise.all(
      classesIds.map((id) => fetchData("classes", id))
    );

    // Récupère les absences liées à ce cours
    const absences = await fetchData("absences").then((abs) =>
      abs.filter((a) => a.id_cours === cours.id_cours)
    );

    // Pour chaque absence, on peut récupérer des détails supplémentaires
    const absencesAvecDetails = await Promise.all(
      absences.map(async (absence) => {
        const etudiant = await fetchData("etudiants", absence.id_etudiant);
        const utilisateurEtudiant = await fetchData(
          "utilisateurs",
          etudiant.id_utilisateur
        );

        return {
          ...absence,
          etudiant: {
            ...etudiant,
            utilisateur: utilisateurEtudiant,
          },
        };
      })
    );

    return {
      ...cours,
      module,
      professeur: {
        ...professeur,
        utilisateur: utilisateurProfesseur,
      },
      semestre,
      classes,
      absences: absencesAvecDetails,
      annee_scolaire: anneeEnCours,
    };
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du cours ${id_cours}:`,
      error
    );
    throw error;
  }
}

/**
 * Récupère les IDs des classes associées à un cours
 * @param {number} id_cours - L'ID du cours
 * @returns {Promise<Array<number>>} Liste des IDs de classes
 */
export async function getClassesForCours(id_cours) {
  try {
    const coursClasses = await fetchData("cours_classes");
    return coursClasses
      .filter((item) => item.id_cours === id_cours)
      .map((item) => item.id_classe);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des classes pour le cours ${id_cours}:`,
      error
    );
    return [];
  }
}

export async function createCours(data) {
  const response = await fetch(`${API_BASE_URL}/cours`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      id: String(await generateId("cours")),
    }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création du cours");
  return response.json();
}

export async function updateCours(data) {
  const response = await fetch(`${API_BASE_URL}/cours/${data.id_cours}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du cours");
  return response.json();
}

export async function createCoursClasse(data) {
  const response = await fetch(`${API_BASE_URL}/cours_classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error("Erreur lors de l'assignation de la classe");
  return response.json();
}

export async function deleteCoursClasse(id_cours, id_classe) {
  const response = await fetch(`${API_BASE_URL}/cours_classes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_cours, id_classe }),
  });

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la suppression de l'assignation classe-cours"
    );
  }

  return response.json();
}
