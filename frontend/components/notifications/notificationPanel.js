import { fetchData } from "../../services/api.js";
import { getUser } from "../../services/utilisateurService.js";

// 1. Styles constants
const PANEL_STYLES = {
  base: "fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
  header:
    "px-4 py-3 border-b border-gray-200 flex justify-between items-center",
  list: "h-[calc(100%-60px)] overflow-y-auto p-2",
  emptyState:
    "flex flex-col items-center justify-center h-full px-4 text-center",
  card: "mb-3 rounded-lg border border-gray-200 overflow-hidden",
  cardUnread: "border-l-2 border-l-blue-500",
  cardHeader: "px-3 py-2  flex items-center gap-3",
  cardContent: "px-3 py-2 bg-gray-50",
  cardActions: "px-3 py-2 flex justify-end gap-2 border-t border-gray-200",
  btn: "px-3 py-1 rounded text-sm",
  btnPrimary: "bg-blue-500 text-white hover:bg-blue-600",
  btnDanger: "bg-red-500 text-white hover:bg-red-600",
  btnNeutral: "bg-gray-200 text-gray-700 hover:bg-gray-300",
};

// 3. Composant d'état vide
function createEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.className = PANEL_STYLES.emptyState;

  emptyState.innerHTML = `
    <img src="/frontend/assets/images/recherche.png" alt="Aucune notification" class="w-48 h-48 mb-4">
    <h4 class="text-lg font-medium text-gray-700 mb-2">Aucune notification</h4>
    <p class="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
  `;

  return emptyState;
}

// 4. Composant de notification card
async function createNotificationCard(notification) {
  const user = await getUser(notification.sender_id);
  const card = document.createElement("div");
  card.className = `${PANEL_STYLES.card} ${
    !notification.is_read ? PANEL_STYLES.cardUnread : ""
  }`;

  // Header avec avatar
  card.innerHTML = `
    <div class="${PANEL_STYLES.cardHeader}">
      <img src="${user.avatar || "/assets/images/default-avatar.png"}" alt="${
    user.prenom
  }" class="w-8 h-8 rounded-full">
      <div>
        <p class="text-sm font-medium">${user.prenom} ${user.nom}</p>
        <p class="text-xs text-gray-500">${formatDateTime(
          notification.created_at
        )}</p>
      </div>
    </div>
    <div class="${PANEL_STYLES.cardContent}">
      <p class="text-xs">${notification.message}</p>
      ${
        notification.metadata?.status
          ? `<p class="text-sm mt-1 ${
              notification.metadata.status === "accepted"
                ? "text-green-500"
                : "text-red-500"
            }">
        Statut: ${notification.metadata.status}
      </p>`
          : ""
      }
    </div>
  `;

  // Actions selon le type
  const actions = document.createElement("div");
  actions.className = PANEL_STYLES.cardActions;

  switch (notification.type) {
    case "justification_requested":
      actions.innerHTML = `
        <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnDanger} decline-btn" data-id="${notification.id}">Refuser</button>
        <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnPrimary} accept-btn" data-id="${notification.id}">Accepter</button>
        <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnNeutral} details-btn" data-id="${notification.related_entity_id}">Détails</button>
      `;
      break;
    case "absence_marked":
      actions.innerHTML = `
        <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnPrimary} justify-btn" data-notification="${notification.id}" data-id="${notification.metadata.course_id}">Justifier</button>
        <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnNeutral} details-btn" data-id="${notification.metadata.course_id}">Détails</button>
      `;
      break;
    case "justification_processed":
      // Bouton pour voir les détails si nécessaire
      if (notification.related_entity_id) {
        actions.innerHTML = `
          <button class="${PANEL_STYLES.btn} ${PANEL_STYLES.btnNeutral} details-btn" data-id="${notification.related_entity_id}">Voir détails</button>
        `;
      }
      break;
  }

  card.appendChild(actions);
  return card;
}

// 5. Composant principal
export async function createNotificationPanel(userId, onAction) {
  const panel = document.createElement("div");
  panel.className = `${PANEL_STYLES.base} translate-x-full`;
  panel.id = "notification-panel";

  // Header
  panel.innerHTML = `
    <div class="${PANEL_STYLES.header}">
      <h3 class="font-medium">Notifications</h3>
      <div>
        <button class="text-lg text-gray-800 close-btn">
        <i class="ri-close-fill"></i>
        </button>
      </div>
    </div>
    <div class="${PANEL_STYLES.list}" id="notification-list"></div>
  `;

  // Récupérer et afficher les notifications
  const notifications = await fetchData("notifications").then((notifs) =>
    notifs
      .filter((n) => n.receiver_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  );

  const list = panel.querySelector("#notification-list");

  if (notifications.length === 0) {
    list.appendChild(createEmptyState());
  } else {
    for (const notif of notifications) {
      list.appendChild(await createNotificationCard(notif));
    }
  }

  // Gestion des événements
  panel.querySelector(".close-btn").addEventListener("click", () => {
    panel.classList.add("translate-x-full");
  });

  // Délégation d'événements pour les boutons d'action
  panel.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const notificationId = btn.dataset.notification;
    const notification = await fetchData("notifications", notificationId);

    const action = btn.classList.contains("accept-btn")
      ? "accept"
      : btn.classList.contains("decline-btn")
      ? "decline"
      : btn.classList.contains("justify-btn")
      ? "justify"
      : btn.classList.contains("details-btn")
      ? "details"
      : null;

    if (action && typeof onAction === "function") {
      btn.disabled = true;
      try {
        await onAction(action, notification);
      } finally {
        btn.disabled = false;
      }
    }
  });

  return panel;
}

// 6. Fonction pour afficher/masquer
export function toggleNotificationPanel() {
  const panel = document.getElementById("notification-panel");
  if (!panel) return;

  panel.classList.toggle("translate-x-full");

  // Focus sur le panel quand il s'ouvre
  if (!panel.classList.contains("translate-x-full")) {
    panel.focus();
  }
}

// 7. Helper pour formater la date
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

// 8. Fonction pour marquer toutes comme lues
async function markAllAsRead(userId) {
  const notifications = await fetchData("notifications").then((notifs) =>
    notifs.filter((n) => n.receiver_id === userId && !n.is_read)
  );

  await Promise.all(
    notifications.map((notif) =>
      updateData("notifications", notif.id, { is_read: true })
    )
  );
}
