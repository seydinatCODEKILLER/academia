import { colorState, getRandomColor } from "../../utils/function.js";

/**
 * Crée un composant card pour afficher les cours avec DaisyUI
 * @param {Object} config - Configuration des cards
 * @param {Array} config.data - Données des cours à afficher
 * @param {number} [config.itemsPerPage=6] - Items par page
 * @param {string} [config.containerId] - ID unique du conteneur
 * @param {Object} [config.actions] - Configuration des actions
 * @param {Function} [config.onAction] - Callback pour les actions
 * @returns {HTMLElement} Le conteneur des cards
 */
export function createCoursCardsProfessor(config) {
  // Configuration par défaut
  const {
    data = [],
    itemsPerPage = 6,
    containerId = "cours-cards",
    actions = null,
    onAction = null,
    emptyMessage = "Aucun cours disponible",
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
 * Met à jour les données des cards de cours
 */
export function updateCoursCardsDataProfessor(
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
  itemsToShow.forEach((cours) => {
    const card = createCoursCard(cours, config.actions, containerId);
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
 * Crée une card individuelle pour un cours
 */
function createCoursCard(cours, actionsConfig, containerId) {
  const card = document.createElement("div");
  card.className =
    "card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-base-200 hover:shadow-lg transition-shadow";
  card.dataset.id = cours.id;

  const hue = (getRandomColor() * 137.508) % 360; // Génération d'une teinte unique
  const gradientStyle = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${
    hue + 20
  }, 70%, 50%))`;

  // 2. Header avec dégradé de couleur
  const cardHeader = document.createElement("div");
  cardHeader.className = "p-3 text-white rounded";
  cardHeader.style.background = gradientStyle;

  // 3. Titre du module avec ombre pour meilleure lisibilité
  const moduleTitle = document.createElement("h3");
  moduleTitle.className = "text-lg font-semibold truncate drop-shadow-md";
  moduleTitle.textContent = cours.module;
  cardHeader.appendChild(moduleTitle);
  // Corps de la card
  const cardBody = document.createElement("div");
  cardBody.className = "p-4 relative";

  // Informations sur les classes
  const classesInfo = document.createElement("div");
  classesInfo.className = "flex items-center py-4";

  const classesIcon = document.createElement("i");
  classesIcon.className = "ri-government-line mr-2 text-gray-500";

  const classesText = document.createElement("div");
  classesText.className = "";
  classesText.innerHTML = cours.classes.map((classe) => {
    return `
    ${classe}
    `;
  });

  classesInfo.appendChild(classesIcon);
  classesInfo.appendChild(classesText);

  //extra

  const extra = document.createElement("div");
  extra.className = "grid grid-cols-1 md:grid-cols-2 mb-3 gap-2";

  const debut = document.createElement("span");
  debut.className = "badge badge-soft badge-success";
  debut.innerHTML = `
    <i class="ri-timer-flash-line"></i>
    Debut: ${cours.startHour}h
`;

  const fin = document.createElement("span");
  fin.className = "badge badge-soft badge-warning";
  fin.innerHTML = `
    <i class="ri-timer-flash-line"></i>
    Fin: ${cours.endHour}h
`;

  const date = document.createElement("span");
  date.className = "badge badge-soft";
  date.innerHTML = `
    <i class="ri-calendar-check-line"></i>
 ${cours.date}
`;

  const salle = document.createElement("span");
  salle.className = "badge badge-soft badge-primary";
  salle.innerHTML = `
    <i class="ri-calendar-check-line"></i>
 ${cours.classRoom}
`;

  extra.appendChild(debut);
  extra.appendChild(fin);
  extra.appendChild(date);
  extra.appendChild(salle);

  //State

  const state = document.createElement("span");
  state.className = `absolute top-3 right-2 badge badge-soft badge-${colorState(
    cours.statut
  )}`;
  state.innerHTML = `${cours.statut}`;

  // Actions
  const cardActions = document.createElement("div");
  cardActions.className = "flex justify-end pt-3 border-t border-base-200";

  if (actionsConfig) {
    const actions =
      typeof actionsConfig.items === "function"
        ? actionsConfig.items(cours)
        : actionsConfig.items;

    const hasDirectOnly = actions.every((a) => a.type === "direct");
    const hasDropdownOnly = actions.every(
      (a) => !a.type || a.type === "dropdown"
    );

    if (hasDropdownOnly) {
      cardActions.innerHTML = renderDaisyUIDropdown(
        cours,
        { ...actionsConfig, items: actions },
        containerId
      );
    } else {
      cardActions.innerHTML = renderDaisyUIDirectActions(cours, {
        ...actionsConfig,
        items: actions.filter((a) => a.type === "direct"),
      });
    }
  }

  // Assemblage de la card
  cardBody.appendChild(classesInfo);
  cardBody.appendChild(extra);
  cardBody.appendChild(state);
  cardBody.appendChild(cardActions);

  card.appendChild(cardHeader);
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
      updateCoursCardsData(
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
      updateCoursCardsData(
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
            <a data-action="${action.name}" data-id="${item.id}" 
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
  console.log(item);

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
