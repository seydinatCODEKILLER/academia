/**
 * Crée un modal réutilisable avec DaisyUI
 * @param {Object} config - Configuration du modal
 * @param {string} config.id - ID du modal
 * @param {string} config.title - Titre du modal
 * @param {string|HTMLElement} config.content - Contenu du modal
 * @param {boolean} config.showCloseButton - Afficher le bouton fermer
 * @returns {HTMLElement} L'élément modal
 */
export function createModal(config) {
  const {
    id = `modal-${Math.random().toString(36)}`,
    title = "Modal",
    content = "",
    showCloseButton = true,
  } = config;

  const modal = document.createElement("dialog");
  modal.id = id;
  modal.className = "modal";

  const modalBox = document.createElement("div");
  modalBox.className = "modal-box";

  // En-tête du modal
  const modalHeader = document.createElement("div");
  modalHeader.className = "flex items-center justify-between mb-4";

  const modalTitle = document.createElement("h3");
  modalTitle.className = "font-bold text-lg";
  modalTitle.textContent = title;

  modalHeader.appendChild(modalTitle);

  // Bouton fermer si activé
  if (showCloseButton) {
    const closeButton = document.createElement("button");
    closeButton.className = "btn btn-sm btn-circle btn-ghost";
    closeButton.innerHTML = "✕";
    closeButton.onclick = () => modal.close();
    modalHeader.appendChild(closeButton);
  }

  // Contenu du modal
  const modalContent = document.createElement("div");
  modalContent.className = "py-4";

  if (typeof content === "string") {
    modalContent.innerHTML = content;
  } else {
    modalContent.appendChild(content);
  }

  // Pied de page du modal
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-action";

  const closeFooterButton = document.createElement("button");
  closeFooterButton.className = "btn";
  closeFooterButton.textContent = "Fermer";
  closeFooterButton.onclick = () => modal.close();
  modalFooter.appendChild(closeFooterButton);

  // Assemblage
  modalBox.appendChild(modalHeader);
  modalBox.appendChild(modalContent);
  modalBox.appendChild(modalFooter);
  modal.appendChild(modalBox);

  // Fermer en cliquant en dehors
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.close();
    }
  };

  return modal;
}
