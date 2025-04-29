import { fetchData } from "./api.js";

export async function getAllSemestres() {
  try {
    const semestres = await fetchData("semestres");
    return semestres.map((s) => ({
      id: s.id,
      libelle: s.libelle,
      annee_scolaire: s.annee_scolaire,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des semestres:", error);
    return [];
  }
}
