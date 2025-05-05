// --- UI Components ---
export const createHeader = (classes, onClassChange) => {
  const header = document.createElement("div");
  header.className = "flex gap-2 overflow-x-auto pb-2 mb-4";
  header.id = "class-switcher-header";

  classes.forEach((classe, index) => {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${index === 0 ? "btn-active" : "btn-ghost"}`;
    btn.textContent = classe.libelle;
    btn.dataset.classId = classe.id;
    btn.onclick = () => onClassChange(classe.id);
    header.appendChild(btn);
  });

  return header;
};
