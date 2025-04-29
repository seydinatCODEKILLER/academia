import { fetchData } from "./api.js";

export async function getAllModules() {
  try {
    const modules = await fetchData("modules");
    return modules.map((m) => ({
      id: m.id,
      libelle: m.libelle,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    return [];
  }
}
