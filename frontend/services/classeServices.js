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

export async function checkExistingClass(libelle) {
  const classes = await fetchData("classes");
  return classes.some((c) => c.libelle === libelle && c.state !== "archiver");
}
