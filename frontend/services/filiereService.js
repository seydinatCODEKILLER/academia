import { fetchData } from "./api.js";

export async function getAllFilieres() {
  try {
    const filieres = await fetchData("filieres");
    return filieres.map((filiere) => ({
      id: filiere.id_filiere,
      libelle: filiere.libelle,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des filières:", error);
    return [];
  }
}
