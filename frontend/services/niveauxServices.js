import { fetchData } from "./api.js";

export async function getAllNiveaux() {
  try {
    const niveaux = await fetchData("niveaux");
    return niveaux.map((niveau) => ({
      id: niveau.id,
      libelle: niveau.libelle,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des filières:", error);
    return [];
  }
}
