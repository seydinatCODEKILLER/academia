import { fetchData } from "./api.js";

export async function getClassStatistics() {
  const classes = await fetchData("classes");

  const totalClasses = classes.length;
  const archivedClasses = classes.filter(
    (classe) => classe.state === "archivé"
  ).length;
  const availableClasses = classes.filter(
    (classe) => classe.state === "disponible"
  ).length;

  return {
    totalClasses,
    archivedClasses,
    availableClasses,
  };
}

export async function getProfessorStatistics() {
  const professeurs = await fetchData("professeurs");
  const utilisateurs = await fetchData("utilisateurs");

  // Jointure entre professeurs et utilisateurs pour vérifier le state
  const professorsWithState = professeurs.map((prof) => {
    const user = utilisateurs.find((u) => u.id === prof.id_utilisateur);
    return { ...prof, state: user ? user.state : "inconnu" };
  });

  const totalProfesseurs = professeurs.length;
  const activeProfesseurs = professorsWithState.filter(
    (prof) => prof.state === "actif"
  ).length;
  const availableProfesseurs = professorsWithState.filter(
    (prof) => prof.state === "disponible"
  ).length;

  return {
    totalProfesseurs,
    activeProfesseurs,
    availableProfesseurs,
  };
}

export async function getCourseStatistics() {
  const cours = await fetchData("cours");

  const totalCours = cours.length;
  const plannedCours = cours.filter((c) => c.statut === "planifié").length;
  const canceledCours = cours.filter((c) => c.statut === "annulé").length;

  return {
    totalCours,
    plannedCours,
    canceledCours,
  };
}

export async function getCoursesEvolution() {
  const cours = await fetchData("cours");

  // Grouper les cours par mois
  const coursesByMonth = cours.reduce((acc, course) => {
    const date = new Date(course.date_cours);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear]++;

    return acc;
  }, {});

  // Convertir en format adapté pour un graphique
  const labels = Object.keys(coursesByMonth).sort();
  const data = labels.map((label) => coursesByMonth[label]);

  return {
    labels,
    data,
  };
}

/**
 * Récupère et organise les données des cours par filière et par mois
 * @returns {Promise<Object>} { labels: string[], datasets: Object[] }
 */
/**
 * Récupère et organise les données des cours par filière et par mois
 * @returns {Promise<Object>} { labels: string[], datasets: Object[] }
 */
export async function getCoursesByTrackData() {
  // Récupérer toutes les données nécessaires
  const [cours, modules, filieres, coursClasses] = await Promise.all([
    fetchData("cours"),
    fetchData("modules"),
    fetchData("filieres"),
    fetchData("cours_classes"),
  ]);

  // Créer un mapping des modules vers leurs filières
  const moduleToFiliere = {};
  modules.forEach((module) => {
    moduleToFiliere[module.id] = module.id_filiere;
  });

  // Créer un mapping des cours vers leurs classes
  const coursToClasses = {};
  coursClasses.forEach((cc) => {
    if (!coursToClasses[cc.id_cours]) {
      coursToClasses[cc.id_cours] = [];
    }
    coursToClasses[cc.id_cours].push(cc.id_classe);
  });

  // Grouper les cours par filière et par mois
  const filiereStats = {};

  cours.forEach((course) => {
    const date = new Date(course.date_cours);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    // Trouver la filière via le module du cours
    const filiereId = moduleToFiliere[course.id_module];
    if (!filiereId) return;

    // Initialiser les structures si nécessaire
    if (!filiereStats[filiereId]) {
      filiereStats[filiereId] = {};
    }
    if (!filiereStats[filiereId][monthYear]) {
      filiereStats[filiereId][monthYear] = 0;
    }

    filiereStats[filiereId][monthYear]++;
  });

  // Préparer les datasets pour Chart.js
  const datasets = [];
  const allMonths = new Set();

  filieres.forEach((filiere) => {
    if (filiereStats[filiere.id]) {
      const filiereData = filiereStats[filiere.id];
      const months = Object.keys(filiereData).sort();
      months.forEach((month) => allMonths.add(month));

      // Générer une couleur basée sur l'ID de la filière pour la stabilité
      const hue = (parseInt(filiere.id) * 137) % 360; // Algorithme simple pour des couleurs distinctes
      const color = `hsl(${hue}, 70%, 50%)`;

      datasets.push({
        label: filiere.libelle,
        data: months.map((month) => filiereData[month]),
        borderColor: color,
        backgroundColor: color.replace(")", ", 0.1)"),
        tension: 0.2,
      });
    }
  });

  // Trier les mois chronologiquement
  const labels = Array.from(allMonths).sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number);
    const [yearB, monthB] = b.split("-").map(Number);
    return yearA === yearB ? monthA - monthB : yearA - yearB;
  });

  return { labels, datasets };
}
