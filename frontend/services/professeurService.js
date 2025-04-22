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
      utilisateur,
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

    const userInfo = utilisateur.find(
      (u) => u.id === professeur.id_utilisateur
    );

    // Récupérer les classes enseignées
    const classesEnseignees = classesProfesseur
      .filter((cp) => cp.id_professeur === professorId)
      .map((cp) => {
        const classe = classes.find((c) => c.id === cp.id_classe);
        return {
          id: cp.id_classe,
          libelle: classe?.libelle || "Classe inconnue",
          date_affectation: cp.date_affectation,
          est_principal: cp.est_principal,
        };
      });

    // Récupérer les cours donnés
    const coursDonnes = cours
      .filter((c) => c.id_professeur === professorId)
      .map((c) => {
        const classesAssociees = coursClasses
          .filter((cc) => cc.id_cours === c.id)
          .map(
            (cc) =>
              classes.find((cl) => cl.id === cc.id_classe)?.libelle ||
              "Inconnue"
          );

        return {
          id: c.id,
          date: c.date_cours,
          heure_debut: c.heure_debut,
          heure_fin: c.heure_fin,
          salle: c.salle,
          statut: c.statut,
          classes: classesAssociees,
        };
      });

    return {
      // Informations de base
      id: professeur.id,
      ...userInfo,
      specialite: professeur.specialite,
      grade: professeur.grade,
      date_embauche: professeur.date_embauche,

      // Statistiques
      stats: {
        nombre_classes: classesEnseignees.length,
        nombre_cours: coursDonnes.length,
        cours_planifies: coursDonnes.filter((c) => c.statut === "planifié")
          .length,
        cours_effectues: coursDonnes.filter((c) => c.statut === "effectué")
          .length,
      },

      // Détails des relations
      classes_enseignees: classesEnseignees,
      cours_donnes: coursDonnes,
    };
  } catch (error) {
    console.error(
      `Erreur dans getProfessorDetails pour l'ID ${professorId}:`,
      error
    );
    throw error;
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
