import { getCurrentAcademicYear } from "./annees_scolaireService.js";
import { API_BASE_URL, fetchData, generateId } from "./api.js";

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
        .filter((item) => item.id_cours === cours.id)
        .map((item) => item.id_classe)
    );
    const classes = await Promise.all(
      classesIds.map((id) => fetchData("classes", id))
    );

    // Récupère les absences liées à ce cours
    const absences = await fetchData("absences").then((abs) =>
      abs.filter((a) => a.id_cours === cours.id)
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

export async function getClassesForCours(id_cours) {
  try {
    const coursClasses = await fetchData("cours_classes");
    return coursClasses
      .filter((item) => item.id_cours == id_cours)
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
  try {
    const allAffectations = await fetchData("cours_classes");
    const affectationId = allAffectations.find(
      (item) => item.id_cours === id_cours && item.id_classe === id_classe
    )?.id;

    if (!affectationId) return false;

    await fetch(`${API_BASE_URL}/cours_classes/${affectationId}`, {
      method: "DELETE",
    });

    return true;
  } catch (error) {
    console.error("Erreur deleteClasscours:", error);
    return false;
  }
}

export async function handleCancelCours(coursId) {
  const response = await fetch(`${API_BASE_URL}/cours/${coursId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut: "annuler" }),
  });

  if (!response.ok) throw new Error("Échec de l'annulation du cours");
  return await response.json();
}

export async function handleRestoreCours(coursId) {
  const response = await fetch(`${API_BASE_URL}/cours/${coursId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut: "planifié" }),
  });

  if (!response.ok) throw new Error("Échec de l'annulation du cours");
  return await response.json();
}

export async function handleArchiveCours(coursId) {
  const response = await fetch(`${API_BASE_URL}/cours/${coursId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut: "archiver" }),
  });

  if (!response.ok) throw new Error("Échec de l'annulation du cours");
  return await response.json();
}

export async function getCoursRemasteredById(id_cours) {
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

    // Récupère les détails de base
    const module = await fetchData("modules", cours.id_module);
    const professeur = await fetchData("professeurs", cours.id_professeur);
    const utilisateurProfesseur = await fetchData(
      "utilisateurs",
      professeur.id_utilisateur
    );

    // Récupère les classes associées (sans les élèves)
    const classesIds = await fetchData("cours_classes").then((cc) =>
      cc
        .filter((item) => item.id_cours === cours.id)
        .map((item) => item.id_classe)
    );
    const classes = await Promise.all(
      classesIds.map((id) => fetchData("classes", id))
    );

    // Récupère TOUS les élèves des classes associées (séparément)
    const etudiantsIds = await fetchData("etudiants").then((etudiants) =>
      etudiants.filter((e) => classesIds.includes(e.id_classe)).map((e) => e.id)
    );

    const etudiants = await Promise.all(
      etudiantsIds.map(async (id) => {
        const etudiant = await fetchData("etudiants", id);
        const utilisateurEtudiant = await fetchData(
          "utilisateurs",
          etudiant.id_utilisateur
        );
        return {
          ...etudiant,
          utilisateur: utilisateurEtudiant,
        };
      })
    );

    // Récupère les absences
    const absences = await fetchData("absences").then((abs) =>
      abs.filter((a) => a.id_cours === cours.id)
    );

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
      classes, // Liste des classes (sans élèves)
      etudiants, // Liste de tous les élèves (séparée)
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
