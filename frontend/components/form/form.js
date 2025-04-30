import {
  getAllClassesBasic,
  getAvailableClasses,
} from "../../services/classeServices.js";
import { getClassesForCours } from "../../services/coursService.js";
import { getAllFilieres } from "../../services/filiereService.js";
import { getAllModules } from "../../services/moduleServices.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";
import {
  getAllProfessorsBasic,
  getClassesByProfessor,
} from "../../services/professeurService.js";
import { getAllSemestres } from "../../services/semestreService.js";

export async function createClassForm(existingClass = null) {
  const form = document.createElement("form");
  form.className = "space-y-4 p-4 max-h-[70vh] overflow-y-auto";

  // Chargement des données nécessaires
  const [niveaux, filieres] = await Promise.all([
    await getAllNiveaux(),
    await getAllFilieres(),
  ]);

  const defaultValue = {
    libelle: "",
    id_filiere: "",
    id_niveau: "",
    capacite_max: 30,
    state: "disponible",
    ...existingClass,
  };

  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Section 1: Informations de base -->
      <div class="col-span-full font-bold text-lg mb-2">Informations de la classe</div>
      
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Libellé *</span>
        </label>
        <input value="${
          defaultValue.libelle
        }" type="text" placeholder="Nom de la classe" name="libelle" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="libelle"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Filière *</span>
        </label>
        <select name="id_filiere" class="select select-bordered">
          <option value="">Sélectionner...</option>
          ${filieres
            .map(
              (f) => `
            <option value="${f.id}" ${
                f.id === defaultValue.id_filiere ? "selected" : ""
              }>${f.libelle}</option>
          `
            )
            .join("")}
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="id_filiere"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Niveau *</span>
        </label>
        <select name="id_niveau" class="select select-bordered">
          <option value="">Sélectionner...</option>
          ${niveaux
            .map(
              (n) => `
            <option value="${n.id}" ${
                n.id === defaultValue.id_niveau ? "selected" : ""
              }>${n.libelle}</option>
          `
            )
            .join("")}
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="id_niveau"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Capacité maximale *</span>
        </label>
        <input type="number" value="${
          defaultValue.capacite_max
        }" placeholder="capacite de la classe" name="capacite_max" class="input input-bordered" min="1">
        <div class="text-error text-xs mt-1 hidden" data-error="capacite_max"></div>
      </div>
    </div>
    
    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        <i class="ri-save-line mr-2"></i> 
         ${existingClass ? "Enregistrer" : "Créer"}
      </button>
    </div>
  `;
  return form;
}

export async function createProfesseursForm(existingProfesseur = null) {
  const form = document.createElement("form");
  form.className = "space-y-4 p-4 max-h-[70vh] overflow-y-auto";

  const classes = await getAvailableClasses();

  const defaultValue = {
    nom: "",
    prenom: "",
    grade: "",
    email: "",
    specialite: "",
    adresse: "",
    telephone: "",
    avatar: "",
    password: "",
    classes: [],
    ...(existingProfesseur
      ? {
          ...existingProfesseur.informations,
          classes: await getClassesByProfessor(
            existingProfesseur.ids.professeur
          ),
          id_utilisateur: existingProfesseur.ids.utilisateur,
        }
      : {}),
  };

  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Section 1: Informations de base -->
      <div class="col-span-full font-bold text-lg mb-2">Informations de la personnelle</div>

       <input value="${
         defaultValue.id_utilisateur || ""
       }" type="hidden" name="id_utilisateur">
      
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Nom *</span>
        </label>
        <input value="${
          defaultValue.nom
        }" type="text" placeholder="Nom du professeur" name="nom" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="nom"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">prenom *</span>
        </label>
        <input value="${
          defaultValue.prenom
        }" type="text" placeholder="Prenom du professeur" name="prenom" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="prenom"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Email *</span>
        </label>
        <input value="${
          defaultValue.email
        }" type="text" placeholder="Email du professeur" name="email" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="email"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Adresse *</span>
        </label>
        <input value="${
          defaultValue.adresse
        }" type="text" placeholder="Adresse du professeur" name="adresse" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="adresse"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Grade *</span>
        </label>
        <input value="${
          defaultValue.grade
        }" type="text" placeholder="Grade du professeur" name="grade" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="grade"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Specialite *</span>
        </label>
        <input value="${
          defaultValue.specialite
        }" type="text" placeholder="Specialite du professeur" name="specialite" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="specialite"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Telephone *</span>
        </label>
        <input value="${
          defaultValue.telephone
        }" type="text" placeholder="Telephone du professeur" name="telephone" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="telephone"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Avatar *</span>
        </label>
        <input value="${
          defaultValue.avatar
        }" type="text" placeholder="Avatar du professeur" name="avatar" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="avatar"></div>
      </div>

      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Password *</span>
        </label>
        <input value="${
          defaultValue.password
        }" type="text" placeholder="Password du professeur" name="password" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="password"></div>
      </div>
      
      <div class="col-span-full font-bold text-lg mb-2">Affectation des classes</div>
    </div>
    
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
        ${classes
          .map(
            (c) => `
          <label class="card cursor-pointer hover:bg-base-200 transition-colors border border-gray-100">
            <div class="card-body p-4 ">
            <div class="flex items-center gap-2">
              <input type="checkbox" name="classes" value="${c.id}"  ${
              defaultValue.classes.some((cc) => cc.id === c.id) ? "checked" : ""
            } class="checkbox">
              <h4 class="font-medium">${c.libelle}</h4>
              </div>
            </div>
          </label>
        `
          )
          .join("")}
            <div class="text-error text-xs mt-1 hidden col-span-full" data-error="classes"></div>
      </div>

    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        <i class="ri-save-line mr-2"></i> 
         ${existingProfesseur ? "Enregistrer" : "Créer"}
      </button>
    </div>
  `;
  return form;
}

export async function createCoursForm(existingCours = null) {
  const form = document.createElement("form");
  form.className = "space-y-4 p-4 max-h-[62vh] overflow-y-auto";

  const [modules, professeurs, semestres, classes] = await Promise.all([
    getAllModules(),
    getAllProfessorsBasic(),
    getAllSemestres(),
    getAllClassesBasic(),
  ]);

  // Valeurs par défaut
  const defaultValue = {
    id_module: "",
    id_professeur: "",
    id_semestre: "",
    date_cours: "",
    heure_debut: "",
    heure_fin: "",
    salle: "",
    classes: [],
    ...(existingCours
      ? {
          ...existingCours,
          classes: await getClassesForCours(existingCours.id),
        }
      : {}),
  };

  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Section 1: Informations de base -->
      <div class="col-span-full font-bold text-lg mb-2">Informations du cours</div>
      
      ${
        existingCours
          ? `<input type="hidden" name="id_cours" value="${existingCours.id}">`
          : ""
      }
      
      <!-- Module -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Module *</span>
        </label>
        <select name="id_module" class="select select-bordered">
          <option value="">Sélectionner un module</option>
          ${modules
            .map(
              (m) => `
            <option value="${m.id}" ${
                defaultValue.id_module === m.id ? "selected" : ""
              }>
              ${m.libelle}
            </option>
          `
            )
            .join("")}
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="id_module"></div>
      </div>
      
      <!-- Professeur -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Professeur *</span>
        </label>
        <select name="id_professeur" class="select select-bordered">
          <option value="">Sélectionner un professeur</option>
          ${professeurs
            .map(
              (p) => `
            <option value="${p.id}" ${
                defaultValue.id_professeur === p.id ? "selected" : ""
              }>
              ${p.prenom} ${p.nom} - ${p.specialite}
            </option>
          `
            )
            .join("")}
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="id_professeur"></div>
      </div>
      
      <!-- Semestre -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Semestre *</span>
        </label>
        <select name="id_semestre" class="select select-bordered">
          <option value="">Sélectionner un semestre</option>
          ${semestres
            .map(
              (s) => `
            <option value="${s.id}" ${
                defaultValue.id_semestre === s.id ? "selected" : ""
              }>
              ${s.libelle} (${s.annee_scolaire})
            </option>
          `
            )
            .join("")}
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="id_semestre"></div>
      </div>
      
      <!-- Date du cours -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Date du cours *</span>
        </label>
        <input 
          type="date" 
          name="date_cours" 
          value="${defaultValue.date_cours}" 
          class="input input-bordered"
          min="${new Date().toISOString().split("T")[0]}"
        >
        <div class="text-error text-xs mt-1 hidden" data-error="date_cours"></div>
      </div>
      
      <!-- Heure de début -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Heure de début *</span>
        </label>
        <input 
          type="time" 
          name="heure_debut" 
          value="${defaultValue.heure_debut}" 
          class="input input-bordered"
        >
        <div class="text-error text-xs mt-1 hidden" data-error="heure_debut"></div>
      </div>
      
      <!-- Heure de fin -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Heure de fin *</span>
        </label>
        <input 
          type="time" 
          name="heure_fin" 
          value="${defaultValue.heure_fin}" 
          class="input input-bordered"
        >
        <div class="text-error text-xs mt-1 hidden" data-error="heure_fin"></div>
      </div>
      
      <!-- Salle -->
      <div class="form-control flex flex-col">
        <label class="label">
          <span class="label-text">Salle</span>
        </label>
        <input 
          type="text" 
          name="salle" 
          value="${defaultValue.salle || ""}" 
          placeholder="Ex: Salle A1" 
          class="input input-bordered"
        >
        <div class="text-error text-xs mt-1 hidden" data-error="salle"></div>
      </div>
      
      <div class="col-span-full font-bold text-lg mb-2">Classes concernées</div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
      ${classes
        .map(
          (c) => `
        <label class="card cursor-pointer hover:bg-base-200 transition-colors border border-gray-100">
          <div class="card-body p-4">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="classes" 
                value="${c.id}" 
                ${defaultValue.classes.includes(c.id) ? "checked" : ""} 
                class="checkbox"
              >
              <h4 class="font-medium">${c.libelle}</h4>
            </div>
          </div>
        </label>
      `
        )
        .join("")}
      <div class="text-error text-xs mt-1 hidden col-span-full" data-error="classes"></div>
    </div>

    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        <i class="ri-save-line mr-2"></i> 
        ${existingCours ? "Modifier" : "Créer"}
      </button>
    </div>
  `;

  return form;
}
