import { getAllFilieres } from "../../services/filiereService.js";
import { getAllNiveaux } from "../../services/niveauxServices.js";

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
