// classSwitcher.js
import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import {
  fetchExistingAbsences,
  markStudentsAbsent,
  removeAbsence,
} from "../../services/professeurService.js";
import { groupStudentsByClass } from "../../utils/function.js";
import { createFooter } from "../ui/footer.js";
import { createHeader } from "../ui/header.js";

// --- Student Item Management ---
const createStudentItem = (
  student,
  isChecked,
  isDisabled,
  onToggle,
  onRemove
) => {
  const item = document.createElement("div");
  item.className =
    "flex items-center justify-between p-3 bg-base-100 rounded-lg";

  item.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="avatar">
        <div class="w-8 rounded-full">
          <img src="${student.utilisateur.avatar || "/default-avatar.png"}" 
               alt="${student.utilisateur.prenom} ${student.utilisateur.nom}" />
        </div>
      </div>
      <span>${student.utilisateur.prenom} ${student.utilisateur.nom}</span>
    </div>
    <div class="flex items-center gap-2">
      ${
        isDisabled
          ? `
        <button class="btn btn-xs btn-error remove-absence-btn" 
                data-student-id="${student.id}" 
                data-absence-id="${student.absenceId}">
          Annuler
        </button>
      `
          : ""
      }
      <label class="cursor-pointer label">
        <input type="checkbox" 
               class="toggle toggle-error" 
               data-student-id="${student.id}" 
               ${isChecked ? "checked" : ""}
               ${isDisabled ? "disabled" : ""} />
      </label>
    </div>
  `;

  if (isDisabled) {
    const removeBtn = item.querySelector(".remove-absence-btn");
    removeBtn.addEventListener("click", onRemove);
  } else {
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () =>
      onToggle(student.id, checkbox.checked)
    );
  }

  return item;
};

// --- Main Component ---
export const createClassSwitcher = async (
  classes,
  students,
  courseId,
  idProfesseur
) => {
  // State management
  const state = {
    selectedStudents: new Set(),
    currentClassId: classes[0]?.id,
    studentsByClass: groupStudentsByClass(students, classes),
  };

  // Create container
  const container = document.createElement("div");
  container.className = "flex flex-col h-full";
  container.id = "class-switcher-container";

  // Create UI components
  const header = createHeader(classes, (classId) => {
    state.currentClassId = classId;
    updateStudentsList();
  });

  const footer = createFooter(() => saveAbsences());
  const studentsContainer = document.createElement("div");
  studentsContainer.className = "flex-1 overflow-y-auto";
  studentsContainer.id = "students-list-container";

  // Append components
  container.appendChild(header);
  container.appendChild(studentsContainer);
  container.appendChild(footer.container);

  // Initial render
  await updateStudentsList();

  // --- Core Functions ---
  async function updateStudentsList() {
    studentsContainer.innerHTML = "";
    const students = state.studentsByClass[state.currentClassId] || [];

    if (students.length === 0) {
      studentsContainer.innerHTML = `<div class="text-center py-8 text-gray-500">Aucun étudiant dans cette classe</div>`;
      return;
    }

    const list = document.createElement("div");
    list.className = "space-y-2 overflow-y-auto h-60";

    const existingAbsences = await fetchExistingAbsences(courseId);

    students.forEach((student) => {
      const absence = existingAbsences.find(
        (a) => a.id_etudiant === student.id
      );
      const isPreviouslyAbsent = !!absence;

      const item = createStudentItem(
        { ...student, absenceId: absence?.id },
        state.selectedStudents.has(student.id) || isPreviouslyAbsent,
        isPreviouslyAbsent,
        (studentId, isChecked) => {
          if (isChecked) state.selectedStudents.add(studentId);
          else state.selectedStudents.delete(studentId);
          footer.saveBtn.disabled = state.selectedStudents.size === 0;
        },
        async (e) => {
          const loading = showLoadingModal(
            "Annulation de l'absence en cours..."
          );
          try {
            e.stopPropagation();
            const absenceId = e.target.dataset.absenceId;
            await removeAbsence(absenceId);
            await updateStudentsList();
          } finally {
            loading.close();
          }
        }
      );
      list.appendChild(item);
    });

    studentsContainer.appendChild(list);
  }

  async function saveAbsences() {
    const loading = showLoadingModal("Enregistrement en cours...");
    try {
      const absences = Array.from(state.selectedStudents).map((studentId) => ({
        studentId,
        courseId,
        justified: "en attente",
        id_marqueur: idProfesseur,
        date: new Date().toISOString().split("T")[0],
      }));

      const result = await markStudentsAbsent(absences);

      if (result.success) {
        state.selectedStudents.clear();
        footer.saveBtn.disabled = true;
        await updateStudentsList();
      }
    } finally {
      loading.close();
    }
  }

  return container;
};
