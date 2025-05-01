import { API_BASE_URL } from "./api.js";

export async function updateAbsenceStatus(idAbsence) {
  try {
    const response = await fetch(`${API_BASE_URL}/absences/${idAbsence}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        justified: "justifier",
      }),
    });

    if (!response.ok) throw new Error("Erreur lors de la mise à jour");

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}
