/**
 * Crée une carte de statistique réutilisable
 * @param {Object} config - Configuration de la carte
 * @param {string} config.title - Titre de la carte
 * @param {string|number} config.value - Valeur à afficher
 * @param {string} config.description - Description sous la valeur
 * @param {string} config.icon - Classe de l'icône (ex: 'ri-group-line')
 * @param {string} config.color - Couleur principale (ex: 'blue', 'green', 'red')
 * @param {boolean} config.hoverEffect - Ajoute un effet au survol
 * @param {Function} config.onClick - Callback au clic sur la carte
 * @returns {HTMLElement} L'élément card
 */
export function createStatsCard(config) {
  // Couleurs par défaut disponibles
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      icon: "text-blue-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-500",
      icon: "text-green-500",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-500",
      icon: "text-red-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-500",
      icon: "text-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      icon: "text-orange-500",
    },
  };

  // Configuration par défaut
  const {
    title = "Statistique",
    value = "0",
    description = "",
    icon = "ri-line-chart-line",
    color = "blue",
    hoverEffect = true,
    onClick = null,
    showActionIcon = true,
  } = config;

  // Validation de la couleur
  const selectedColor = colors[color] || colors.blue;

  // Création de la carte
  const card = document.createElement("div");
  card.className = [
    "p-4",
    "rounded-lg",
    "bg-white",
    "shadow-sm",
    "flex",
    "flex-col",
    "gap-3",
    "relative",
    "border-l-4",
    `${selectedColor.text}`,
    "border-current",
    hoverEffect ? "transition-transform duration-300 hover:scale-[1.02]" : "",
    onClick ? "cursor-pointer" : "",
  ].join(" ");

  if (onClick) {
    card.addEventListener("click", onClick);
  }

  // En-tête avec icône et titre
  const header = document.createElement("div");
  header.className = "flex items-center gap-3";

  const iconContainer = document.createElement("div");
  iconContainer.className = [
    "w-10",
    "h-10",
    "rounded-full",
    selectedColor.bg,
    "flex",
    "justify-center",
    "items-center",
  ].join(" ");

  const iconElement = document.createElement("i");
  iconElement.className = `${icon} ${selectedColor.icon} text-lg`;
  iconContainer.appendChild(iconElement);

  const titleElement = document.createElement("p");
  titleElement.className = `${selectedColor.text} font-medium text-lg`;
  titleElement.textContent = title;

  header.appendChild(iconContainer);
  header.appendChild(titleElement);

  // Corps avec valeur et description
  const body = document.createElement("div");
  body.className = "flex flex-col gap-1";

  const valueElement = document.createElement("p");
  valueElement.className = "font-medium text-4xl";
  valueElement.textContent = value;

  const descElement = document.createElement("span");
  descElement.className = "text-gray-500 text-sm";
  descElement.textContent = description;

  body.appendChild(valueElement);
  body.appendChild(descElement);

  // Icône d'action (optionnelle)
  if (showActionIcon) {
    const actionIcon = document.createElement("div");
    actionIcon.className = [
      "w-10",
      "h-10",
      "rounded-full",
      selectedColor.bg,
      "flex",
      "justify-center",
      "items-center",
      "absolute",
      "top-3",
      "right-3",
      onClick ? "cursor-pointer" : "",
    ].join(" ");

    const arrowIcon = document.createElement("i");
    arrowIcon.className =
      "ri-arrow-right-up-line text-lg " + selectedColor.icon;
    actionIcon.appendChild(arrowIcon);

    card.appendChild(actionIcon);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

/**
 * Crée une carte affichant le top 5 des élèves avec le plus d'absences
 * @param {Object} config - Configuration de la carte
 * @param {Array} config.absentees - Liste des élèves absents
 * @param {Function} [config.onStudentClick] - Callback au clic sur un élève
 * @returns {HTMLElement} L'élément card
 */
export function createAbsenteesCard(config) {
  const { absentees = [], onStudentClick = null } = config;

  // Création de la carte
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow-sm p-6 flex flex-col";

  // En-tête de la carte
  const header = document.createElement("div");
  header.className = "flex items-center justify-between mb-4";

  const title = document.createElement("h3");
  title.className = "text-lg font-semibold text-gray-800";
  title.textContent = "Top 5 des absences";

  const icon = document.createElement("div");
  icon.className = "p-2 rounded-lg bg-red-50 text-red-500";
  icon.innerHTML = '<i class="ri-user-forbid-line text-xl"></i>';

  header.appendChild(title);
  header.appendChild(icon);

  // Corps de la carte
  const body = document.createElement("div");
  body.className = "flex-1";

  if (absentees.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "text-center py-4 text-gray-500";
    emptyState.textContent = "Aucune donnée d'absence disponible";
    body.appendChild(emptyState);
  } else {
    const list = document.createElement("div");
    list.className = "space-y-3";

    absentees.forEach((item, index) => {
      const studentElement = document.createElement("div");
      studentElement.className = [
        "flex items-center justify-between p-3 rounded-lg",
        "hover:bg-gray-50 transition-colors duration-200",
        onStudentClick ? "cursor-pointer" : "",
      ].join(" ");

      if (onStudentClick) {
        studentElement.addEventListener("click", () =>
          onStudentClick(item.etudiant)
        );
      }

      // Position et info élève
      const studentInfo = document.createElement("div");
      studentInfo.className = "flex items-center space-x-3";

      const rank = document.createElement("div");
      rank.className = [
        "flex items-center justify-center h-8 w-8 rounded-full",
        "text-sm font-medium",
        index < 3 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800",
      ].join(" ");
      rank.textContent = index + 1;

      const avatar = document.createElement("img");
      avatar.src = `${item.avatar}`;
      avatar.className = "h-10 w-10 rounded object-cover overflow-hidden";
      avatar.innerHTML = '<i class="ri-user-3-line text-gray-600"></i>';

      const name = document.createElement("div");
      name.className = "flex flex-col";

      const fullName = document.createElement("span");
      fullName.className = "font-medium text-gray-800";
      fullName.textContent = `${item.prenom} ${item.nom}`;

      const classe = document.createElement("span");
      classe.className = "text-xs text-gray-500";
      classe.textContent = `Classe: ${item.classe}`;

      name.appendChild(fullName);
      name.appendChild(classe);

      studentInfo.appendChild(rank);
      studentInfo.appendChild(avatar);
      studentInfo.appendChild(name);

      // Nombre d'absences
      const absences = document.createElement("div");
      absences.className = "flex items-center space-x-2";

      const count = document.createElement("span");
      count.className = "text-red-600 font-bold";
      count.textContent = item.count;

      const label = document.createElement("span");
      label.className = "text-xs text-gray-500";
      label.textContent = item.count > 1 ? "absences" : "absence";

      absences.appendChild(count);
      absences.appendChild(label);

      studentElement.appendChild(studentInfo);
      studentElement.appendChild(absences);

      list.appendChild(studentElement);
    });

    body.appendChild(list);
  }

  // Pied de carte (optionnel)
  const footer = document.createElement("div");
  footer.className = "mt-4 pt-3 border-t border-gray-100 text-right";

  const link = document.createElement("a");
  link.className = "text-sm text-blue-600 hover:text-blue-800 hover:underline";
  link.href = "#/absences";
  link.textContent = "Voir toutes les absences";

  footer.appendChild(link);

  // Assemblage
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}

/**
 * Crée une carte améliorée avec indicateurs pour les statistiques de classes
 * @param {Object} config - Configuration de la carte
 * @param {string} config.title - Titre principal
 * @param {string} config.value - Valeur principale
 * @param {string} [config.icon] - Icône Remix
 * @param {number} config.totalClasses - Nombre total de classes
 * @param {number} config.archivedClasses - Nombre de classes archivées
 * @param {number} config.availableClasses - Nombre de classes disponibles
 * @param {string} [config.trend] - Tendance ('up' ou 'down')
 * @returns {HTMLElement} L'élément card
 */
export function createRpStatsCard(config) {
  const {
    title = "Classes",
    value = "0",
    icon = "ri-team-line",
    totalData = 0,
    archivedData = 0,
    availableData = 0,
    trend = "up",
    key = "",
  } = config;

  // Création de la carte
  const card = document.createElement("div");
  card.className =
    "bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col";

  // En-tête de la carte
  const cardHeader = document.createElement("div");
  cardHeader.className = "flex justify-between items-start mb-4";

  const titleElement = document.createElement("h3");
  titleElement.className =
    "text-lg font-medium text-gray-500 dark:text-gray-400";
  titleElement.textContent = title;

  const iconElement = document.createElement("i");
  iconElement.className = `${icon} text-2xl text-blue-500 dark:text-blue-400`;

  cardHeader.appendChild(titleElement);
  cardHeader.appendChild(iconElement);

  // Valeur principale
  const valueElement = document.createElement("div");
  valueElement.className =
    "text-3xl font-bold text-gray-800 dark:text-white mb-2";
  valueElement.textContent = value;

  // Indicateur de tendance
  const trendElement = document.createElement("div");
  trendElement.className = `flex items-center text-sm ${
    trend === "up" ? "text-green-500" : "text-red-500"
  } mb-6`;
  trendElement.innerHTML =
    trend === "up"
      ? `<i class="ri-arrow-up-line mr-1"></i> Augmentation`
      : `<i class="ri-arrow-down-line mr-1"></i> Diminution`;

  // Section des statistiques
  const statsSection = document.createElement("div");
  statsSection.className =
    "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700";

  // Fonction pour créer un item de statistique
  const createStatItem = (label, value, isGood) => {
    const item = document.createElement("div");
    item.className = "flex justify-between items-center py-1";

    const labelSpan = document.createElement("span");
    labelSpan.className = "text-sm text-gray-500 dark:text-gray-400";
    labelSpan.textContent = label;

    const valueContainer = document.createElement("div");
    valueContainer.className = "flex items-center";

    const valueSpan = document.createElement("span");
    valueSpan.className = `text-sm font-medium ${
      isGood ? "text-green-500" : "text-red-500"
    }`;
    valueSpan.textContent = value;

    const indicator = document.createElement("span");
    indicator.className = `ml-2 inline-block w-2 h-2 rounded-full ${
      isGood ? "bg-green-500" : "bg-red-500"
    }`;

    valueContainer.appendChild(valueSpan);
    valueContainer.appendChild(indicator);
    item.appendChild(labelSpan);
    item.appendChild(valueContainer);

    return item;
  };

  // Ajout des statistiques
  statsSection.appendChild(createStatItem(`Total des ${key}`, totalData, true));
  statsSection.appendChild(
    createStatItem(`${key} archivées`, archivedData, false)
  );
  statsSection.appendChild(
    createStatItem(`${key} disponibles`, availableData, true)
  );

  // Assemblage final
  card.appendChild(cardHeader);
  card.appendChild(valueElement);
  card.appendChild(trendElement);
  card.appendChild(statsSection);

  return card;
}

export function renderStudentCard(item, index) {
  const studentCard = document.createElement("div");
  studentCard.className =
    "flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-200 shadow-sm";

  // Rang
  const rank = document.createElement("div");
  rank.className =
    "flex items-center justify-center h-8 w-8 rounded-full bg-base-300 text-sm font-medium";
  rank.textContent = index + 1;

  // Avatar
  const avatar = document.createElement("img");
  avatar.src = item.utilisateur?.avatar || "/assets/default-avatar.png";
  avatar.alt = "Avatar";
  avatar.className = "h-10 w-10 rounded-full object-cover";

  // Infos étudiant
  const name = document.createElement("div");
  name.className = "flex flex-col";

  const fullName = document.createElement("span");
  fullName.className = "font-medium text-gray-800";
  fullName.textContent = `${item.utilisateur?.prenom || ""} ${
    item.utilisateur?.nom || ""
  }`;

  const matricule = document.createElement("span");
  matricule.className = "text-xs text-gray-500";
  matricule.textContent = `Matricule : ${item.matricule}`;

  const email = document.createElement("span");
  email.className = "text-xs text-gray-500";
  email.textContent = item.utilisateur?.email || "Email non renseigné";

  name.appendChild(fullName);
  name.appendChild(matricule);
  name.appendChild(email);

  // Assembler la carte
  studentCard.appendChild(rank);
  studentCard.appendChild(avatar);
  studentCard.appendChild(name);

  return studentCard;
}

export function createCourseCard(course, index) {
  // Créer l'élément principal
  const courseCard = document.createElement("div");
  courseCard.className =
    "flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-200 shadow-sm hover:bg-base-50 transition-colors";

  // Numéro d'ordre (optionnel)
  const order = document.createElement("div");
  order.className =
    "flex items-center justify-center h-8 w-8 rounded-full bg-base-300 text-sm font-medium";
  order.textContent = index + 1;

  // Avatar avec initiales du module
  const avatar = document.createElement("div");
  avatar.className =
    "flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-medium";

  // Extraire les initiales (ex: "Programmation Java" -> "PJ")
  const initials = course.module?.libelle
    ? course.module.libelle
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "--";

  avatar.textContent = initials;

  // Contenu principal
  const content = document.createElement("div");
  content.className = "flex-1 flex flex-col gap-1";

  // Nom du module
  const moduleName = document.createElement("span");
  moduleName.className = "font-medium text-gray-800";
  moduleName.textContent = course.module?.libelle || "Module inconnu";

  // Heures
  const time = document.createElement("span");
  time.className = "text-sm text-gray-600";
  time.textContent = `${course.heure_debut} - ${course.heure_fin}`;

  // Salle
  const room = document.createElement("span");
  room.className = "text-xs text-gray-500 flex items-center gap-1";
  room.innerHTML = `<i class="ri-map-pin-line"></i> ${
    course.salle || "Salle non précisée"
  }`;

  // Professeur
  const professor = document.createElement("span");
  professor.className = "text-xs text-gray-500 flex items-center gap-1";
  professor.innerHTML = `<i class="ri-user-3-line"></i> ${
    course.professeur?.utilisateur?.prenom || "Prénom"
  } ${course.professeur?.utilisateur?.nom || "Nom"}`;

  content.appendChild(moduleName);
  content.appendChild(time);
  content.appendChild(room);
  content.appendChild(professor);

  // Statut (optionnel)
  const status = document.createElement("div");
  status.className =
    "text-xs px-2 py-1 rounded-full " +
    (course.statut === "annulé"
      ? "bg-red-100 text-red-600"
      : course.statut === "effectué"
      ? "bg-green-100 text-green-600"
      : "bg-blue-100 text-blue-600");
  status.textContent = course.statut || "planifié";

  // Assembler la carte
  courseCard.appendChild(order);
  courseCard.appendChild(avatar);
  courseCard.appendChild(content);
  courseCard.appendChild(status);

  return courseCard;
}

export function createEmptyCourseState(options = {}) {
  const {
    illustration = true,
    title = "Aucun cours aujourd'hui",
    message = "Vous n'avez aucun cours prévu pour cette journée",
    actionText = "",
    onAction = null,
  } = options;

  const emptyState = document.createElement("div");
  emptyState.className =
    "flex flex-col items-center justify-center py-8 px-4 text-center bg-white shadow-sm rounded-lg border border-gray-200";

  if (illustration) {
    const illustration = document.createElement("div");
    illustration.className = "mb-4 text-blue-100";
    illustration.innerHTML = `
      <img src="/frontend/assets/images/recherche.png" alt="No Courses" class="w-24 h-24 mx-auto mb-4" />
    `;
    emptyState.appendChild(illustration);
  }

  const titleElement = document.createElement("h3");
  titleElement.className = "text-lg font-medium text-gray-600 mb-1";
  titleElement.textContent = title;
  emptyState.appendChild(titleElement);

  const messageElement = document.createElement("p");
  messageElement.className = "text-sm text-gray-400 mb-4";
  messageElement.textContent = message;
  emptyState.appendChild(messageElement);

  if (actionText && onAction) {
    const actionButton = document.createElement("button");
    actionButton.className =
      "text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1";
    actionButton.innerHTML = `
      <i class="ri-refresh-line"></i>
      ${actionText}
    `;
    actionButton.addEventListener("click", onAction);
    emptyState.appendChild(actionButton);
  }

  return emptyState;
}
