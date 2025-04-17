import { fetchData } from "./api.js";

export async function getAllAnneesScolaires() {
  try {
    const annees = await fetchData("annee_scolaire");
    return annees
      .map((annee) => ({
        id: annee.id_annee,
        libelle: annee.libelle,
        est_active: annee.est_active,
      }))
      .sort((a, b) => b.libelle.localeCompare(a.libelle));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des années scolaires:",
      error
    );
    return [];
  }
}
