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
