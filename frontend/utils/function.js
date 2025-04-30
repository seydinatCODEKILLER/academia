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

export function calculateHeures(heure_debut, heure_fin) {
  const debut = new Date(`1970-01-01T${heure_debut}`);
  const fin = new Date(`1970-01-01T${heure_fin}`);
  return (fin - debut) / (1000 * 60 * 60);
}
