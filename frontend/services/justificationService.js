import { API_BASE_URL } from "./api.js";

export async function updateJustificationStatus(
  idJustification,
  newStatus,
  idTraitant
) {
  try {
    const updateData = {
      statut: newStatus,
      id_traitant: idTraitant,
      date_traitement: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    const response = await fetch(
      `${API_BASE_URL}/justifications/${idJustification}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) throw new Error("Erreur lors de la mise à jour");

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}
