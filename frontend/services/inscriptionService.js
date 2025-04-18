import { API_BASE_URL, fetchData } from "./api.js";

export async function submitReinscription(data) {
  try {
    // 1. Enregistrement de la réinscription
    const inscriptionResponse = await fetch(`${API_BASE_URL}/inscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(await generateIdForInscription()),
        ...data,
        est_reinscription: 1,
        statut: "validée",
        date_inscription: new Date().toISOString(),
      }),
    });

    if (!inscriptionResponse.ok) {
      throw new Error("Échec de l'enregistrement de la réinscription");
    }

    // 2. Mise à jour de la classe de l'étudiant
    const updateResponse = await updateStudentClass(
      data.id_etudiant,
      data.id_classe
    );

    return {
      inscription: await inscriptionResponse.json(),
      update: await updateResponse.json(),
    };
  } catch (error) {
    console.error("Erreur complète réinscription:", error);
    throw error;
  }
}

async function updateStudentClass(studentId, newClassId) {
  const response = await fetch(`${API_BASE_URL}/etudiants/${studentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_classe: newClassId,
    }),
  });

  if (!response.ok) {
    throw new Error("Échec de la mise à jour de la classe");
  }

  return response;
}

export async function checkExistingReinscription(studentId, anneeScolaire) {
  const allInscriptions = await fetchData("inscriptions");

  return allInscriptions.some(
    (inscription) =>
      inscription.id_etudiant == studentId &&
      inscription.annee_scolaire === anneeScolaire &&
      inscription.est_reinscription === true
  );
}

export async function generateIdForInscription() {
  const rv = await fetchData("inscriptions");
  const id = rv.length > 0 ? parseInt(rv[rv.length - 1].id) + 1 : 1;
  return id;
}
