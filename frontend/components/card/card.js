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
