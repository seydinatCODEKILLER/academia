import { createClassFiltersForRp } from "../../components/filter/filter.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../components/table/table.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";
import { getAllClassesBasic } from "../../services/classeServices.js";
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import { createStyledElement } from "../../utils/function.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderClassesTableRp(filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des classes...");
    let classes = await getAllClassesBasic();
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      classes = classes.filter((classe) =>
        classe.libelle.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.filiere) {
      classes = classes.filter(
        (classe) => classe.filiere.id == filters.filiere
      );
    }
    if (filters.annee) {
      classes = classes.filter(
        (classe) => classe.annee_scolaire.id == filters.annee
      );
    }
    if (filters.niveau) {
      classes = classes.filter((classe) => classe.niveau.id == filters.niveau);
    }
    const columns = [
      {
        header: "Libellé",
        key: "libelle",
        render: (item) =>
          createStyledElement("span", "font-medium", item.libelle),
      },
      {
        header: "Filière",
        key: "filiere",
        render: (item) =>
          createStyledElement(
            "span",
            "badge badge-soft badge-info",
            item.filiere.libelle
          ),
      },
      {
        header: "Niveau",
        key: "niveau",
        render: (item) =>
          createStyledElement("span", "text-sm", item.niveau.libelle),
      },
      {
        header: "Année scolaire",
        key: "annee_scolaire",
        render: (item) =>
          createStyledElement("span", "text-xs", item.annee_scolaire.libelle),
      },
      {
        header: "Capacité",
        key: "capacite",
        render: (item) =>
          createStyledElement("span", "text-right", item.capacite),
      },
      {
        header: "Statut",
        key: "statut",
        render: (item) => {
          const statusClass =
            {
              disponible: "badge-success",
              complet: "badge-warning",
              archivée: "badge-error",
            }[item.statut] || "badge-neutral";

          return createStyledElement(
            "span",
            `badge badge-soft ${statusClass}`,
            item.statut.charAt(0).toUpperCase() + item.statut.slice(1)
          );
        },
      },
    ];
    const actionsConfig = {
      type: "dropdown",
      items: [
        {
          name: "edit",
          label: "Modifier",
          icon: "ri-edit-line",
          className: "text-info",
        },
        {
          name: "archive",
          label: "Archiver",
          icon: "ri-archive-line",
          className: "text-error",
        },
        {
          name: "details",
          label: "Details",
          icon: "ri-eye-line",
          className: "text-primary",
        },
      ],
    };
    const handleAction = (action, id) => {
      if (action === "edit") {
        console.log(id);
        return;
      }
      if (action === "archive") {
        console.log(id);
        return;
      }
      if (action === "details") {
        console.log(id);
        return;
      }
    };
    const table = createDaisyUITable({
      tableId: "classes-table",
      columns,
      data: classes,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune classe trouvée",
      itemsPerPage: 4,
    });
    const container = document.getElementById("classes-container");
    container.innerHTML = "";
    container.appendChild(table);
    loadingModal.close();
    updateDaisyUITableData("classes-table", classes, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des classes");
  }
}

export async function updateClassesTableWithFiltersForRp(filters = {}) {
  await renderClassesTableRp(filters);
}

export async function renderClasseTableFilterForRp() {
  const [filieres, niveaux, anneesScolaires] = await Promise.all([
    getAllFilieres(),
    getAllNiveaux(),
    getAllAnneesScolaires(),
  ]);
  const filters = createClassFiltersForRp({
    filieres,
    niveaux,
    anneesScolaires,
    onFilter: (filters) => updateClassesTableWithFiltersForRp(filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}
