import { API_BASE_URL, fetchData, generateId } from "./api.js";

export async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: String(await generateId("utilisateurs")),
        ...userData,
      }),
    });
    return response.json();
  } catch (error) {
    throw new Error(`erreur lors de la creation de l'utilisateur : ${error}`);
  }
}

/**
 * Vérifie si un email existe déjà dans la base de données
 * @param {string} email - L'email à vérifier
 * @returns {Promise<boolean>} - True si l'email existe, false sinon
 */
export async function checkEmailExists(email) {
  try {
    const users = await fetchData("utilisateurs");

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    return emailExists;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    return false;
  }
}

/**
 * Vérifie si un matricule existe déjà dans la base de données
 * @param {string} matricule - Le matricule à vérifier
 * @returns {Promise<boolean>} - True si le matricule existe, false sinon
 */
export async function checkMatriculeExists(matricule) {
  try {
    const etudiants = await fetchData("etudiants");
    const matriculeExists = etudiants.some(
      (etudiant) => etudiant.matricule.toLowerCase() === matricule.toLowerCase()
    );

    return matriculeExists;
  } catch (error) {
    console.error("Erreur lors de la vérification du matricule:", error);
    return false;
  }
}
