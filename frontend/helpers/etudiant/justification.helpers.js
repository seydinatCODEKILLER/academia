import { createIllustratedBanner } from "../../components/banner/banner.js";
import {
  createJustificationCards,
  updateJustificationCardsData,
} from "../../components/card/cardJustification.js";
import { createAbsenceFiltersForEtudiant } from "../../components/filter/filter.js";
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
    console.log(justificationsData);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      justificationsData = justificationsData.filter((c) =>
        c.absence.cours.module.libelle.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.statut) {
      justificationsData = justificationsData.filter(
        (c) => c.statut == filters.statut
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

export function rendeJustificationBannerForEtudiant() {
  const hero = createIllustratedBanner({
    title: "Suivez vos justification en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/justification.svg",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-500",
  });
  document.getElementById("banner-container").appendChild(hero);
}

export async function renderJustificationCardFilterForEtudiant(idEtudiant) {
  const statut = [
    { id: "EN_ATTENTE", libelle: "en attente" },
    { id: "ACCEPTE", libelle: "accepter" },
    { id: "REFUSE", libelle: "refuser" },
  ];
  const filters = createAbsenceFiltersForEtudiant({
    statut,
    onFilter: (filters) =>
      updateJustificationCardWithFiltersForEtudiant(idEtudiant, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateJustificationCardWithFiltersForEtudiant(
  idEtudiant,
  filters = {}
) {
  await renderJustificationCardEtudiant(idEtudiant, filters);
}
