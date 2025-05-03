import { API_BASE_URL, fetchData, generateId } from "./api.js";

export async function getAllProfessorsBasic() {
  try {
    // Récupération parallèle des données
    const [professeurs, utilisateurs] = await Promise.all([
      fetchData("professeurs"),
      fetchData("utilisateurs"),
    ]);

    // Mapping des professeurs avec les informations utilisateur
    return professeurs.map((professeur) => {
      const utilisateur = utilisateurs.find(
        (u) => u.id === professeur.id_utilisateur
      );

      return {
        id: professeur.id,
        nom: utilisateur?.nom || "Inconnu",
        prenom: utilisateur?.prenom || "",
        email: utilisateur?.email || "Non renseigné",
        avatar: utilisateur?.avatar || "default-avatar.png",
        telephone: utilisateur?.telephone || "Non renseigné",
        adresse: utilisateur?.adresse || "Non renseignée",
        state: utilisateur?.state || "inconnu",
        specialite: professeur.specialite,
        grade: professeur.grade,
        date_embauche: professeur.date_embauche,
      };
    });
  } catch (error) {
    console.error("Erreur dans getAllProfessorsBasic:", error);
    throw error;
  }
}

export async function getProfessorDetails(professorId) {
  try {
    // Récupération parallèle de toutes les données nécessaires
    const [
      professeur,
      utilisateurs,
      classesProfesseur,
      classes,
      cours,
      coursClasses,
    ] = await Promise.all([
      fetchData("professeurs", professorId),
      fetchData("utilisateurs"),
      fetchData("classes_professeur"),
      fetchData("classes"),
      fetchData("cours"),
      fetchData("cours_classes"),
    ]);

    if (!professeur) return null;

    // Extraction des IDs clés
    const userId = professeur.id_utilisateur;
    const profId = professeur.id;

    // Récupération des informations utilisateur
    const userInfo = utilisateurs.find((u) => u.id === userId);
    if (!userInfo) {
      throw new Error(`Utilisateur non trouvé pour l'ID ${userId}`);
    }

    // Récupérer les classes enseignées avec optimisation
    const classesEnseignees = classesProfesseur
      .filter((cp) => cp.id_professeur === profId)
      .map((cp) => {
        const classe = classes.find((c) => c.id === cp.id_classe);
        return {
          id_classe: cp.id_classe,
          id_affectation: cp.id, // ID de la relation dans classes_professeur
          libelle_classe: classe?.libelle || "Classe inconnue",
          date_affectation: cp.date_affectation,
          est_principal: cp.est_principal || false, // Valeur par défaut
        };
      });

    // Récupérer les cours donnés avec des données plus complètes
    const coursDonnes = cours
      .filter((c) => c.id_professeur === profId)
      .map((c) => {
        const classesAssociees = coursClasses
          .filter((cc) => cc.id_cours === c.id)
          .map((cc) => {
            const classe = classes.find((cl) => cl.id === cc.id_classe);
            return {
              id_classe: cc.id_classe,
              libelle: classe?.libelle || "Inconnue",
              id_relation: cc.id, // ID de la relation dans cours_classes
            };
          });

        return {
          id_cours: c.id,
          id_module: c.id_module,
          date: c.date_cours,
          heure_debut: c.heure_debut,
          heure_fin: c.heure_fin,
          salle: c.salle,
          statut: c.statut,
          classes: classesAssociees,
        };
      });

    // Structure de retour améliorée
    return {
      // Identifiants clés
      ids: {
        utilisateur: userId,
        professeur: profId,
      },

      // Informations de base
      informations: {
        ...userInfo,
        specialite: professeur.specialite,
        grade: professeur.grade,
        date_embauche: professeur.date_embauche,
      },

      // Relations
      relations: {
        classes: classesEnseignees,
        cours: coursDonnes,
      },

      // Statistiques calculées
      stats: {
        total_classes: classesEnseignees.length,
        total_cours: coursDonnes.length,
        par_statut: {
          planifies: coursDonnes.filter((c) => c.statut === "planifié").length,
          effectues: coursDonnes.filter((c) => c.statut === "effectué").length,
          annules: coursDonnes.filter((c) => c.statut === "annulé").length || 0,
        },
      },
    };
  } catch (error) {
    console.error(
      `Erreur dans getProfessorDetails pour le professeur ${professorId}:`,
      error
    );
    throw new Error(
      `Impossible de récupérer les détails du professeur: ${error.message}`
    );
  }
}

export async function createProfesseur(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/professeurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(await generateId("professeurs")),
        ...data,
      }),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function updateProfesseur(data, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/professeurs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getClassesByProfessor(profId) {
  try {
    // 1. Récupérer toutes les affectations de classes pour ce professeur
    const classesProfesseur = await fetchData("classes_professeur");

    // 2. Filtrer pour ce professeur et extraire les IDs de classe
    const filtered = classesProfesseur.filter(
      (item) => item.id_professeur === profId
    );

    // 3. Récupérer les détails complets des classes
    const allClasses = await fetchData("classes");

    return filtered.map((affectation) => {
      const classe = allClasses.find((c) => c.id === affectation.id_classe);
      return {
        id: affectation.id_classe,
        libelle: classe?.libelle || "Classe inconnue",
      };
    });
  } catch (error) {
    console.error("Erreur getClassesByProfessor:", error);
    return [];
  }
}

export async function deleteClassProfesseur(profId, classId) {
  try {
    const allAffectations = await fetchData("classes_professeur");
    const affectationId = allAffectations.find(
      (item) => item.id_professeur === profId && item.id_classe === classId
    )?.id;

    if (!affectationId) return false;

    // Suppression réelle si votre API le permet
    await fetch(`${API_BASE_URL}/classes_professeur/${affectationId}`, {
      method: "DELETE",
    });

    return true;
  } catch (error) {
    console.error("Erreur deleteClassProfesseur:", error);
    return false;
  }
}

export async function handleArchiveProfesseur(userId) {
  const response = await fetch(`${API_BASE_URL}/utilisateurs/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "archiver" }),
  });

  if (!response.ok) throw new Error("Échec de l'archivage");
  return await response.json();
}

export async function handleRestoreProfesseur(userId) {
  const response = await fetch(`${API_BASE_URL}/utilisateurs/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "disponible" }),
  });

  if (!response.ok) throw new Error("Échec de la restauration");
  return await response.json();
}

export async function getProfessorDailyCourses(professorId, date) {
  try {
    // Récupération parallèle des données nécessaires
    const [allCourses, modules, classes, semestres] = await Promise.all([
      fetchData("cours"),
      fetchData("modules"),
      fetchData("classes"),
      fetchData("semestres"),
    ]);

    // Filtrer les cours du professeur pour la date spécifiée
    const dailyCourses = allCourses.filter((course) => {
      return (
        course.id_professeur === professorId &&
        course.date_cours === date &&
        course.statut !== "annulé"
      );
    });

    // Enrichir les données des cours
    return dailyCourses.map((course) => {
      const module = modules.find((m) => m.id === course.id_module);
      const semester = semestres.find((s) => s.id === course.id_semestre);
      const courseClasses = classes.filter(
        (c) => course.classes && course.classes.includes(c.id)
      );

      return {
        id: course.id_cours,
        date: course.date_cours,
        heure_debut: course.heure_debut,
        heure_fin: course.heure_fin,
        salle: course.salle,
        statut: course.statut,
        module: module
          ? {
              id: module.id_module,
              libelle: module.libelle,
              code: module.code_module,
            }
          : null,
        semestre: semester
          ? {
              id: semester.id_semestre,
              libelle: semester.libelle,
            }
          : null,
        classes: courseClasses.map((c) => ({
          id: c.id_classe,
          libelle: c.libelle,
        })),
      };
    });
  } catch (error) {
    console.error("Erreur dans getProfessorDailyCourses:", error);
    throw error;
  }
}

export async function calculateProfessorAbsenteeismRate(professorId) {
  try {
    // Récupération parallèle des données
    const [allAbsences, allCourses, allStudents, professors] =
      await Promise.all([
        fetchData("absences"),
        fetchData("cours"),
        fetchData("etudiants"),
        fetchData("professeurs"),
      ]);

    // Vérifier que le professeur existe
    const professor = professors.find((p) => p.id === professorId);
    if (!professor) {
      throw new Error("Professeur non trouvé");
    }

    // Filtrer les cours du professeur
    const professorCourses = allCourses.filter(
      (course) => course.id_professeur === professorId
    );

    // Groupement des étudiants par classe
    const studentsByClass = {};
    allStudents.forEach((student) => {
      if (student.id_classe) {
        if (!studentsByClass[student.id_classe]) {
          studentsByClass[student.id_classe] = [];
        }
        studentsByClass[student.id_classe].push(student.id);
      }
    });

    // Calcul des statistiques par cours
    const coursesStats = professorCourses.map((course) => {
      const courseAbsences = allAbsences.filter(
        (a) => a.id_cours === course.id
      );
      const courseClasses = course.classes || [];

      // Calcul du nombre total d'étudiants concernés par ce cours
      let totalStudents = 0;
      courseClasses.forEach((classId) => {
        totalStudents += studentsByClass[classId]?.length || 0;
      });

      // Nombre d'absences pour ce cours
      const absentCount = courseAbsences.length;
      const presentCount = totalStudents - absentCount;

      return {
        courseId: course.id,
        courseName: course.module?.libelle || `Cours #${course.id}`,
        date: course.date_cours,
        heure: `${course.heure_debut} - ${course.heure_fin}`,
        totalStudents,
        absentCount,
        presentCount,
        absenteeRate:
          totalStudents > 0 ? (absentCount / totalStudents) * 100 : 0,
        presenceRate:
          totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0,
      };
    });

    // Calcul des statistiques globales pour le professeur
    const globalStats = {
      totalCourses: professorCourses.length,
      totalStudents: Object.values(studentsByClass).flat().length,
      totalAbsences: allAbsences.filter((a) =>
        professorCourses.some((c) => c.id === a.id_cours)
      ).length,
      coursesStats,
    };

    // Ajout du taux global
    globalStats.globalAbsenteeRate =
      globalStats.totalStudents > 0
        ? (globalStats.totalAbsences / globalStats.totalStudents) * 100
        : 0;

    return {
      professorInfo: {
        id: professor.id,
        nom: professor.utilisateur?.nom || "Inconnu",
        prenom: professor.utilisateur?.prenom || "Inconnu",
        specialite: professor.specialite,
      },
      ...globalStats,
    };
  } catch (error) {
    console.error("Erreur dans calculateProfessorAbsenteeismRate:", error);
    throw error;
  }
}

export async function getAbsenteeismStats(professorId) {
  try {
    // Récupérer les stats spécifiques au professeur
    const stats = await calculateProfessorAbsenteeismRate(professorId);

    // Utiliser coursesStats plutôt que les stats brutes
    const topStats = stats.coursesStats
      .sort((a, b) => b.absenteeRate - a.absenteeRate)
      .slice(0, 10);

    return {
      labels: topStats.map(
        (stat) => `${stat.courseName.substring(0, 20)}...\n${stat.date}`
      ),
      presenceData: topStats.map((stat) => stat.presenceRate),
      absenceData: topStats.map((stat) => stat.absenteeRate),
      rawData: topStats,
      // Ajouter les infos globales et du professeur
      globalStats: {
        professorName: `${stats.professorInfo.prenom} ${stats.professorInfo.nom}`,
        globalAbsenteeRate: stats.globalAbsenteeRate,
        totalCourses: stats.totalCourses,
        totalAbsences: stats.totalAbsences,
      },
    };
  } catch (error) {
    console.error("Erreur dans getAbsenteeismStats:", error);
    throw error;
  }
}

export async function getIdProfeseurByUserId(id_utilisateur) {
  const professeurs = await fetchData("professeurs");
  const prof = professeurs.find(
    (item) => item.id_utilisateur == id_utilisateur
  );
  const actorId = prof ? prof.id : null;
  return actorId;
}

export async function getProfessorClassesBasic(professorId) {
  try {
    const [classesProfesseur, classes, filieres, niveaux] = await Promise.all([
      fetchData("classes_professeur"),
      fetchData("classes"),
      fetchData("filieres"),
      fetchData("niveaux"),
    ]);

    return classesProfesseur
      .filter((cp) => cp.id_professeur === professorId.toString())
      .map((cp) => {
        const classe = classes.find(
          (c) => c.id.toString() === cp.id_classe.toString()
        );
        if (!classe) return null;

        const filiere = filieres.find(
          (f) => f.id.toString() === classe.id_filiere.toString()
        );
        const niveau = niveaux.find(
          (n) => n.id.toString() === classe.id_niveau.toString()
        );

        return {
          id: classe.id,
          libelle: classe.libelle,
          capacite_max: classe.capacite_max,
          statut: classe.state,
          filiere: filiere?.libelle || "Inconnue",
          niveau: niveau?.libelle || "Inconnu",
          est_principal: cp.est_principal || false,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Erreur récupération basique des classes:", error);
    throw error;
  }
}

export async function getProfessorClassesDetailed(professorId, classId) {
  try {
    // Récupération de toutes les données nécessaires
    const [
      classesProfesseur,
      classes,
      filieres,
      niveaux,
      anneeScolaires,
      professeurs,
      modules,
      cours,
      apprenants,
      utilisateurs,
    ] = await Promise.all([
      fetchData("classes_professeur"),
      fetchData("classes"),
      fetchData("filieres"),
      fetchData("niveaux"),
      fetchData("annee_scolaire"),
      fetchData("professeurs"),
      fetchData("modules"),
      fetchData("cours"),
      fetchData("etudiants"),
      fetchData("utilisateurs"),
    ]);

    // 1. Vérifier que le professeur est bien associé à la classe demandée
    const isProfessorInClass = classesProfesseur.some(
      (cp) => cp.id_professeur === professorId && cp.id_classe === classId
    );

    if (!isProfessorInClass) return null;

    // 2. Trouver la classe spécifique
    const classe = classes.find((c) => c.id === classId);
    if (!classe) return null;

    // 3. Récupérer les étudiants de la classe (via la table apprenants)
    const students = apprenants
      .filter((a) => a.id_classe === classId) // Ici 'id' dans apprenants correspond à l'id de classe
      .map((a) => {
        const user = utilisateurs.find((u) => u.id === a.id_utilisateur);
        return user
          ? {
              id: a.id,
              matricule: a.matricule,
              nom: user.nom,
              prenom: user.prenom,
              email: user.email,
              telephone: user.telephone,
              avatar: user.avatar,
            }
          : null;
      })
      .filter(Boolean);

    // 4. Trouver les modules enseignés par ce professeur
    const professorModuleIds = [
      ...new Set(
        cours
          .filter((c) => c.id_professeur === professorId)
          .map((c) => c.id_module)
      ),
    ];

    // 5. Construire l'objet de réponse
    return {
      id: classe.id,
      libelle: classe.libelle,
      capacite_max: classe.capacite_max,
      statut: classe.state,
      filiere: filieres.find((f) => f.id === classe.id_filiere) || {
        id: null,
        libelle: "Inconnue",
        description: "",
      },
      niveau: niveaux.find((n) => n.id === classe.id_niveau) || {
        id: null,
        libelle: "Inconnu",
      },
      annee_scolaire:
        anneeScolaires.find((a) => a.id === (classe.id_annee || "")) || null,
      modules: modules
        .filter(
          (m) =>
            m.id_filiere === classe.id_filiere &&
            m.id_niveau === classe.id_niveau &&
            professorModuleIds.includes(m.id)
        )
        .map((m) => ({
          id: m.id,
          code: m.code_module,
          libelle: m.libelle,
          heures_total: m.nombre_heures_total,
        })),
      etudiants: students,
      nombre_etudiants: students.length,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération détaillée de la classe:",
      error
    );
    throw error;
  }
}
