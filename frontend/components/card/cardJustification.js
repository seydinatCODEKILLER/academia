import { colorState, colorStateJustification } from "../../utils/function.js";

/**
 * Crée un composant card pour afficher les demandes de justification
 * @param {Object} config - Configuration des cards
 * @param {Array} config.data - Données des demandes à afficher
 * @param {number} [config.itemsPerPage=6] - Items par page
 * @param {string} [config.containerId] - ID unique du conteneur
 * @param {Object} [config.actions] - Configuration des actions
 * @param {Function} [config.onAction] - Callback pour les actions
 * @returns {HTMLElement} Le conteneur des cards
 */
export function createJustificationCards(config) {
  // Configuration par défaut
  const {
    data = [],
    itemsPerPage = 6,
    containerId = "justification-cards",
    actions = null,
    onAction = null,
    emptyMessage = "Aucune demande de justification",
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

  // Pagination (identique à createAbsenceCards)
  const pagination = document.createElement("div");
  pagination.className = "flex justify-between items-center p-4 mt-6";
  pagination.id = `${containerId}-pagination`;

  const paginationInfo = document.createElement("div");
  paginationInfo.className = "text-sm text-base-content";
  paginationInfo.id = `${containerId}-pagination-info`;

  const paginationControls = document.createElement("div");
  paginationControls.className = "join";

  const prevBtn = document.createElement("button");
  prevBtn.className = "join-item btn btn-sm";
  prevBtn.innerHTML = "&larr; Précédent";
  prevBtn.id = `${containerId}-prev`;
  prevBtn.disabled = true;

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
 * Met à jour les données des cards de justification
 */
export function updateJustificationCardsData(
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

  if (grid.innerHTML !== "") {
    grid.innerHTML = "";
  }

  container.currentData = newData;

  if (onAction) {
    container.handleAction = onAction;
  }

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

  itemsToShow.forEach((request) => {
    const card = createJustificationCard(request, config.actions, containerId);
    grid.appendChild(card);
  });

  updateCardsPagination(
    containerId,
    currentPage,
    Math.ceil(newData.length / config.itemsPerPage),
    container.handleAction
  );

  setupCardsEvents(containerId);
}

/**
 * Crée une card individuelle pour une demande de justification
 */
function createJustificationCard(request, actionsConfig, containerId) {
  const card = document.createElement("div");
  card.className =
    "card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-base-200 hover:shadow-lg transition-shadow";
  card.dataset.id = request.id;

  const cardBody = document.createElement("div");
  cardBody.className = "p-4 relative";

  // Header avec statut
  const cardHeader = document.createElement("div");
  cardHeader.className = `p-3 rounded-t-lg bg-${colorStateJustification(
    request.statut
  )}/10`;

  const statusBadge = document.createElement("span");
  statusBadge.className = `badge badge-${colorStateJustification(
    request.statut
  )}`;
  statusBadge.textContent = request.statut;
  cardHeader.appendChild(statusBadge);

  // Informations sur la demande
  const requestInfo = document.createElement("div");
  requestInfo.className = "grid grid-cols-1 md:grid-cols-2 mb-3 gap-2";

  const requestDate = document.createElement("span");
  requestDate.className = "badge badge-soft col-span-full";
  requestDate.innerHTML = `
    <i class="ri-calendar-line"></i>Date de demande: 
    ${new Date(request.date_demande).toLocaleDateString()}
  `;

  const absenceDate = document.createElement("span");
  absenceDate.className = "badge badge-soft col-span-full";
  absenceDate.innerHTML = `
    <i class="ri-calendar-check-line"></i> Date d'absence:
    ${
      request.absence?.date
        ? new Date(request.absence.date).toLocaleDateString()
        : "N/A"
    }
  `;

  const moduleInfo = document.createElement("span");
  moduleInfo.className = "badge badge-soft col-span-full";
  moduleInfo.innerHTML = `
    <i class="ri-book-line"></i>
    ${request.absence?.cours?.module?.libelle || "Module non spécifié"}
  `;

  requestInfo.appendChild(requestDate);
  requestInfo.appendChild(absenceDate);
  requestInfo.appendChild(moduleInfo);

  // Détails du motif
  const motifDetails = document.createElement("div");
  motifDetails.className = "bg-base-100 p-3 rounded-lg mb-3";

  const motifTitle = document.createElement("h4");
  motifTitle.className = "font-medium text-sm mb-1";
  motifTitle.textContent = "Motif:";

  const motifText = document.createElement("p");
  motifText.className = "text-sm";
  motifText.textContent = request.motif || "Aucun motif fourni";

  motifDetails.appendChild(motifTitle);
  motifDetails.appendChild(motifText);

  // Traitement (si existant)
  let treatmentDetails = null;
  if (request.date_traitement) {
    treatmentDetails = document.createElement("div");
    treatmentDetails.className = "bg-base-200 p-3 rounded-lg mb-3";

    const treatmentTitle = document.createElement("h4");
    treatmentTitle.className = "font-medium text-sm mb-1";
    treatmentTitle.textContent = "Traitement:";

    const treatmentText = document.createElement("p");
    treatmentText.className = "text-sm";
    treatmentText.innerHTML = `
      <strong>Date:</strong> ${new Date(
        request.date_traitement
      ).toLocaleString()}<br>
      <strong>Par:</strong> ${request.traite_par?.prenom || "Inconnu"} ${
      request.traite_par?.nom || ""
    }<br>
      ${
        request.commentaire
          ? `<strong>Commentaire:</strong> ${request.commentaire}`
          : ""
      }
    `;

    treatmentDetails.appendChild(treatmentTitle);
    treatmentDetails.appendChild(treatmentText);
  }

  // Actions
  const cardActions = document.createElement("div");
  cardActions.className = "flex justify-end pt-3 border-t border-base-200";

  if (actionsConfig) {
    const actions =
      typeof actionsConfig.items === "function"
        ? actionsConfig.items(request)
        : actionsConfig.items;

    const hasDirectOnly = actions.every((a) => a.type === "direct");
    const hasDropdownOnly = actions.every(
      (a) => !a.type || a.type === "dropdown"
    );

    if (hasDropdownOnly) {
      cardActions.innerHTML = renderDaisyUIDropdown(
        request,
        { ...actionsConfig, items: actions },
        containerId
      );
    } else {
      cardActions.innerHTML = renderDaisyUIDirectActions(request, {
        ...actionsConfig,
        items: actions.filter((a) => a.type === "direct"),
      });
    }
  }

  // Assemblage de la card
  card.appendChild(cardHeader);
  cardBody.appendChild(requestInfo);
  cardBody.appendChild(motifDetails);

  if (treatmentDetails) {
    cardBody.appendChild(treatmentDetails);
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

  const dropdownId = `dropdown-${tableId}-${item.id}`;

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
            data-id="${item.id}"
            title="${action.label}">
      <i class="${action.icon}"></i>
      ${action.showLabel ? action.label : ""}
    </button>
  `
    )
    .join("");
}
