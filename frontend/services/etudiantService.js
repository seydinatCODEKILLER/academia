import { fetchData } from "./api.js";

// services/etudiantService.js
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
