/**
 * Crée un tableau réutilisable avec DaisyUI
 * @param {Object} config - Configuration du tableau
 * @param {Array} config.columns - Configuration des colonnes
 * @param {Array} config.data - Données à afficher
 * @param {number} [config.itemsPerPage=10] - Items par page
 * @param {string} [config.tableId] - ID unique du tableau
 * @param {Object} [config.actions] - Configuration des actions
 * @param {Function} [config.onAction] - Callback pour les actions
 * @returns {HTMLElement} Le conteneur du tableau
 */
export function createDaisyUITable(config) {
  // Configuration par défaut
  const {
    columns = [],
    data = [],
    itemsPerPage = 10,
    tableId = "",
    actions = null,
    onAction = null,
    emptyMessage = "Aucune donnée disponible",
  } = config;

  // Validation des colonnes
  if (!columns.some((col) => col.key)) {
    console.error("Chaque colonne doit avoir une propriété 'key'");
    return document.createElement("div");
  }

  // Création du conteneur principal
  const tableContainer = document.createElement("div");
  tableContainer.className =
    "bg-white rounded-box shadow-sm border border-base-200 overflow-hidden overflow-x-auto";
  tableContainer.id = `${tableId}-container`;

  // Tableau
  const table = document.createElement("table");
  table.className = "table table-zebra w-full";
  table.id = tableId;

  // En-tête
  const thead = document.createElement("thead");
  thead.className = "bg-base-200 text-base-content";
  const headerRow = document.createElement("tr");

  columns.forEach((column) => {
    const th = document.createElement("th");
    th.className = [
      "px-4 py-3",
      "text-left",
      "text-sm",
      "font-medium",
      column.headerClass || "",
    ].join(" ");
    th.textContent = column.header;
    headerRow.appendChild(th);
  });

  // Ajouter colonne Actions si configurée
  if (actions) {
    console.log(actions);

    const actionsTh = document.createElement("th");
    actionsTh.className = "text-right text-sm";
    actionsTh.textContent = "Actions";
    headerRow.appendChild(actionsTh);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Corps
  const tbody = document.createElement("tbody");
  tbody.id = `${tableId}-body`;
  table.appendChild(tbody);

  // Pagination (avec DaisyUI)
  const pagination = document.createElement("div");
  pagination.className = "flex justify-between items-center p-4";
  pagination.id = `${tableId}-pagination`;

  const paginationInfo = document.createElement("div");
  paginationInfo.className = "text-sm text-base-content";
  paginationInfo.id = `${tableId}-pagination-info`;

  const paginationControls = document.createElement("div");
  paginationControls.className = "join";

  // Bouton précédent
  const prevBtn = document.createElement("button");
  prevBtn.className = "join-item btn btn-sm";
  prevBtn.innerHTML = "&larr; Précédent";
  prevBtn.id = `${tableId}-prev`;
  prevBtn.disabled = true;

  // Bouton suivant
  const nextBtn = document.createElement("button");
  nextBtn.className = "join-item btn btn-sm";
  nextBtn.innerHTML = "Suivant &rarr;";
  nextBtn.id = `${tableId}-next`;
  nextBtn.disabled = data.length <= itemsPerPage;

  paginationControls.appendChild(prevBtn);
  paginationControls.appendChild(nextBtn);
  pagination.appendChild(paginationInfo);
  pagination.appendChild(paginationControls);

  // Stockage des métadonnées
  table.dataset.config = JSON.stringify({
    columns,
    actions: actions
      ? {
          type: actions.type,
          idField: actions.idField,
          items: actions.items.map((item) => ({
            name: item.name,
            label: item.label,
            icon: item.icon,
            className: item.className,
            showLabel: item.showLabel,
          })),
        }
      : null,
    itemsPerPage,
    emptyMessage,
    onAction,
  });

  if (onAction) {
    table.handleAction = onAction;
  }

  console.log(actions);

  // Assemblage
  tableContainer.appendChild(table);
  tableContainer.appendChild(pagination);
  console.log(tableId);

  return tableContainer;
}

/**
 * Met à jour les données du tableau avec DaisyUI
 */
export function updateDaisyUITableData(
  tableId,
  newData,
  currentPage = 1,
  onAction = null
) {
  const table = document.getElementById(tableId);

  if (!table) {
    console.log("Table not found");
    return;
  }

  const config = JSON.parse(table.dataset.config);
  console.log(config);

  const tbody = document.getElementById(`${tableId}-body`);
  tbody.innerHTML = "";

  // Stocker les données pour la pagination
  table.dataset.currentData = JSON.stringify(newData);

  // Calcul de la pagination
  const startIndex = (currentPage - 1) * config.itemsPerPage;
  const endIndex = startIndex + config.itemsPerPage;
  const itemsToShow = newData.slice(startIndex, endIndex);

  if (itemsToShow.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = config.columns.length + (config.actions ? 1 : 0);
    emptyCell.className = "text-center p-4 text-base-content/50";
    emptyCell.textContent = config.emptyMessage;
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    return;
  }

  // Remplissage des données
  itemsToShow.forEach((item) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-base-100";
    if (item.id) {
      row.dataset.id = item.id;
    }

    // Colonnes normales
    config.columns.forEach((column) => {
      const cell = document.createElement("td");
      cell.className = ["text-base-content", column.className || ""].join(" ");

      if (column.render) {
        cell.innerHTML = column.render(item);
      } else {
        cell.textContent = item[column.key] || "";
      }

      row.appendChild(cell);
    });

    // Colonne Actions
    if (config.actions) {
      const actionsCell = document.createElement("td");
      actionsCell.className = "text-right";

      if (config.actions.type === "dropdown") {
        actionsCell.innerHTML = renderDaisyUIDropdown(
          item,
          config.actions,
          tableId
        );
      } else {
        actionsCell.innerHTML = renderDaisyUIDirectActions(
          item,
          config.actions
        );
      }

      row.appendChild(actionsCell);
    }

    tbody.appendChild(row);
  });

  // Mise à jour de la pagination
  updateDaisyUIPagination(
    tableId,
    currentPage,
    Math.ceil(newData.length / config.itemsPerPage)
  );

  // Configuration des événements
  setupDaisyUIEvents(tableId);
}

/**
 * Rend un dropdown DaisyUI pour les actions
 */
function renderDaisyUIDropdown(item, actionsConfig, tableId) {
  const dropdownId = `dropdown-${tableId}-${item.id}`;

  return `
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="btn btn-sm btn-ghost">
        <i class="ri-more-2-fill"></i>
      </button>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        ${actionsConfig.items
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
  const itemId = item[actionsConfig.idField];

  if (!itemId) {
    console.warn("ID manquant pour:", item);
    return "";
  }

  return actionsConfig.items
    .map(
      (action) => `
    <button class="btn btn-sm ${action.className || "btn-ghost"}"
            data-action="${action.name}"
            data-id="${itemId}"
            title="${action.label}">
      <i class="${action.icon}"></i>
      ${action.showLabel ? action.label : ""}
    </button>
  `
    )
    .join("");
}

/**
 * Met à jour la pagination DaisyUI
 */
function updateDaisyUIPagination(tableId, currentPage, totalPages) {
  const prevBtn = document.getElementById(`${tableId}-prev`);
  const nextBtn = document.getElementById(`${tableId}-next`);
  const info = document.getElementById(`${tableId}-pagination-info`);

  if (!prevBtn || !nextBtn || !info) return;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  info.textContent = `Page ${currentPage} sur ${totalPages} (${
    totalPages > 0 ? totalPages : 0
  } pages)`;

  // Gestion des événements
  const table = document.getElementById(tableId);
  const data = JSON.parse(table.dataset.currentData || "[]");

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      updateDaisyUITableData(tableId, data, currentPage - 1);
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      updateDaisyUITableData(tableId, data, currentPage + 1);
    }
  };
}

/**
 * Configure les événements avec DaisyUI
 */
function setupDaisyUIEvents(tableId) {
  const table = document.getElementById(tableId);
  const tbody = document.getElementById(`${tableId}-body`);
  if (!tbody || !table.handleAction) return;

  tbody.addEventListener("click", (e) => {
    const actionItem = e.target.closest("[data-action]");
    if (actionItem) {
      e.preventDefault();
      table.handleAction(actionItem.dataset.action, actionItem.dataset.id);
    }
  });
}
