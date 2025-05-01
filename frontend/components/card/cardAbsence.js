import { colorState, colorStateAbsence } from "../../utils/function.js";

/**
 * Crée un composant card pour afficher les absences avec DaisyUI
 * @param {Object} config - Configuration des cards
 * @param {Array} config.data - Données des absences à afficher
 * @param {number} [config.itemsPerPage=6] - Items par page
 * @param {string} [config.containerId] - ID unique du conteneur
 * @param {Object} [config.actions] - Configuration des actions
 * @param {Function} [config.onAction] - Callback pour les actions
 * @returns {HTMLElement} Le conteneur des cards
 */
export function createAbsenceCards(config) {
  // Configuration par défaut
  const {
    data = [],
    itemsPerPage = 6,
    containerId = "absence-cards",
    actions = null,
    onAction = null,
    emptyMessage = "Aucune absence enregistrée",
  } = config;

  // Création du conteneur principal
  const container = document.createElement("div");
  container.className = "container mx-auto p-4";
  container.id = `${containerId}-container`;

  // Grille pour les cards
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  grid.id = containerId;

  // Stockage direct des configurations et données
  container._cardsConfig = {
    itemsPerPage,
    emptyMessage,
    actions,
  };

  container.currentData = data;

  if (onAction) {
    container.handleAction = onAction;
  }

  // Pagination (avec DaisyUI)
  const pagination = document.createElement("div");
  pagination.className = "flex justify-between items-center p-4 mt-6";
  pagination.id = `${containerId}-pagination`;

  const paginationInfo = document.createElement("div");
  paginationInfo.className = "text-sm text-base-content";
  paginationInfo.id = `${containerId}-pagination-info`;

  const paginationControls = document.createElement("div");
  paginationControls.className = "join";

  // Bouton précédent
  const prevBtn = document.createElement("button");
  prevBtn.className = "join-item btn btn-sm";
  prevBtn.innerHTML = "&larr; Précédent";
  prevBtn.id = `${containerId}-prev`;
  prevBtn.disabled = true;

  // Bouton suivant
  const nextBtn = document.createElement("button");
  nextBtn.className = "join-item btn btn-sm";
  nextBtn.innerHTML = "Suivant &rarr;";
  nextBtn.id = `${containerId}-next`;
  nextBtn.disabled = data.length <= itemsPerPage;

  paginationControls.appendChild(prevBtn);
  paginationControls.appendChild(nextBtn);
  pagination.appendChild(paginationInfo);
  pagination.appendChild(paginationControls);

  // Assemblage
  container.appendChild(grid);
  container.appendChild(pagination);

  // Fonction de nettoyage
  container.cleanup = () => {
    const grid = document.getElementById(containerId);
    if (grid && container._clickHandler) {
      grid.removeEventListener("click", container._clickHandler);
    }
  };

  return container;
}

/**
 * Met à jour les données des cards d'absence
 */
export function updateAbsenceCardsData(
  containerId,
  newData,
  currentPage = 1,
  onAction = null
) {
  const container = document.getElementById(`${containerId}-container`);
  if (!container) {
    console.log("Container not found");
    return;
  }

  const config = container._cardsConfig;
  const grid = document.getElementById(containerId);

  // Ne vide le grid que si nécessaire
  if (grid.innerHTML !== "") {
    grid.innerHTML = "";
  }

  // Mise à jour des données
  container.currentData = newData;

  if (onAction) {
    container.handleAction = onAction;
  }

  // Calcul de la pagination
  const startIndex = (currentPage - 1) * config.itemsPerPage;
  const endIndex = startIndex + config.itemsPerPage;
  const itemsToShow = newData.slice(startIndex, endIndex);

  if (itemsToShow.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className =
      "col-span-full text-center p-8 text-base-content/50";
    emptyMessage.textContent = config.emptyMessage;
    grid.appendChild(emptyMessage);
    return;
  }

  // Remplissage des données sous forme de cards
  itemsToShow.forEach((absence) => {
    const card = createAbsenceCard(absence, config.actions, containerId);
    grid.appendChild(card);
  });

  // Mise à jour de la pagination
  updateCardsPagination(
    containerId,
    currentPage,
    Math.ceil(newData.length / config.itemsPerPage),
    container.handleAction
  );

  // Configuration des événements
  setupCardsEvents(containerId);
}

/**
 * Crée une card individuelle pour une absence
 */
function createAbsenceCard(absence, actionsConfig, containerId) {
  const card = document.createElement("div");
  card.className =
    "card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-base-200 hover:shadow-lg transition-shadow";
  card.dataset.id = absence.id_absence;

  // Corps de la card
  const cardBody = document.createElement("div");
  cardBody.className = "p-4 relative";

  // Titre du module
  const moduleTitle = document.createElement("h3");
  moduleTitle.className = "text-lg font-semibold mb-2";
  moduleTitle.textContent = absence.cours.module.libelle;

  // Informations sur le cours
  const courseInfo = document.createElement("div");
  courseInfo.className = "grid grid-cols-1 md:grid-cols-2 mb-3 gap-2";

  const date = document.createElement("span");
  date.className = "badge badge-soft";
  date.innerHTML = `
    <i class="ri-calendar-check-line"></i>
    ${absence.date_absence}
  `;

  const salle = document.createElement("span");
  salle.className = "badge badge-soft badge-primary";
  salle.innerHTML = `
    <i class="ri-building-line"></i>
    ${absence.cours.salle}
  `;

  const heureDebut = document.createElement("span");
  heureDebut.className = "badge badge-soft badge-info";
  heureDebut.innerHTML = `
    <i class="ri-time-line"></i>Debut:
    ${absence.cours.heure_debut}
  `;

  const heureFin = document.createElement("span");
  heureFin.className = "badge badge-soft badge-info";
  heureFin.innerHTML = `
    <i class="ri-time-line"></i>Fin:
    ${absence.cours.heure_fin}
  `;

  const marquage = document.createElement("span");
  marquage.className = "badge badge-soft col-span-full";
  marquage.innerHTML = `
    <i class="ri-user-line"></i>
    Marquée par: ${absence.marqueur?.prenom || "Inconnu"} ${
    absence.marqueur?.nom || ""
  }
  `;

  courseInfo.appendChild(date);
  courseInfo.appendChild(salle);
  courseInfo.appendChild(heureDebut);
  courseInfo.appendChild(heureFin);
  courseInfo.appendChild(marquage);

  // Statut de justification
  const justificationStatus = document.createElement("div");
  justificationStatus.className = "flex items-center mb-2";

  const statusIcon = document.createElement("i");
  statusIcon.className = "ri-alert-line mr-2";

  const statusText = document.createElement("span");
  statusText.className = `text-sm font-medium badge badge-${colorStateAbsence(
    absence.justified
  )}`;
  statusText.textContent =
    absence.justified === "justifier" ? "Justifiée" : "Non justifiée";

  justificationStatus.appendChild(statusIcon);
  justificationStatus.appendChild(statusText);

  // Détails de justification si existante
  let justificationDetails = null;
  if (absence.justification) {
    justificationDetails = document.createElement("div");
    justificationDetails.className = "bg-base-100 p-3 rounded-lg mb-3";

    const motifTitle = document.createElement("h4");
    motifTitle.className = "font-medium text-sm mb-1";
    motifTitle.textContent = "Motif:";

    const motifText = document.createElement("p");
    motifText.className = "text-sm";
    motifText.textContent = absence.justification.motif;

    justificationDetails.appendChild(motifTitle);
    justificationDetails.appendChild(motifText);
  }

  // Actions
  const cardActions = document.createElement("div");
  cardActions.className = "flex justify-end pt-3 border-t border-base-200";

  if (actionsConfig) {
    const actions =
      typeof actionsConfig.items === "function"
        ? actionsConfig.items(absence)
        : actionsConfig.items;

    const hasDirectOnly = actions.every((a) => a.type === "direct");
    const hasDropdownOnly = actions.every(
      (a) => !a.type || a.type === "dropdown"
    );

    if (hasDropdownOnly) {
      cardActions.innerHTML = renderDaisyUIDropdown(
        absence,
        { ...actionsConfig, items: actions },
        containerId
      );
    } else {
      cardActions.innerHTML = renderDaisyUIDirectActions(absence, {
        ...actionsConfig,
        items: actions.filter((a) => a.type === "direct"),
      });
    }
  }

  // Assemblage de la card
  cardBody.appendChild(moduleTitle);
  cardBody.appendChild(courseInfo);
  cardBody.appendChild(justificationStatus);

  if (justificationDetails) {
    cardBody.appendChild(justificationDetails);
  }

  cardBody.appendChild(cardActions);
  card.appendChild(cardBody);

  return card;
}

/**
 * Met à jour la pagination des cards
 */
function updateCardsPagination(
  containerId,
  currentPage,
  totalPages,
  handleAction
) {
  const prevBtn = document.getElementById(`${containerId}-prev`);
  const nextBtn = document.getElementById(`${containerId}-next`);
  const info = document.getElementById(`${containerId}-pagination-info`);

  if (!prevBtn || !nextBtn || !info) return;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  info.textContent = `Page ${currentPage} sur ${totalPages} (${
    totalPages > 0 ? totalPages : 0
  } pages)`;

  // Gestion des événements
  const container = document.getElementById(`${containerId}-container`);

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateAbsenceCardsData(
        containerId,
        container.currentData,
        currentPage,
        handleAction
      );
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateAbsenceCardsData(
        containerId,
        container.currentData,
        currentPage,
        handleAction
      );
    }
  };
}

/**
 * Configure les événements pour les actions sur les cards
 */
function setupCardsEvents(containerId) {
  const container = document.getElementById(`${containerId}-container`);
  const grid = document.getElementById(containerId);
  if (!grid || !container.handleAction) return;

  // Supprime d'abord l'ancien écouteur s'il existe
  if (container._clickHandler) {
    grid.removeEventListener("click", container._clickHandler);
  }

  // Crée un nouveau gestionnaire
  container._clickHandler = (e) => {
    const actionItem = e.target.closest("[data-action]");
    if (actionItem) {
      e.preventDefault();
      container.handleAction(actionItem.dataset.action, actionItem.dataset.id);
    }
  };

  // Ajoute le nouvel écouteur
  grid.addEventListener("click", container._clickHandler);
}

/**
 * Rend un dropdown DaisyUI pour les actions
 */
function renderDaisyUIDropdown(item, actionsConfig, tableId) {
  console.log(item);

  const dropdownId = `dropdown-${tableId}-${item.id_absence}`;

  // Si actionsConfig.items est une fonction, on l'appelle avec l'item
  const actions =
    typeof actionsConfig.items === "function"
      ? actionsConfig.items(item)
      : actionsConfig.items;

  return `
    <div class="dropdown dropdown-end" id="${dropdownId}">
      <button tabindex="0" class="btn btn-sm btn-ghost">
        <i class="ri-more-2-fill"></i>
      </button>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        ${actions
          .map(
            (action) => `
          <li>
            <a data-action="${action.name}" data-id="${item.id_absence}" 
               class="${action.className || ""}">
              <i class="${action.icon}"></i>${action.label}
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}

/**
 * Rend des boutons d'actions directs avec DaisyUI
 */
function renderDaisyUIDirectActions(item, actionsConfig) {
  return actionsConfig.items
    .map(
      (action) => `
    <button class="btn btn-sm ${action.className || "btn-ghost"}"
            data-action="${action.name}"
            data-id="${item.id_absence}"
            title="${action.label}">
      <i class="${action.icon}"></i>
      ${action.showLabel ? action.label : ""}
    </button>
  `
    )
    .join("");
}
