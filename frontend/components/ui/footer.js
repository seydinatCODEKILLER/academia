// --- UI Components ---

export const createFooter = (onSave) => {
  const footer = document.createElement("div");
  footer.className = "mt-4 flex justify-end";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Enregistrer les absences";
  saveBtn.disabled = true;
  saveBtn.onclick = onSave;

  footer.appendChild(saveBtn);
  return { container: footer, saveBtn };
};
