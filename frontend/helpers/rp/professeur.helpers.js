import { createIllustratedBanner } from "../../components/banner/banner.js";
import { createProfesseurFiltersForRp } from "../../components/filter/filter.js";
import { createProfesseursForm } from "../../components/form/form.js";
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
  handleProffRpSubmit,
  handleProffRpUpdate,
} from "../../handler/rp/professeurRp.handler.js";
import {
  getAllProfessorsBasic,
  getProfessorDetails,
  handleArchiveProfesseur,
  handleRestoreProfesseur,
} from "../../services/professeurService.js";
import { createStyledElement, formatDate } from "../../utils/function.js";
import {
  showConfirmationModal,
  showLoadingModal,
} from "../attacher/justificationHelpers.js";

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
      const { informations, ids } = await getProfessorDetails(id);
      if (action === "edit") await showEditProfesseurModal(id);
      if (action === "archive")
        showArchiveProfesseurConfirmation(ids.utilisateur, informations.prenom);
      if (action === "details") showProfessorDetailsModal(id);
      if (action === "restore")
        showRestoreProfesseurConfirmation(ids.utilisateur, informations.prenom);
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

export function renderProfesseurBannerForRp() {
  const hero = createIllustratedBanner({
    title: "Suivez vos professeurs en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/teacher.svg",
    bgColor: "bg-blue-500",
    textColor: "text-white",
  });
  document.getElementById("banner-container").appendChild(hero);
}

export function renderFloatingButtonAddProfesseur() {
  const button = createFloatingButton({
    id: "quick-add-btn",
    icon: "ri-add-line",
    title: "Création rapide",
    color: "warning",
    position: "bottom-right",
    onClick: async () => await showAddProfesseurModalRp(),
  });

  document.getElementById("floatingButton").appendChild(button);
}

export async function showAddProfesseurModalRp() {
  const form = await createProfesseursForm();
  const modal = createModal({
    title: "Ajouter une nouvelle professeur",
    content: form,
    size: "2xl",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleProffRpSubmit(form);
    if (result.success) {
      modal.close();
      await renderProfesseursTableRp();
    }
  };

  document.getElementById("modal-professeurs-container").appendChild(modal);
  modal.showModal();
}

export async function showEditProfesseurModal(profId) {
  const professeur = await getProfessorDetails(profId);

  const form = await createProfesseursForm(professeur);
  const modal = createModal({
    title: `Modifier ${professeur.informations.prenom}`,
    size: "2xl",
    content: form,
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleProffRpUpdate(form, profId);
    if (result.success) {
      modal.close();
      await renderProfesseursTableRp();
    }
  };

  document.getElementById("modal-professeurs-container").appendChild(modal);
  modal.showModal();
}

export function showArchiveProfesseurConfirmation(userId, username) {
  showConfirmationModal({
    title: `Archiver ${username}`,
    content: "Cette professeur ne sera plus disponible.",
    confirmText: "Archiver",
    confirmClass: "btn-error",
    onConfirm: async () => {
      const loading = showLoadingModal("Archivage en cours...");
      try {
        await handleArchiveProfesseur(userId);
      } catch (error) {
        showEmptyStateModal("Erreur lors de l'archivage");
      } finally {
        loading.close();
      }
    },
  });
}

export function showRestoreProfesseurConfirmation(userId, username) {
  showConfirmationModal({
    title: `Restaurer ${username}`,
    content: "La professeur sera de nouveau disponible.",
    confirmText: "Restaurer",
    confirmClass: "btn-success",
    onConfirm: async () => {
      const loading = showLoadingModal("Restauration en cours...");
      try {
        await handleRestoreProfesseur(userId);
      } catch (error) {
        showEmptyStateModal("Erreur lors de la restauration");
      } finally {
        loading.close();
      }
    },
  });
}

export async function showProfessorDetailsModal(professorId) {
  const loadingModal = showLoadingModal(
    "Chargement des détails du professeur..."
  );

  try {
    const professeur = await getProfessorDetails(professorId);
    if (!professeur) {
      showEmptyStateModal("Professeur introuvable");
      return;
    }

    // Section Informations de base
    const infoSection = document.createElement("div");
    infoSection.className = "";
    infoSection.innerHTML = `
    <h3 class="font-bold text-lg">Informations personnelles</h3>
      <div class="grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="flex items-center gap-4 mb-4 col-span-full">
          <img src="${professeur.informations.avatar || "default-avatar.jpg"}" 
               class="w-16 h-16 rounded-full object-cover">
          <div>
            <h2 class="text-xl font-bold">${professeur.informations.prenom} ${
      professeur.informations.nom
    }</h2>
            <p class="text-gray-600">${professeur.informations.grade}</p>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-500">Spécialité</label>
          <p class="font-medium">${professeur.informations.specialite}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Email</label>
          <p class="font-medium">${professeur.informations.email}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Téléphone</label>
          <p class="font-medium">${
            professeur.informations.telephone || "Non renseigné"
          }</p>
        </div>
      </div>
    `;

    // Section Classes enseignées
    const classesSection = document.createElement("div");
    classesSection.className = "mt-8";
    classesSection.innerHTML = `<h3 class="font-bold text-lg mb-4">Classes enseignées (${professeur.relations.classes.length})</h3>`;

    if (professeur.relations.classes.length > 0) {
      const classesGrid = document.createElement("div");
      classesGrid.className =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

      professeur.relations.classes.forEach((classe) => {
        classesGrid.innerHTML += `
          <div class="card bg-base-100 shadow-sm border border-gray-100">
            <div class="card-body p-4">
              <h4 class="card-title">${classe.libelle_classe}</h4>
              <p class="text-sm text-gray-500">
                Affecté depuis: ${formatDate(classe.date_affectation)}
              </p>
            </div>
          </div>
        `;
      });

      classesSection.appendChild(classesGrid);
    } else {
      classesSection.innerHTML += `<p class="text-gray-500">Ce professeur n'enseigne dans aucune classe actuellement</p>`;
    }

    // Section Cours donnés - Version Card
    const coursSection = document.createElement("div");
    coursSection.className = "mt-8";
    coursSection.innerHTML = `<h3 class="font-bold text-lg mb-4">Cours donnés (${professeur.relations.cours.length})</h3>`;

    if (professeur.relations.cours.length > 0) {
      const coursGrid = document.createElement("div");
      coursGrid.className =
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4";

      professeur.relations.cours.forEach((cours) => {
        const card = document.createElement("div");
        card.className = `card bg-base-100 shadow-sm border ${
          cours.statut === "effectué"
            ? "border-green-100"
            : cours.statut === "planifier"
            ? "border-blue-100"
            : "border-orange-100"
        }`;

        card.innerHTML = `
      <div class="card-body p-4">
        <div class="flex justify-between items-start">
          <h4 class="card-title text-lg">
            ${formatDate(cours.date)}
            <span class="badge ml-2 ${
              cours.statut === "effectué"
                ? "badge-success"
                : cours.statut === "planifié"
                ? "badge-info"
                : "badge-warning"
            }">
              ${cours.statut}
            </span>
          </h4>
          <span class="text-sm text-gray-500">
            ${cours.heure_debut} - ${cours.heure_fin}
          </span>
        </div>
        
        <div class="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span class="text-sm text-gray-500">Module:</span>
            <p class="font-medium">${cours.id_module || "Non spécifié"}</p>
          </div>
          
          <div>
            <span class="text-sm text-gray-500">Salle:</span>
            <p class="font-medium">${cours.salle || "Non spécifiée"}</p>
          </div>
          
          <div>
            <span class="text-sm text-gray-500">Classes:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              ${cours.classes
                .map(
                  (c) => `
                <span class="badge badge-outline">
                  ${c.libelle}
                </span>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

        coursGrid.appendChild(card);
      });

      coursSection.appendChild(coursGrid);
    } else {
      coursSection.innerHTML += `
    <div class="alert alert-info">
      <i class="ri-information-line"></i>
      Aucun cours enregistré pour ce professeur
    </div>
  `;
    }

    // Construction du modal
    const modalContent = document.createElement("div");
    modalContent.appendChild(infoSection);
    modalContent.appendChild(classesSection);
    modalContent.appendChild(coursSection);

    const modal = createModal({
      title: `Prof. ${professeur.informations.prenom} ${professeur.informations.nom}`,
      size: "3xl",
      content: modalContent,
      scrollable: true,
      showCloseButton: true,
    });

    document.getElementById("modal-professeurs-container").appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des détails du professeur");
  } finally {
    loadingModal.close();
  }
}
