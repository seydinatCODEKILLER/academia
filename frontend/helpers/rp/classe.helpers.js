import { renderStudentCard } from "../../components/card/card.js";
import { createClassFiltersForRp } from "../../components/filter/filter.js";
import { createClassForm } from "../../components/form/form.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../components/table/table.js";
import { createFloatingButton } from "../../components/ui/floatingButton.js";
import {
  handleClassRpSubmit,
  handleClassRpUpdate,
} from "../../handler/rp/classeRp.handler.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";
import {
  getAllClassesBasic,
  getClassByIdDetails,
  getClasseById,
  handleArchiveClass,
  handleRestoreClass,
} from "../../services/classeServices.js";
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import { createStyledElement } from "../../utils/function.js";
import {
  showConfirmationModal,
  showLoadingModal,
} from "../attacher/justificationHelpers.js";

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
              archiver: "badge-error",
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
      items: (item) => {
        if (item.statut === "archiver") {
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
      const classe = await getClasseById(id);
      if (action === "edit") {
        await showEditClassModal(id);
      }
      if (action === "archive") {
        showArchiveConfirmation(id, classe.libelle);
      }
      if (action === "details") {
        showClassDetailsModal(id);
      }
      if (action === "restore") {
        showRestoreConfirmation(id, classe.libelle);
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

export function renderFloatingButtonAddClasse() {
  const button = createFloatingButton({
    id: "quick-add-btn",
    icon: "ri-add-line",
    title: "Création rapide",
    color: "accent",
    position: "bottom-right",
    onClick: () => showAddClassModalRp(),
  });

  document.getElementById("floatingButton").appendChild(button);
}

export async function showAddClassModalRp() {
  const form = await createClassForm();
  const modal = createModal({
    title: "Ajouter une nouvelle classe",
    content: form,
    size: "xl",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleClassRpSubmit(form);
    if (result.success) {
      modal.close();
      await renderClassesTableRp();
    }
  };

  document.getElementById("modal-classes-container").appendChild(modal);
  modal.showModal();
}

export async function showEditClassModal(classeId) {
  const classe = await getClasseById(classeId);
  console.log(classe);
  const form = await createClassForm(classe);
  const modal = createModal({
    title: `Modifier ${classe.libelle}`,
    size: "xl",
    content: form,
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleClassRpUpdate(form, classeId);
    if (result.success) {
      modal.close();
      await renderClassesTableRp();
    }
  };

  document.getElementById("modal-classes-container").appendChild(modal);
  modal.showModal();
}

export function showArchiveConfirmation(classId, classLibelle) {
  showConfirmationModal({
    title: `Archiver ${classLibelle}`,
    content:
      "Cette classe ne sera plus disponible pour les nouvelles inscriptions.",
    confirmText: "Archiver",
    confirmClass: "btn-error",
    onConfirm: async () => {
      const loading = showLoadingModal("Archivage en cours...");
      try {
        await handleArchiveClass(classId);
      } catch (error) {
        showEmptyStateModal("Erreur lors de l'archivage");
      } finally {
        loading.close();
      }
    },
  });
}

export function showRestoreConfirmation(classId, classLibelle) {
  showConfirmationModal({
    title: `Restaurer ${classLibelle}`,
    content: "La classe sera de nouveau disponible pour les inscriptions.",
    confirmText: "Restaurer",
    confirmClass: "btn-success",
    onConfirm: async () => {
      const loading = showLoadingModal("Restauration en cours...");
      try {
        await handleRestoreClass(classId);
      } catch (error) {
        showEmptyStateModal("Erreur lors de la restauration");
      } finally {
        loading.close();
      }
    },
  });
}

export async function showClassDetailsModal(classId) {
  const loadingModal = showLoadingModal("Chargement des détails...");

  try {
    const classe = await getClassByIdDetails(classId);
    if (!classe) {
      showEmptyStateModal("Classe introuvable");
      return;
    }

    const classInfoSection = document.createElement("div");
    classInfoSection.className = "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8";
    classInfoSection.innerHTML = `
      <div class="space-y-4">
        <h3 class="font-bold text-lg">Informations de base</h3>
        <div>
          <label class="text-sm text-gray-500">Filière</label>
          <p class="font-medium">${
            classe.filiere?.libelle || "Non renseignée"
          }</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Niveau</label>
          <p class="font-medium">${
            classe.niveau?.libelle || "Non renseigné"
          }</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Année scolaire</label>
          <p class="font-medium">${
            classe.annee_scolaire?.libelle || "Non renseignée"
          }</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <h3 class="font-bold text-lg">Statistiques</h3>
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Capacité</div>
            <div class="stat-value">${classe.capacite_max}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Étudiants</div>
            <div class="stat-value">${classe.stats.nombre_etudiants}</div>
            <div class="stat-desc">${
              classe.stats.taux_remplissage
            }% de remplissage</div>
          </div>
          <div class="stat">
            <div class="stat-title">Professeurs</div>
            <div class="stat-value">${classe.stats.nombre_professeurs}</div>
          </div>
        </div>
      </div>
    `;

    const studentsSection = document.createElement("div");
    studentsSection.className = "mt-8";
    studentsSection.innerHTML = `<h3 class="font-bold text-lg mb-4">Étudiants inscrits (${classe.etudiants.length})</h3>`;

    if (classe.etudiants.length > 0) {
      const studentsGrid = document.createElement("div");
      studentsGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

      classe.etudiants.forEach((etudiant, index) => {
        const card = renderStudentCard(etudiant, index);
        studentsGrid.appendChild(card);
      });

      studentsSection.appendChild(studentsGrid);
    } else {
      studentsSection.innerHTML += `<p class="text-gray-500">Aucun étudiant inscrit dans cette classe</p>`;
    }

    const modalContent = document.createElement("div");
    modalContent.appendChild(classInfoSection);
    modalContent.appendChild(studentsSection);

    const modal = createModal({
      title: `Détails de la classe ${classe.libelle}`,
      size: "3xl",
      content: modalContent,
      scrollable: true,
    });

    document.getElementById("modal-classes-container").appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des détails");
  } finally {
    loadingModal.close();
  }
}
