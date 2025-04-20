import {
  updateAbsencesTableWithFilters,
  updateClassesTableWithFilters,
} from "../../assets/javascript/attache/utils.js";

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

export function createJustificationsFilters(config) {
  const { classes = [], statuts = [], idAttache, onFilter = () => {} } = config;

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "bg-base-200 p-4 rounded-lg mb-6";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = "Filtrer les demandes";
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
      statut: statutSelect.value,
      classe: classeSelect.value,
    })
  );

  // Filtre par statut
  const statutSelect = document.createElement("select");
  statutSelect.className = "select select-bordered w-full";
  statutSelect.innerHTML = `
    <option value="">Tous les statuts</option>
    ${statuts.map((s) => `<option value="${s}">${s}</option>`).join("")}
  `;
  statutSelect.addEventListener("change", (e) =>
    onFilter({
      statut: e.target.value,
      search: searchInput.value,
      classe: classeSelect.value,
    })
  );

  // Filtre par classe
  const classeSelect = document.createElement("select");
  classeSelect.className = "select select-bordered w-full";
  classeSelect.innerHTML = `
    <option value="">Toutes les classes</option>
    ${classes
      .map((c) => `<option value="${c.id_classe}">${c.libelle}</option>`)
      .join("")}
  `;
  classeSelect.addEventListener("change", (e) =>
    onFilter({
      classe: e.target.value,
      search: searchInput.value,
      statut: statutSelect.value,
    })
  );

  // Bouton réinitialiser
  const resetButton = document.createElement("button");
  resetButton.className = "btn btn-outline";
  resetButton.innerHTML = '<i class="ri-refresh-line mr-2"></i> Réinitialiser';
  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    statutSelect.value = "";
    classeSelect.value = "";
    onFilter({ search: "", statut: "", classe: "" });
  });

  filtersGrid.appendChild(searchInput);
  filtersGrid.appendChild(statutSelect);
  filtersGrid.appendChild(classeSelect);
  filtersGrid.appendChild(resetButton);
  filtersContainer.appendChild(filtersGrid);

  return filtersContainer;
}

export function createInscriptionsFilters(config) {
  const { classes = [], annees = [], idAttache, onFilter = () => {} } = config;

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "bg-base-200 p-4 rounded-lg mb-6";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = "Filtrer les inscriptions";
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
      classe: classeSelect.value,
      annee: anneeSelect.value,
    })
  );

  // Filtre par classe
  const classeSelect = document.createElement("select");
  classeSelect.className = "select select-bordered w-full";
  classeSelect.innerHTML = `
    <option value="">Toutes les classes</option>
    ${classes
      .map((c) => `<option value="${c.id_classe}">${c.libelle}</option>`)
      .join("")}
  `;
  classeSelect.addEventListener("change", (e) =>
    onFilter({
      classe: e.target.value,
      search: searchInput.value,
      annee: anneeSelect.value,
    })
  );

  // Filtre par année scolaire
  const anneeSelect = document.createElement("select");
  anneeSelect.className = "select select-bordered w-full";
  anneeSelect.innerHTML = `
    <option value="">Toutes les années</option>
    ${annees
      .map((a) => `<option value="${a.id}">${a.libelle}</option>`)
      .join("")}
  `;
  anneeSelect.addEventListener("change", (e) => {
    onFilter({
      annee: e.target.value,
      search: searchInput.value,
      classe: classeSelect.value,
    });
  });

  // Bouton réinitialiser
  const resetButton = document.createElement("button");
  resetButton.className = "btn btn-outline";
  resetButton.innerHTML = '<i class="ri-refresh-line mr-2"></i> Réinitialiser';
  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    classeSelect.value = "";
    anneeSelect.value = "";
    onFilter({ search: "", filiere: "", annee: "" });
  });

  filtersGrid.appendChild(searchInput);
  filtersGrid.appendChild(anneeSelect);
  filtersGrid.appendChild(classeSelect);
  filtersGrid.appendChild(resetButton);
  filtersContainer.appendChild(filtersGrid);

  return filtersContainer;
}

export function createClassFiltersForRp(config) {
  const {
    filieres = [],
    niveaux = [],
    anneesScolaires = [],
    onFilter = (filters) => updateClassesTableWithFilters(filters),
  } = config;

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "bg-base-200 p-3 rounded-lg mb-6";

  const title = document.createElement("h3");
  title.className = "font-bold text-lg mb-4";
  title.textContent = "Filtrer les classes";
  filtersContainer.appendChild(title);

  const filtersGrid = document.createElement("div");
  filtersGrid.className = "grid grid-cols-1 md:grid-cols-5 gap-4";

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
      niveau: niveauSelect.value,
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
      niveau: niveauSelect.value,
      annee: anneeSelect.value,
    });
  });

  // Filtre par niveaux
  const niveauSelect = document.createElement("select");
  niveauSelect.className = "select select-bordered w-full";
  niveauSelect.innerHTML = `
    <option value="">Toutes les niveaux</option>
    ${niveaux
      .map((n) => `<option value="${n.id}">${n.libelle}</option>`)
      .join("")}
  `;
  niveauSelect.addEventListener("change", (e) => {
    onFilter({
      niveau: e.target.value,
      filiere: filiereSelect.value,
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
      niveau: niveauSelect.value,
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
    niveauSelect.value = "";
    onFilter({ search: "", filiere: "", annee: "", niveau: "" });
  });

  filtersGrid.appendChild(searchInput);
  filtersGrid.appendChild(filiereSelect);
  filtersGrid.appendChild(anneeSelect);
  filtersGrid.appendChild(niveauSelect);
  filtersGrid.appendChild(resetButton);
  filtersContainer.appendChild(filtersGrid);

  return filtersContainer;
}
