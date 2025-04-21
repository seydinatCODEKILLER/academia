import { createProfesseurFiltersForRp } from "../../components/filter/filter.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../components/table/table.js";
import { getAllProfessorsBasic } from "../../services/professeurService.js";
import { createStyledElement } from "../../utils/function.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderProfesseursTableRp(filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des professeurs...");
    let professeurs = await getAllProfessorsBasic();
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      professeurs = professeurs.filter(
        (prof) =>
          prof.nom.toLowerCase().includes(searchTerm) ||
          prof.prenom.toLowerCase().includes(searchTerm) ||
          prof.email.toLowerCase().includes(searchTerm)
      );
    }
    const columns = [
      {
        header: "Professeur",
        key: "utilisateur",
        render: (item) => `
          <div class="flex items-center gap-2">
            <div class="avatar">
                <div class="mask mask-squircle h-12 w-12">
                    <img src="${item.avatar}"/>
               </div>
            </div>
            <div>
              <p class="font-medium">${item.prenom} ${item.nom}</p>
              <p class="text-sm text-gray-500">${item.email}</p>
            </div>
          </div>
        `,
      },
      {
        header: "Adresse",
        key: "adresse",
        render: (item) => createStyledElement("span", "text-sm", item.adresse),
      },
      {
        header: "Specialite",
        key: "specialite",
        render: (item) =>
          createStyledElement("span", "badge badge-soft", item.specialite),
      },
      {
        header: "Grade",
        key: "grade",
        render: (item) => createStyledElement("span", "text-xs", item.grade),
      },
      {
        header: "Telephone",
        key: "telephone",
        render: (item) =>
          createStyledElement("span", "text-right", item.telephone),
      },
      {
        header: "Statut",
        key: "state",
        render: (item) => {
          const statusClass =
            {
              disponible: "badge-success",
              archiver: "badge-error",
            }[item.state] || "badge-neutral";

          return createStyledElement(
            "span",
            `badge badge-soft ${statusClass}`,
            item.state.charAt(0).toUpperCase() + item.state.slice(1)
          );
        },
      },
    ];
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        if (item.state === "archiver") {
          return [
            {
              name: "restore",
              label: "Restaurer",
              icon: "ri-arrow-go-back-line",
              className: "text-success",
              type: "direct",
              showLabel: true,
            },
          ];
        }
        return [
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
            label: "Détails",
            icon: "ri-eye-line",
            className: "text-primary",
          },
        ];
      },
    };

    const handleAction = async (action, id) => {
      if (action === "edit") console.log(id);
      if (action === "archive") console.log(id);
      if (action === "details") console.log(id);
      if (action === "restore") console.log(id);
    };
    const table = createDaisyUITable({
      tableId: "professeurs-table",
      columns,
      data: professeurs,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune professeur trouvée",
      itemsPerPage: 2,
    });
    const container = document.getElementById("professeurs-container");
    container.innerHTML = "";
    container.appendChild(table);
    loadingModal.close();
    updateDaisyUITableData("professeurs-table", professeurs, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des professeurs");
  }
}

export async function updateProfesseurTableWithFiltersForRp(filters = {}) {
  await renderProfesseursTableRp(filters);
}

export async function renderProfesseurTableFilterForRp() {
  const filters = createProfesseurFiltersForRp({
    onFilter: (filters) => updateProfesseurTableWithFiltersForRp(filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}
