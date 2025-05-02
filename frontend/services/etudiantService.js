import { getCurrentAcademicYear } from "./annees_scolaireService.js";
import { API_BASE_URL, fetchData, generateId } from "./api.js";

export async function getEtudiantById(id) {
  try {
    // 1. Récupération de toutes les données nécessaires
    const [etudiants, utilisateurs, inscriptions, classes, anneesScolaires] =
      await Promise.all([
        fetchData("etudiants"),
        fetchData("utilisateurs"),
        fetchData("inscriptions"),
        fetchData("classes"),
        fetchData("annee_scolaire"),
      ]);

    // 2. Trouver l'étudiant
    const etudiant = etudiants.find((e) => e.id == id);
    if (!etudiant) throw new Error("Étudiant non trouvé");

    // 3. Données associées
    const utilisateur = utilisateurs.find(
      (u) => u.id == etudiant.id_utilisateur
    );
    const inscription = inscriptions.find((i) => i.id_etudiant == id);
    const classe = classes.find((c) => c.id == etudiant.id_classe);
    const anneeScolaire = inscription
      ? anneesScolaires.find((a) => a.id == inscription.id_annee)
      : null;

    // 4. Formatage des données
    return {
      id_etudiant: etudiant.id,
      matricule: etudiant.matricule,
      nom: utilisateur?.nom || "Inconnu",
      prenom: utilisateur?.prenom || "Inconnu",
      email: utilisateur?.email || "",
      telephone: utilisateur?.telephone || "",
      avatar: utilisateur?.avatar || "/assets/default-avatar.png",
      classe: {
        id: classe?.id || null,
        libelle: classe?.libelle || "Inconnu",
        niveau: classe?.niveau || "Inconnu",
      },
      inscription: inscription
        ? {
            date: inscription.date_inscription,
            annee_scolaire: anneeScolaire?.libelle || "Inconnu",
            statut: inscription.statut,
            est_reinscription: inscription.est_reinscription || false,
          }
        : null,
    };
  } catch (error) {
    console.error(`Erreur dans getEtudiantById: ${error.message}`);
    return null;
  }
}

export async function createStudent(studentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/etudiants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(await generateId("etudiants")),
        ...studentData,
      }),
    });
    return response.json();
  } catch (error) {
    throw new Error(`erreur lors de la creation de l'etudiant : ${error}`);
  }
}

export async function getIdEtudiantByUserId(id_utilisateur) {
  const etudiants = await fetchData("etudiants");
  const etudiant = etudiants.find(
    (item) => item.id_utilisateur == id_utilisateur
  );
  const actorId = etudiant ? etudiant.id : null;
  return actorId;
}

export async function getStudentAbsenceStats(studentId) {
  try {
    const [absences, courses] = await Promise.all([
      fetchData("absences"),
      fetchData("cours"),
    ]);

    const studentAbsences = absences.filter((a) => a.id_etudiant == studentId);

    let totalHours = 0;
    const justified = [];
    const pending = [];

    studentAbsences.forEach((absence) => {
      const course = courses.find((c) => c.id_cours === absence.id_cours);
      const hours = course?.nombre_heures || 2;

      totalHours += hours;

      if (absence.justified === "justifier") {
        justified.push(absence);
      } else if (absence.justified === "en attente") {
        pending.push(absence);
      }
    });

    return {
      totalHours,
      justified: justified.length,
      pending: pending.length,
    };
  } catch (error) {
    console.error("Erreur stats absences:", error);
    return {
      totalHours: 0,
      justified: 0,
      pending: 0,
    };
  }
}

export async function getMonthlyAbsenceData(studentId) {
  try {
    // Récupérer les données nécessaires
    const [absences, courses] = await Promise.all([
      fetchData("absences"),
      fetchData("cours"),
    ]);

    // Filtrer les absences de l'étudiant
    const studentAbsences = absences.filter((a) => a.id_etudiant == studentId);

    // Grouper par mois et calculer les stats
    const monthlyData = studentAbsences.reduce((acc, absence) => {
      const date = new Date(absence.date_absence);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          total: 0,
          justified: 0,
          pending: 0,
          hours: 0,
        };
      }

      // Trouver le cours correspondant pour avoir la durée
      const course = courses.find((c) => c.id_cours === absence.id_cours);
      const hours = course?.nombre_heures || 2; // 2h par défaut

      // Mettre à jour les stats
      acc[monthYear].total++;
      acc[monthYear].hours += hours;

      if (absence.justified === "justifier") {
        acc[monthYear].justified++;
      } else if (absence.justified === "en attente") {
        acc[monthYear].pending++;
      }

      return acc;
    }, {});

    // Convertir en tableau et trier par date
    return Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month,
        ...stats,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Erreur données mensuelles:", error);
    return [];
  }
}

export async function getTodaysCourses(studentId) {
  try {
    // 1. Récupérer les données nécessaires en parallèle
    const [allCourses, studentClasses, modules, professors] = await Promise.all(
      [
        fetchData("cours"),
        getStudentClasses(studentId),
        fetchData("modules"),
        fetchData("professeurs"),
      ]
    );

    // 2. Filtrer les cours d'aujourd'hui
    const today = new Date().toISOString().split("T")[0];
    const todaysCourses = allCourses.filter((course) => {
      return course.date_cours === today;
    });

    // 3. Filtrer les cours qui concernent l'étudiant
    const relevantCourses = todaysCourses.filter((course) => {
      // Récupérer les classes de ce cours
      const courseClasses = course.classes || [];

      // Vérifier si l'étudiant est dans une de ces classes
      return studentClasses.some((studentClass) =>
        courseClasses.includes(studentClass.id_classe)
      );
    });

    // 4. Enrichir les données des cours
    const enrichedCourses = await Promise.all(
      relevantCourses.map(async (course) => {
        // Trouver le module
        const module = modules.find((m) => m.id_module === course.id_module);

        // Trouver le professeur et son utilisateur
        const professor = professors.find(
          (p) => p.id_professeur === course.id_professeur
        );
        let professorUser = null;
        if (professor) {
          professorUser = await fetchData(
            "utilisateurs",
            professor.id_utilisateur
          );
        }

        return {
          ...course,
          module: module || null,
          professeur: professor
            ? { ...professor, utilisateur: professorUser }
            : null,
        };
      })
    );

    // 5. Trier les cours par heure de début
    return enrichedCourses.sort((a, b) => {
      return a.heure_debut.localeCompare(b.heure_debut);
    });
  } catch (error) {
    console.error("Erreur dans getTodaysCourses:", error);
    return [];
  }
}

async function getStudentClasses(studentId) {
  try {
    const inscriptions = await fetchData("inscriptions");
    const classes = await fetchData("classes");

    return inscriptions
      .filter((ins) => ins.id_etudiant == studentId && ins.statut === "validée")
      .map((ins) => {
        const classe = classes.find((c) => c.id_classe === ins.id_classe);
        return {
          id_classe: ins.id_classe,
          libelle: classe?.libelle || "Classe inconnue",
        };
      });
  } catch (error) {
    console.error("Erreur getStudentClasses:", error);
    return [];
  }
}

export async function getStudentCourses(studentId) {
  try {
    const [
      currentYear,
      inscriptions,
      classes,
      allCourses,
      allSemesters,
      courseClasses,
    ] = await Promise.all([
      getCurrentAcademicYear(), // Ex: "2024-2025"
      fetchData("inscriptions"),
      fetchData("classes"),
      fetchData("cours"),
      fetchData("semestres"),
      fetchData("cours_classes"),
    ]);

    // 1. Trouver l’inscription active et validée pour l’année scolaire en cours
    const validInscription = inscriptions.find(
      (ins) =>
        ins.id_etudiant == studentId &&
        ins.statut === "validée" &&
        ins.annee_scolaire === currentYear
    );

    if (!validInscription) return [];

    const studentClasseId = validInscription.id_classe;

    // 2. Identifier les semestres de l’année en cours
    const semestresEnCours = allSemesters.filter(
      (s) => s.annee_scolaire === currentYear
    );

    // 3. Récupérer les cours liés à ces semestres
    const coursEnCours = allCourses.filter((cours) =>
      semestresEnCours.some((sem) => sem.id === cours.id_semestre)
    );

    // 4. Récupérer les cours associés à la classe de l’étudiant
    const coursIdsClasse = courseClasses
      .filter((cc) => cc.id_classe == studentClasseId)
      .map((cc) => cc.id_cours);

    const studentCourses = coursEnCours.filter((cours) =>
      coursIdsClasse.includes(cours.id)
    );

    // 5. Enrichir chaque cours
    const enrichedCourses = await Promise.all(
      studentCourses.map(async (course) => {
        const [module, professor, semester, courseClassesList] =
          await Promise.all([
            fetchData("modules", course.id_module),
            fetchData("professeurs", course.id_professeur).then(
              async (prof) => {
                const user = await fetchData(
                  "utilisateurs",
                  prof.id_utilisateur
                );
                return { ...prof, utilisateur: user };
              }
            ),
            fetchData("semestres", course.id_semestre),
            Promise.all(
              courseClasses
                .filter((cc) => cc.id_cours === course.id)
                .map((cc) => fetchData("classes", cc.id_classe))
            ),
          ]);

        return {
          ...course,
          module,
          professeur: professor,
          semestre: semester,
          classes: courseClassesList,
        };
      })
    );

    return enrichedCourses.sort(
      (a, b) =>
        new Date(b.date_cours) - new Date(a.date_cours) ||
        a.heure_debut.localeCompare(b.heure_debut)
    );
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des cours pour l'étudiant ${studentId}:`,
      error
    );
    throw error;
  }
}

export async function getStudentAbsences(studentId) {
  try {
    // Récupération parallèle des données nécessaires
    const [
      absences,
      cours,
      modules,
      professeurs,
      utilisateurs,
      justifications,
    ] = await Promise.all([
      fetchData("absences"),
      fetchData("cours"),
      fetchData("modules"),
      fetchData("professeurs"),
      fetchData("utilisateurs"),
      fetchData("justifications"),
    ]);

    // Filtrer les absences de l'étudiant
    const studentAbsences = absences.filter(
      (absence) => absence.id_etudiant === studentId
    );

    // Enrichir chaque absence avec les détails
    return studentAbsences.map((absence) => {
      const relatedCourse = cours.find((c) => c.id === absence.id_cours);
      const module = modules.find((m) => m.id === relatedCourse?.id_module);
      const professor = professeurs.find(
        (p) => p.id === relatedCourse?.id_professeur
      );
      const professorUser = utilisateurs.find(
        (u) => u.id === professor?.id_utilisateur
      );
      const markerUser = utilisateurs.find((u) => u.id === absence.id_marqueur);
      const justification = justifications.find(
        (j) => j.id_absence === absence.id
      );

      return {
        id_absence: absence.id,
        date_absence: absence.date_absence,
        heure_marquage: absence.heure_marquage,
        justified: absence.justified,
        cours: relatedCourse
          ? {
              id_cours: relatedCourse.id,
              date_cours: relatedCourse.date_cours,
              heure_debut: relatedCourse.heure_debut,
              heure_fin: relatedCourse.heure_fin,
              salle: relatedCourse.salle,
              statut: relatedCourse.statut,
              module: module
                ? {
                    id_module: module.id,
                    libelle: module.libelle,
                    code_module: module.code_module,
                  }
                : null,
            }
          : null,
        professeur: professorUser
          ? {
              id_professeur: professor.id,
              specialite: professor.specialite,
              grade: professor.grade,
              utilisateur: {
                id_utilisateur: professorUser.id,
                nom: professorUser.nom,
                prenom: professorUser.prenom,
                avatar: professorUser.avatar,
              },
            }
          : null,
        marqueur: markerUser
          ? {
              id_utilisateur: markerUser.id,
              nom: markerUser.nom,
              prenom: markerUser.prenom,
            }
          : null,
        justification: justification
          ? {
              id_justification: justification.id,
              date_justification: justification.date_justification,
              motif: justification.motif,
              statut: justification.statut,
              pieces_jointes: justification.pieces_jointes,
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Erreur dans getStudentAbsences:", error);
    throw error;
  }
}
