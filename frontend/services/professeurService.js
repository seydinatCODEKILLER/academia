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
