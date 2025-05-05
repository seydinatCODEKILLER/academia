import { showLoadingModal } from "../../helpers/attacher/justificationHelpers.js";
import {
  fetchExistingAbsences,
  markStudentsAbsent,
  removeAbsence,
} from "../../services/professeurService.js";

/**
 * Groupe les étudiants par classe
 */
function groupStudentsByClass(students, classes) {
  const result = {};

  classes.forEach((classe) => {
    result[classe.id] = students.filter((s) => s.id_classe === classe.id);
  });
  console.log(result);

  return result;
}

/**
 * Crée un composant de navigation entre les classes avec gestion des absences
 */
export async function createClassSwitcher(
  classes,
  students,
  courseId,
  idProfesseur
) {
  const container = document.createElement("div");
  container.className = "flex flex-col h-full";
  container.id = "class-switcher-container";

  // Stocker les étudiants sélectionnés
  const selectedStudents = new Set();

  // 1. Header avec les boutons de classe
  const header = document.createElement("div");
  header.className = "flex gap-2 overflow-x-auto pb-2 mb-4";
  header.id = "class-switcher-header";

  // Grouper les étudiants par classe
  const studentsByClass = groupStudentsByClass(students, classes);

  // 2. Conteneur pour la liste des étudiants
  const studentsContainer = document.createElement("div");
  studentsContainer.className = "flex-1 overflow-y-auto";
  studentsContainer.id = "students-list-container";

  // 3. Footer avec bouton d'enregistrement
  const footer = document.createElement("div");
  footer.className = "mt-4 flex justify-end";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Enregistrer les absences";
  saveBtn.disabled = true;
  saveBtn.onclick = async () =>
    await saveAbsences(courseId, selectedStudents, idProfesseur);
  footer.appendChild(saveBtn);

  // Fonction pour mettre à jour l'état du bouton
  const updateSaveButtonState = () => {
    saveBtn.disabled = selectedStudents.size === 0;
  };

  // Créer un bouton pour chaque classe
  classes.forEach((classe, index) => {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${index === 0 ? "btn-active" : "btn-ghost"}`;
    btn.textContent = classe.libelle;
    btn.dataset.classId = classe.id;
    btn.onclick = async () => {
      await switchClassTab(
        classe.id,
        studentsByClass,
        updateSaveButtonState,
        selectedStudents,
        courseId
      );
    };
    header.appendChild(btn);
  });

  // Remplir initialement avec la première classe
  if (classes.length > 0) {
    const studentsList = await renderStudentsList(
      classes[0].id,
      studentsByClass,
      updateSaveButtonState,
      selectedStudents,
      courseId
    );
    studentsContainer.appendChild(studentsList);
  }

  // Assemblage
  container.appendChild(header);
  container.appendChild(studentsContainer);
  container.appendChild(footer);

  return container;
}

/**
 * Affiche la liste des étudiants d'une classe
 */
async function renderStudentsList(
  classId,
  studentsByClass,
  updateCallback,
  selectedStudents,
  courseId
) {
  const container = document.createElement("div");
  const students = studentsByClass[classId] || [];

  console.log(courseId);

  // Récupérer les absences existantes pour ce cours
  const existingAbsences = await fetchExistingAbsences(courseId);

  if (students.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-gray-500">Aucun étudiant dans cette classe</div>`;
    return container;
  }

  const list = document.createElement("div");
  list.className = "space-y-2 overflow-y-auto h-60";

  students.forEach((student) => {
    const isPreviouslyAbsent = existingAbsences.some(
      (absence) => absence.id_etudiant === student.id
    );

    const item = document.createElement("div");
    item.className =
      "flex items-center justify-between p-3 bg-base-100 rounded-lg";

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="w-8 rounded-full">
            <img src="${student.utilisateur.avatar || "/default-avatar.png"}" 
                 alt="${student.utilisateur.prenom} ${
      student.utilisateur.nom
    }" />
          </div>
        </div>
        <span>${student.utilisateur.prenom} ${student.utilisateur.nom}</span>
      </div>
      <div class="flex items-center gap-2">
        ${
          isPreviouslyAbsent
            ? `
          <button class="btn btn-xs btn-error remove-absence-btn" 
                  data-student-id="${student.id}" 
                  data-absence-id="${
                    existingAbsences.find((a) => a.id_etudiant === student.id)
                      ?.id
                  }">
            Annuler
          </button>
        `
            : ""
        }
        <label class="cursor-pointer label">
          <input type="checkbox" 
                 class="toggle toggle-error" 
                 data-student-id="${student.id}" 
                 ${
                   selectedStudents.has(student.id) || isPreviouslyAbsent
                     ? "checked"
                     : ""
                 }
                 ${isPreviouslyAbsent ? "disabled" : ""} />
        </label>
      </div>
    `;

    // Gestion du clic sur le bouton "Annuler"
    if (isPreviouslyAbsent) {
      const removeBtn = item.querySelector(".remove-absence-btn");
      removeBtn.addEventListener("click", async (e) => {
        const loading = showLoadingModal("Annulation de l'absence en cours...");
        try {
          e.stopPropagation();
          const absenceId = e.target.dataset.absenceId;
          const success = await removeAbsence(absenceId);
          if (success) {
            item.querySelector(".toggle-error").disabled = false;
            item.querySelector(".toggle-error").checked = false;
            e.target.remove();
          }
        } catch (error) {
          console.error("Erreur lors de l'annulation de l'absence:", error);
        } finally {
          loading.close();
        }
      });
    } else {
      const checkbox = item.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedStudents.add(student.id);
        } else {
          selectedStudents.delete(student.id);
        }
        updateCallback();
      });
    }

    list.appendChild(item);
  });

  container.appendChild(list);
  return container;
}

/**
 * Change l'affichage pour une autre classe
 */
async function switchClassTab(
  classId,
  studentsByClass,
  updateCallback,
  selectedStudents,
  courseId
) {
  console.log("Switching class tab to:", courseId);
  // Mettre à jour les boutons actifs
  document.querySelectorAll("#class-switcher-header button").forEach((btn) => {
    const isActive = btn.dataset.classId === classId;
    btn.classList.toggle("btn-active", isActive);
    btn.classList.toggle("btn-ghost", !isActive);
  });

  const container = document.getElementById("students-list-container");
  if (container) {
    container.innerHTML = "";
    const newContent = await renderStudentsList(
      classId,
      studentsByClass,
      updateCallback,
      selectedStudents,
      courseId
    );
    container.appendChild(newContent);
  }
}

async function saveAbsences(courseId, selectedStudents, idProfesseur) {
  const loading = showLoadingModal("Enregistrement en cours...");
  try {
    const absences = Array.from(selectedStudents).map((studentId) => ({
      studentId,
      courseId,
      justified: "en attente",
      id_marqueur: idProfesseur,
      date: new Date().toISOString().split("T")[0],
    }));

    // Envoyer les données au serveur
    const result = await markStudentsAbsent(absences);

    if (result.success) {
      selectedStudents.clear();
      document.querySelectorAll(".toggle-error").forEach((checkbox) => {
        checkbox.checked = false;
      });
      document.querySelector(
        "#class-switcher-container button.btn-primary"
      ).disabled = true;
    } else {
      throw new Error(result.message || "Erreur lors de l'enregistrement");
    }
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    loading.close();
  }
}
