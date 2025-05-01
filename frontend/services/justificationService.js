import { API_BASE_URL, fetchData, generateId } from "./api.js";

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

export async function saveJustification(justificationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/justifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: String(await generateId("justifications")),
        ...justificationData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erreur lors de l'envoi de la justification"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}

export async function getStudentJustificationRequests(studentId) {
  try {
    // Récupération parallèle des données nécessaires
    const [justifications, absences, cours, modules, utilisateurs] =
      await Promise.all([
        fetchData("justifications"),
        fetchData("absences"),
        fetchData("cours"),
        fetchData("modules"),
        fetchData("utilisateurs"),
      ]);

    // Filtrer les justifications de l'étudiant
    const studentAbsenceIds = absences
      .filter((absence) => absence.id_etudiant === studentId)
      .map((absence) => absence.id);

    const studentJustifications = justifications.filter((j) =>
      studentAbsenceIds.includes(j.id_absence)
    );

    // Enrichir chaque justification avec les détails
    return studentJustifications.map((justification) => {
      const relatedAbsence = absences.find(
        (a) => a.id === justification.id_absence
      );
      const relatedCourse = cours.find(
        (c) => c.id === relatedAbsence?.id_cours
      );
      const module = modules.find((m) => m.id === relatedCourse?.id_module);
      const processedBy = utilisateurs.find(
        (u) => u.id === justification.id_traitant
      );

      return {
        id: justification.id,
        date_demande: justification.date_justification,
        statut: justification.statut,
        motif: justification.motif,
        pieces_jointes: justification.pieces_jointes,
        date_traitement: justification.date_traitement,
        commentaire: justification.commentaire_traitement,
        absence: relatedAbsence
          ? {
              id: relatedAbsence.id,
              date: relatedAbsence.date_absence,
              cours: relatedCourse
                ? {
                    id: relatedCourse.id,
                    module: module
                      ? {
                          id: module.id,
                          libelle: module.libelle,
                        }
                      : null,
                    heure_debut: relatedCourse.heure_debut,
                    heure_fin: relatedCourse.heure_fin,
                    salle: relatedCourse.salle,
                  }
                : null,
            }
          : null,
        traite_par: processedBy
          ? {
              id: processedBy.id,
              nom: processedBy.nom,
              prenom: processedBy.prenom,
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Erreur dans getStudentJustificationRequests:", error);
    throw error;
  }
}
