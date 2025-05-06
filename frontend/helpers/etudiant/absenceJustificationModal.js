import { createJustificationForm } from "../../components/form/form.js";
import { createModal } from "../../components/modals/modal.js";
import { handleJustificationSubmit } from "../../handler/etudiant/justificationEtudiant.handler.js";
import { getStudentAbsences } from "../../services/etudiantService.js";

// utils/absenceJustificationModal.js
export async function buildJustificationModal(
  absenceId,
  idEtudiant,
  onSubmitSuccess
) {
  const absences = await getStudentAbsences(idEtudiant);
  const absence = absences.find((a) => a.id_absence === absenceId);
  if (!absence) throw new Error("Absence introuvable");

  const form = await createJustificationForm(absence);
  const modal = createModal({
    title: "Justifier l'absence",
    content: form,
    size: "lg",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleJustificationSubmit(form, absenceId, idEtudiant);
    if (result.success) {
      modal.close();
      await onSubmitSuccess?.();
    }
  };

  const modalContainer = document.getElementById("modal-absence-container");
  modalContainer.appendChild(modal);
  modal.showModal();
}
