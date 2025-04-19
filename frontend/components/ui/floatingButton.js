/**
 * Crée un bouton d'action flottant (FAB) réutilisable
 * @param {Object} config - Configuration du bouton
 * @param {string} config.id - ID du bouton
 * @param {string} config.icon - Classe de l'icône (ex: 'ri-user-add-line')
 * @param {string} config.title - Texte au survol
 * @param {string} [config.color='primary'] - Couleur du bouton (primary, secondary, etc.)
 * @param {Function} config.onClick - Callback au clic
 * @param {string} [config.position='bottom-right'] - Position (bottom-right, bottom-left, etc.)
 * @returns {HTMLElement} Le bouton créé
 */
export function createFloatingButton({
  id,
  icon,
  title,
  color = "primary",
  onClick,
  position = "bottom-right",
}) {
  const button = document.createElement("button");
  button.id = id;

  // Positions prédéfinies
  const positions = {
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "top-right": "top-8 right-8",
    "top-left": "top-8 left-8",
  };

  button.className = `
    fixed z-50
    btn btn-${color} btn-circle
    shadow-lg hover:shadow-xl
    w-16 h-16 text-2xl
    transition-all duration-300
    ${positions[position] || positions["bottom-right"]}
  `;

  button.innerHTML = `<i class="${icon}"></i>`;
  button.title = title;

  button.addEventListener("click", onClick);

  return button;
}
