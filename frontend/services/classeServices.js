import { API_BASE_URL, fetchData, generateId } from "./api.js";

export async function getAllClassesBasic() {
  try {
    // Récupération parallèle des données
    const [classes, filieres, niveaux, anneeScolaires] = await Promise.all([
      fetchData("classes"),
      fetchData("filieres"),
      fetchData("niveaux"),
      fetchData("annee_scolaire"),
    ]);

    // Mapping des classes avec les informations associées
    return classes.map((classe) => {
      const filiere = filieres.find((f) => f.id === classe.id_filiere);
      const niveau = niveaux.find((n) => n.id === classe.id_niveau);
      const anneeScolaire = anneeScolaires.find(
        (a) => a.id === classe.id_annee
      );

      return {
        id: classe.id,
        libelle: classe.libelle,
        capacite: classe.capacite_max,
        statut: classe.state,
        filiere: {
          id: filiere?.id || null,
          libelle: filiere?.libelle || "Inconnue",
        },
        niveau: {
          id: niveau?.id || null,
          libelle: niveau?.libelle || "Inconnu",
        },
        annee_scolaire: {
          id: anneeScolaire?.id || null,
          libelle: anneeScolaire?.libelle || "Inconnue",
        },
      };
    });
  } catch (error) {
    console.error("Erreur dans getAllClassesBasic:", error);
    throw error;
  }
}

export async function createClasse(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        id: String(await generateId("classes")),
      }),
    });

    if (!response.ok) throw new Error("Erreur API");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

export async function updatedClasse(data, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        libelle: data.libelle,
        id_niveau: data.id_niveau,
        id_filiere: data.id_filiere,
        capacite_max: data.capacite_max,
      }),
    });

    if (!response.ok) throw new Error("Erreur API");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

export async function checkExistingClass(libelle, excludeId = null) {
  const classes = await fetchData("classes");
  return classes.some(
    (c) => (excludeId ? c.id !== excludeId : true) && c.libelle === libelle
  );
}

export async function getClasseById(id) {
  try {
    const response = await fetchData("classes", id);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function handleArchiveClass(classId) {
  const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "archiver" }),
  });

  if (!response.ok) throw new Error("Échec de l'archivage");
  return await response.json();
}

export async function handleRestoreClass(classId) {
  const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: "disponible" }),
  });

  if (!response.ok) throw new Error("Échec de la restauration");
  return await response.json();
}

export async function getClassByIdDetails(id) {
  try {
    // Récupération parallèle de toutes les données nécessaires
    const [
      classe,
      filieres,
      niveaux,
      anneeScolaires,
      classesAttaches,
      attaches,
      utilisateurs,
      classesProfesseurs,
      professeurs,
      etudiants,
      coursClasses,
      cours,
    ] = await Promise.all([
      fetchData("classes", id),
      fetchData("filieres"),
      fetchData("niveaux"),
      fetchData("annee_scolaire"),
      fetchData("classes_attaches"),
      fetchData("attaches"),
      fetchData("utilisateurs"),
      fetchData("classes_professeur"),
      fetchData("professeurs"),
      fetchData("etudiants"),
      fetchData("cours_classes"),
      fetchData("cours"),
    ]);

    if (!classe) return null;

    // Construction de l'objet complet
    return {
      ...classe,
      // Informations de base
      filiere: filieres.find((f) => f.id === classe.id_filiere),
      niveau: niveaux.find((n) => n.id === classe.id_niveau),
      annee_scolaire: anneeScolaires.find((a) => a.id === classe.id_annee),

      // Attachés pédagogiques
      attaches: classesAttaches
        .filter((ca) => ca.id_classe === id)
        .map((ca) => ({
          ...attaches.find((a) => a.id === ca.id_attache),
          utilisateur: utilisateurs.find(
            (u) =>
              u.id ===
              attaches.find((a) => a.id === ca.id_attache)?.id_utilisateur
          ),
        })),

      // Professeurs
      professeurs: classesProfesseurs
        .filter((cp) => cp.id_classe === id)
        .map((cp) => ({
          ...professeurs.find((p) => p.id === cp.id_professeur),
          utilisateur: utilisateurs.find(
            (u) =>
              u.id ===
              professeurs.find((p) => p.id === cp.id_professeur)?.id_utilisateur
          ),
          date_affectation: cp.date_affectation,
          est_principal: cp.est_principal,
        })),

      // Étudiants
      etudiants: etudiants
        .filter((e) => e.id_classe === id)
        .map((e) => ({
          ...e,
          utilisateur: utilisateurs.find((u) => u.id === e.id_utilisateur),
        })),

      // Cours associés
      cours: coursClasses
        .filter((cc) => cc.id_classe === id)
        .map((cc) => ({
          ...cours.find((c) => c.id === cc.id_cours),
          module: fetchData(
            "modules",
            cours.find((c) => c.id === cc.id_cours)?.id_module
          ),
        })),

      // Statistiques
      stats: {
        nombre_etudiants: etudiants.filter((e) => e.id_classe === id).length,
        nombre_professeurs: classesProfesseurs.filter(
          (cp) => cp.id_classe === id
        ).length,
        taux_remplissage: Math.round(
          (etudiants.filter((e) => e.id_classe === id).length /
            classe.capacite_max) *
            100
        ),
      },
    };
  } catch (error) {
    console.error(`Erreur dans getClassById pour l'ID ${id}:`, error);
    throw error;
  }
}

export async function getAvailableClasses() {
  try {
    const classes = await fetchData("classes");
    return classes
      .filter((classe) => classe.state === "disponible")
      .map((classe) => ({
        id: classe.id,
        libelle: classe.libelle,
      }));
  } catch (error) {
    console.error("Erreur dans getAvailableClasses:", error);
    throw error;
  }
}

export async function createClassProfesseur(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/classes_professeur`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
}
