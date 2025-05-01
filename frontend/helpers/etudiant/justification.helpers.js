import {
  createJustificationCards,
  updateJustificationCardsData,
} from "../../components/card/cardJustification.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import { getStudentJustificationRequests } from "../../services/justificationService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderJustificationCardEtudiant(
  idEtudiant,
  filters = {}
) {
  try {
    const loadingModal = showLoadingModal("Chargement des justifications...");
    let justificationsData = await getStudentJustificationRequests(idEtudiant);
    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      absencesData = absencesData.filter(
        (c) =>
          c.cours.module.libelle.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    const justificationCards = createJustificationCards({
      data: justificationsData,
      containerId: "justification-cards",
      itemsPerPage: 4,
      emptyMessage: "Aucune justification enregistrée pour cet étudiant",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("justification-container");
    container.innerHTML = "";
    container.appendChild(justificationCards);

    loadingModal.close();
    updateJustificationCardsData("justification-cards", justificationsData, 1);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal(
      "Erreur lors du chargement des justification",
      error.message
    );
  }
}
