export function createStyledElement(tag, classes, content = "", src = "") {
  const el = document.createElement(tag);
  el.className = classes;
  el.src = src;
  el.textContent = content;
  return el.outerHTML;
}

export function formatDate(dateString) {
  if (!dateString) return "Date inconnue";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
}

export function getRandomColor() {
  return Math.floor(Math.random() * 16777215);
}

export function colorStateClasse(state) {
  switch (state) {
    case "disponible":
      return "success";
    case "archiver":
      return "error";
    default:
      return "secondary";
  }
}

export function colorState(state) {
  switch (state) {
    case "planifié":
      return "success";
    case "annuler":
      return "warning";
    case "archiver":
      return "error";
    case "effectué":
      return "info";
    default:
      return "secondary";
  }
}

export function colorStateAbsence(state) {
  switch (state) {
    case "justifier":
      return "success";
    case "en attente":
      return "warning";
    default:
      return "secondary";
  }
}

export function colorStateJustification(state) {
  switch (state) {
    case "accepter":
      return "success";
    case "refuser":
      return "error";
    case "en attente":
      return "warning";
    default:
      return "secondary";
  }
}

export function calculateHeures(heure_debut, heure_fin) {
  const debut = new Date(`1970-01-01T${heure_debut}`);
  const fin = new Date(`1970-01-01T${heure_fin}`);
  return (fin - debut) / (1000 * 60 * 60);
}

export async function processUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: event.target.result.split(",")[1],
      });
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

function convertDayToIndex(dateString) {
  const date = new Date(dateString);
  return date.getDay(); // Retourne 0 (dimanche) à 6 (samedi)
}

// Pour obtenir l'index correspondant à vos jours (Lundi=0 à Samedi=5)
export function getWeekdayIndex(dateString) {
  const dayIndex = convertDayToIndex(dateString);
  return dayIndex === 0 ? 6 : dayIndex - 1; // Transforme dimanche(0)->6, lundi(1)->0, etc.
}

/**
 * Vérifie si une date est dans la semaine courante avec un décalage
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @param {number} weekOffset - Décalage en semaines (0 = semaine actuelle)
 * @returns {boolean} - True si la date est dans la semaine demandée
 */
export function isInWeek(dateString, weekOffset = 0) {
  try {
    // 1. Convertir la date à vérifier
    const inputDate = new Date(dateString);
    if (isNaN(inputDate)) return false;

    // 2. Calculer le début et fin de la semaine cible
    const { startOfWeek, endOfWeek } = calculateWeekRange(weekOffset);

    // 3. Comparer les dates (en ignorant les heures)
    const dateToCheck = new Date(inputDate);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck >= startOfWeek && dateToCheck <= endOfWeek;
  } catch (error) {
    console.error("Erreur dans isInWeek:", error);
    return false;
  }
}

/**
 * Calcule le début et fin de semaine avec décalage
 * @param {number} weekOffset - Décalage en semaines
 * @returns {Object} - { startOfWeek, endOfWeek } (Dates JS)
 */
function calculateWeekRange(weekOffset = 0) {
  const now = new Date();

  // Début de semaine (Lundi)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() || 7) + 1 + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  // Fin de semaine (Dimanche)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}
