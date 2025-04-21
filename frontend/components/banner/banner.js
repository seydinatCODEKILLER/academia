/**
 * Crée une bannière moderne et réutilisable pour les différentes sections de l'application
 * @param {Object} config - Configuration de la bannière
 * @param {string} config.title - Titre principal de la bannière
 * @param {string} config.subtitle - Sous-titre descriptif
 * @param {string} config.imageUrl - URL de l'image à afficher
 * @param {string} config.altText - Texte alternatif pour l'image
 * @param {string} [config.bgColor='bg-white'] - Couleur de fond
 * @param {string} [config.textColor='text-gray-800'] - Couleur du texte
 * @param {boolean} [config.showBadge=false] - Afficher un badge optionnel
 * @param {string} [config.badgeText=''] - Texte du badge
 * @param {string} [config.badgeColor='bg-blue-100 text-blue-800'] - Couleur du badge
 * @param {boolean} [config.showAction=false] - Afficher un bouton d'action
 * @param {string} [config.actionText=''] - Texte du bouton d'action
 * @param {Function} [config.onActionClick] - Callback pour le bouton d'action
 * @param {string} [config.icon] - Icône optionnelle (classe RemixIcon)
 * @returns {HTMLElement} L'élément bannière
 */
export function createModernBanner(config) {
  // Configuration par défaut
  const {
    title = "Titre de la bannière",
    subtitle = "Description de la section",
    imageUrl = "",
    altText = "Illustration",
    bgColor = "bg-white",
    textColor = "text-gray-800",
    showBadge = false,
    badgeText = "",
    badgeColor = "bg-blue-100 text-blue-800",
    showAction = false,
    actionText = "",
    onActionClick = null,
    icon = null,
  } = config;

  // Création du conteneur principal
  const banner = document.createElement("div");
  banner.className = [
    "flex",
    "items-center",
    "gap-4",
    "lg:gap-6",
    "p-2",
    "lg:p-3",
    "rounded-xl",
    "mb-3",
    bgColor,
    "shadow-sm",
    "border",
    "border-gray-100",
  ].join(" ");

  // Conteneur de l'image/icône
  const imageContainer = document.createElement("div");
  imageContainer.className = [
    "flex-shrink-0",
    "w-16",
    "h-16",
    "lg:w-20",
    "lg:h-20",
    "rounded-full",
    "bg-gradient-to-br",
    "from-purple-50",
    "to-blue-50",
    "flex",
    "items-center",
    "justify-center",
    "overflow-hidden",
  ].join(" ");

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = altText;
    image.className = "object-cover w-full h-full";
    imageContainer.appendChild(image);
  } else if (icon) {
    const iconElement = document.createElement("i");
    iconElement.className = `${icon} text-3xl lg:text-4xl text-purple-500`;
    imageContainer.appendChild(iconElement);
  } else {
    // Icône par défaut si aucune image ni icône fournie
    const defaultIcon = document.createElement("i");
    defaultIcon.className = "ri-team-line text-3xl lg:text-4xl text-purple-500";
    imageContainer.appendChild(defaultIcon);
  }

  // Contenu textuel
  const textContainer = document.createElement("div");
  textContainer.className = "flex-1 flex flex-col gap-1 lg:gap-2";

  // En-tête avec titre et badge optionnel
  const header = document.createElement("div");
  header.className = "flex items-center gap-3";

  const titleElement = document.createElement("h1");
  titleElement.className = [
    "font-medium",
    "text-xl",
    "lg:text-2xl",
    textColor,
    "flex-1",
  ].join(" ");
  titleElement.textContent = title;

  header.appendChild(titleElement);

  // Badge optionnel
  if (showBadge && badgeText) {
    const badge = document.createElement("span");
    badge.className = [
      "text-xs",
      "lg:text-sm",
      "font-medium",
      "badge",
      "badge-soft",
      `badge-${badgeColor}`,
    ].join(" ");
    badge.textContent = badgeText;
    header.appendChild(badge);
  }

  textContainer.appendChild(header);

  // Sous-titre
  const subtitleElement = document.createElement("span");
  subtitleElement.className = [
    "text-sm",
    "badge",
    "badge-soft",
    `badge-${badgeColor}`,
    "lg:text-base",
    "font-medium",
  ].join(" ");
  subtitleElement.textContent = subtitle;
  textContainer.appendChild(subtitleElement);

  // Action optionnelle
  if (showAction && actionText) {
    const actionButton = document.createElement("button");
    actionButton.className = [
      "mt-2",
      "self-start",
      "px-4",
      "py-2",
      "bg-purple-600",
      "hover:bg-purple-700",
      "text-white",
      "text-sm",
      "font-medium",
      "rounded-lg",
      "transition-colors",
      "duration-200",
      "flex",
      "items-center",
      "gap-2",
    ].join(" ");
    actionButton.textContent = actionText;

    if (onActionClick) {
      actionButton.addEventListener("click", onActionClick);
    }

    // Ajout d'une icône à droite du texte
    const arrowIcon = document.createElement("i");
    arrowIcon.className = "ri-arrow-right-line text-base";
    actionButton.appendChild(arrowIcon);

    textContainer.appendChild(actionButton);
  }

  // Assemblage des éléments
  banner.appendChild(imageContainer);
  banner.appendChild(textContainer);

  return banner;
}

/**
 * Crée une bannière illustrée avec un fond à motif, un titre, un sous-titre et une image flottante
 * @param {Object} config - Configuration de la bannière
 * @param {string} config.title - Titre principal
 * @param {string} config.subtitle - Sous-titre descriptif
 * @param {string} config.illustrationUrl - URL de l'image illustrative
 * @param {string} [config.bgColor='bg-blue-50'] - Couleur de fond principale
 * @param {string} [config.pattern='bg-dots'] - Classe Tailwind pour motif (ex: 'bg-dots', 'bg-grid')
 * @param {string} [config.textColor='text-gray-900'] - Couleur du texte
 * @param {string} [config.altText='Illustration'] - Texte alternatif de l’image
 * @returns {HTMLElement} Élément de la bannière
 */
export function createIllustratedBanner(config) {
  const {
    title = "Bienvenue dans notre plateforme",
    subtitle = "Simplifiez la gestion avec style",
    illustrationUrl = "/assets/illustration.png",
    bgColor = "bg-blue-50",
    pattern = "bg-dots",
    textColor = "text-gray-900",
    altText = "Illustration",
  } = config;

  const banner = document.createElement("div");
  banner.className = [
    "relative",
    "w-full",
    "rounded-xl",
    "p-4",
    "lg:p-8",
    "flex",
    "md:flex-row",
    "items-center",
    "justify-between",
    bgColor,
    pattern,
    "shadow-sm",
  ].join(" ");

  const textContent = document.createElement("div");
  textContent.className = "max-w-xl space-y-1";

  const titleEl = document.createElement("h1");
  titleEl.className = `text-xl lg:text-3xl font-bold ${textColor}`;
  titleEl.textContent = title;

  const subtitleEl = document.createElement("p");
  subtitleEl.className = `text-sm font-medium lg:text-lg ${textColor} opacity-80`;
  subtitleEl.textContent = subtitle;

  textContent.appendChild(titleEl);
  textContent.appendChild(subtitleEl);

  // Illustration à droite (image en hauteur libre)
  const illustration = document.createElement("img");
  illustration.src = illustrationUrl;
  illustration.alt = altText;
  illustration.className = [
    "object-cover",
    "absolute",
    "right-0",
    "h-56",
    "hidden",
    "lg:block",
    "pointer-events-none",
  ].join(" ");

  banner.appendChild(textContent);
  banner.appendChild(illustration);

  return banner;
}
