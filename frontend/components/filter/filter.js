import {
  updateAbsencesTableWithFilters,
  updateClassesTableWithFilters,
} from "../../assets/javascript/attache/utils.js";

/**
 * Crée une barre de filtres pour le tableau des classes
 * @param {Object} config - Configuration des filtres
 * @param {Array} config.filieres - Liste des filières disponibles
 * @param {Array} config.anneesScolaires - Liste des années scolaires
 * @param {Function} config.onFilter - Callback quand les filtres changent
 * @returns {HTMLElement} La barre de filtres
 */
export function createClassFilters(config) {
  const {
    filieres = [],
    anneesScolaires = [],
    idAttache,
    onFilter = (filters) => updateClassesTableWithFilters(idAttache, filters),
  } = config;

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "bg-base-200 p-3 rounded-lg mb-6";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = "Filtrer les classes";
  filtersContainer.appendChild(title);

  const filtersGrid = document.createElement("div");
  filtersGrid.className = "grid grid-cols-1 md:grid-cols-4 gap-4";

  // Champ de recherche
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Rechercher une classe...";
  searchInput.className = "input input-bordered w-full";
  searchInput.addEventListener("input", (e) => {
    onFilter({
      search: e.target.value,
      filiere: filiereSelect.value,
      annee: anneeSelect.value,
    });
  });

  // Filtre par filière
  const filiereSelect = document.createElement("select");
  filiereSelect.className = "select select-bordered w-full";
  filiereSelect.innerHTML = `
    <option value="">Toutes les filières</option>
    ${filieres
      .map((f) => `<option value="${f.id}">${f.libelle}</option>`)
      .join("")}
  `;
  filiereSelect.addEventListener("change", (e) => {
    onFilter({
      filiere: e.target.value,
      search: searchInput.value,
      annee: anneeSelect.value,
    });
  });

  // Filtre par année scolaire
  const anneeSelect = document.createElement("select");
  anneeSelect.className = "select select-bordered w-full";
  anneeSelect.innerHTML = `
    <option value="">Toutes les années</option>
    ${anneesScolaires
      .map((a) => `<option value="${a.id}">${a.libelle}</option>`)
      .join("")}
  `;
  anneeSelect.addEventListener("change", (e) => {
    onFilter({
      annee: e.target.value,
      search: searchInput.value,
      filiere: filiereSelect.value,
    });
  });

  // Bouton réinitialiser
  const resetButton = document.createElement("button");
  resetButton.className = "btn btn-outline";
  resetButton.innerHTML = '<i class="ri-refresh-line mr-2"></i> Réinitialiser';
  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    filiereSelect.value = "";
    anneeSelect.value = "";
    onFilter({ search: "", filiere: "", annee: "" });
  });

  filtersGrid.appendChild(searchInput);
  filtersGrid.appendChild(filiereSelect);
  filtersGrid.appendChild(anneeSelect);
  filtersGrid.appendChild(resetButton);
  filtersContainer.appendChild(filtersGrid);

  return filtersContainer;
}

export function createAbsencesFilters(config) {
  const {
    niveaux = [],
    idAttache,
    onFilter = (filters) => updateAbsencesTableWithFilters(idAttache, filters),
  } = config;

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "bg-base-200 p-3 rounded-lg mb-6";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = "Filtrer les absences";
  filtersContainer.appendChild(title);

  const filtersGrid = document.createElement("div");
  filtersGrid.className = "grid grid-cols-1 md:grid-cols-4 gap-4";

  // Champ de recherche
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Rechercher un étudiant...";
  searchInput.className = "input input-bordered w-full";
  searchInput.addEventListener("input", (e) =>
    onFilter({
      search: e.target.value,
      niveau: niveauSelect.value,
    })
  );

  // Filtre par niveau
  const niveauSelect = document.createElement("select");
  niveauSelect.className = "select select-bordered w-full";
  niveauSelect.innerHTML = `
    <option value="">Tous les niveaux</option>
    ${niveaux
      .map((n) => `<option value="${n.id}">${n.libelle}</option>`)
      .join("")}
  `;
  niveauSelect.addEventListener("change", (e) =>
    onFilter({
      niveau: e.target.value,
      search: searchInput.value,
    })
  );

  // Bouton réinitialiser
  const resetButton = document.createElement("button");
  resetButton.className = "btn btn-outline";
  resetButton.innerHTML = '<i class="ri-refresh-line mr-2"></i> Réinitialiser';
  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    niveauSelect.value = "";
    onFilter({ search: "", niveau: "" });
  });

  filtersGrid.appendChild(searchInput);
  filtersGrid.appendChild(niveauSelect);
  filtersGrid.appendChild(resetButton);
  filtersContainer.appendChild(filtersGrid);

  return filtersContainer;
}
