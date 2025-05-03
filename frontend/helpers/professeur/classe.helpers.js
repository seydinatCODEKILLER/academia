import { createIllustratedBanner } from "../../components/banner/banner.js";
import {
  createProfessorClassesCards,
  updateProfessorClassesCardsData,
} from "../../components/card/cardClasses.js";
import { createClasseFiltersForProfessor } from "../../components/filter/filter.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import { getProfessorClassesBasic } from "../../services/professeurService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderClasseCardProfesseur(idProfesseur, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des classes...");
    let classes = await getProfessorClassesBasic(idProfesseur);
    console.log(classes);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      classes = classes.filter((c) =>
        c.libelle.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.filiere) {
      classes = classes.filter((classe) => classe.filiere == filters.filiere);
    }
    if (filters.niveau) {
      classes = classes.filter((classe) => classe.niveau == filters.niveau);
    }

    // 2. Configurer les actions possibles
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        return [
          {
            name: "details",
            label: "Details",
            icon: "ri-arrow-go-back-line",
            className: "text-error",
            type: "direct",
            showLabel: true,
          },
        ];
      },
    };

    const handleAction = async (action, id) => {
      switch (action) {
        case "details":
          await showDetailsClasseModal(id, idProfesseur);
          break;
        case "archive":
          alert(`archive clicked ${id}`);
          break;
      }
    };

    // 3. Créer le composant d'affichage
    const classesCards = createProfessorClassesCards({
      containerId: "classes-cards",
      data: classes,
      itemsPerPage: 3,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune classe enregistrée pour cet professeur",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("classes-container");
    container.innerHTML = "";
    container.appendChild(classesCards);

    loadingModal.close();
    updateProfessorClassesCardsData("classes-cards", classes, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des classes", error.message);
  }
}

export async function renderClasseCardFilterForProfessor(idProfesseur) {
  const [filieres, niveaux] = await Promise.all([
    getAllFilieres(),
    getAllNiveaux(),
  ]);
  const filters = createClasseFiltersForProfessor({
    filieres,
    niveaux,
    onFilter: (filters) =>
      updateClasseCardWithFiltersForProfessor(idProfesseur, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateClasseCardWithFiltersForProfessor(
  idProfesseur,
  filters = {}
) {
  await renderClasseCardProfesseur(idProfesseur, filters);
}

export function renderClasseBannerForProfessor() {
  const hero = createIllustratedBanner({
    title: "Suivez vos classes en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/class.svg",
    bgColor: "bg-gray-700",
    textColor: "text-white",
  });
  document.getElementById("banner-container").appendChild(hero);
}
