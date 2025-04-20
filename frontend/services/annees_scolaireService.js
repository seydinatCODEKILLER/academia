import { fetchData } from "./api.js";

export async function getAllAnneesScolaires() {
  try {
    const annees = await fetchData("annee_scolaire");
    return annees
      .map((annee) => ({
        id: annee.id,
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

export async function getCurrentAcademicYear() {
  const annees = await fetchData("annee_scolaire");
  const anneeActive = annees.find((a) => a.est_active === 1);
  return (
    anneeActive?.libelle ||
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );
}

export async function getCurrentAcademicYearId() {
  const annees = await fetchData("annee_scolaire");
  return annees.find((a) => a.est_active === 1)?.id;
}
