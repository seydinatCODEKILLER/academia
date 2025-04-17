import { fetchData } from "./api.js";

export async function getIdAttacherByUserId(id_utilisateur) {
  const attaches = await fetchData("attaches");
  const attache = attaches.find(
    (item) => item.id_utilisateur == id_utilisateur
  );
  const actorId = attache ? attache.id_attache : null;
  return actorId;
}

export async function getNombreClassesGerees(idAttache) {
  try {
    const classesAttaches = await fetchData("classes_attaches");
    const classesAttache = classesAttaches.filter(
      (ca) => ca.id_attache == idAttache
    );

    const classes = await fetchData("classes");
    const classesGerees = classes.filter((c) =>
      classesAttache.some((ca) => ca.id_classe === c.id_classe)
    );

    return classesGerees.length;
  } catch (error) {
    console.error("Erreur lors du calcul des classes gérées:", error);
    return 0;
  }
}

export async function getNombreJustificationsEnAttenteByAttache(idAttache) {
  try {
    const [classesAttaches, etudiants, absences, justifications] =
      await Promise.all([
        fetchData("classes_attaches"),
        fetchData("etudiants"),
        fetchData("absences"),
        fetchData("justifications"),
      ]);

    const classesIds = classesAttaches
      .filter((item) => item.id_attache === idAttache)
      .map((item) => item.id_classe);

    const etudiantsIds = etudiants
      .filter((etud) => classesIds.includes(etud.id_classe))
      .map((etud) => etud.id_etudiant);

    const absencesIds = absences
      .filter((abs) => etudiantsIds.includes(abs.id_etudiant))
      .map((abs) => abs.id_absence);

    const justifsEnAttente = justifications.filter(
      (justif) =>
        justif.statut === "en attente" &&
        absencesIds.includes(justif.id_absence)
    );

    return justifsEnAttente.length;
  } catch (error) {
    console.error(
      "Erreur lors du calcul des justifications en attente:",
      error
    );
    return 0;
  }
}

export async function getNombreEtudiantsGeres(idAttache) {
  try {
    const classesAttaches = await fetchData("classes_attaches");
    const classesAttache = classesAttaches.filter(
      (ca) => ca.id_attache == idAttache
    );

    const etudiants = await fetchData("etudiants");
    const etudiantsGeres = etudiants.filter((e) =>
      classesAttache.some((ca) => ca.id_classe === e.id_classe)
    );

    return etudiantsGeres.length;
  } catch (error) {
    console.error("Erreur lors du calcul des étudiants gérés:", error);
    return 0;
  }
}

export async function getDashboardStatsAttacher(idAttache) {
  try {
    const [nbClasses, nbJustifications, nbEtudiants] = await Promise.all([
      getNombreClassesGerees(idAttache),
      getNombreJustificationsEnAttenteByAttache(idAttache),
      getNombreEtudiantsGeres(idAttache),
    ]);

    return {
      nombreClasses: nbClasses,
      justificationsEnAttente: nbJustifications,
      nombreEtudiants: nbEtudiants,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des stats du dashboard:",
      error
    );
    return {
      nombreClasses: 0,
      justificationsEnAttente: 0,
      nombreEtudiants: 0,
    };
  }
}

export async function getTop5Absentees(idAttache) {
  try {
    // 1. Récupérer les données nécessaires
    const [classesAttaches, etudiants, absences, classes, utilisateurs] =
      await Promise.all([
        fetchData("classes_attaches"),
        fetchData("etudiants"),
        fetchData("absences"),
        fetchData("classes"),
        fetchData("utilisateurs"),
      ]);

    // 2. Filtrer les classes gérées par l'attaché
    const classesAttache = classesAttaches.filter(
      (ca) => ca.id_attache == idAttache
    );
    const idClassesGerees = classesAttache.map((ca) => ca.id_classe);

    // 3. Récupérer les étudiants de ces classes avec leurs infos utilisateur
    const etudiantsAvecInfos = etudiants
      .filter((e) => idClassesGerees.includes(e.id_classe))
      .map((etudiant) => {
        const utilisateur = utilisateurs.find(
          (u) => u.id_utilisateur == etudiant.id_utilisateur
        );
        const classe = classes.find((c) => c.id_classe == etudiant.id_classe);
        return {
          ...etudiant,
          nom: utilisateur?.nom || "Inconnu",
          prenom: utilisateur?.prenom || "Inconnu",
          avatar: utilisateur?.avatar || "Inconnu",
          nomClasse: classe?.libelle || "Inconnu",
        };
      });

    // 4. Compter les absences non justifiées par étudiant
    const absencesParEtudiant = etudiantsAvecInfos.map((etudiant) => {
      const absencesEtudiant = absences.filter(
        (a) =>
          a.id_etudiant === etudiant.id_etudiant && a.justified !== "justifier"
      );
      return {
        id_etudiant: etudiant.id_etudiant,
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        classe: etudiant.nomClasse,
        avatar: etudiant.avatar,
        nombreAbsences: absencesEtudiant.length,
        // Ajout des heures d'absence si nécessaire
        heuresAbsences: absencesEtudiant.reduce((total, absence) => {
          const cours = absences.find((a) => a.id_cours === absence.id_cours);
          return total + (cours?.nombre_heures || 0);
        }, 0),
      };
    });

    // 5. Trier par nombre d'absences et retourner les top 5
    return absencesParEtudiant
      .sort((a, b) => b.nombreAbsences - a.nombreAbsences)
      .slice(0, 5);
  } catch (error) {
    console.error("Erreur lors du calcul des top 5 absents:", error);
    return [];
  }
}

export async function getClassesEtEtudiantsParAttache(idAttache) {
  try {
    // Récupération de toutes les données nécessaires en parallèle
    const [
      classesAttaches,
      classes,
      etudiants,
      utilisateurs,
      filieres,
      niveaux,
      // scolarite,
    ] = await Promise.all([
      fetchData("classes_attaches"),
      fetchData("classes"),
      fetchData("etudiants"),
      fetchData("utilisateurs"),
      fetchData("filieres"),
      fetchData("niveaux"),
      // fetchData("annee_scolaire"),
    ]);

    // 1. Filtrer les classes assignées à cet attaché
    const classesAttache = classesAttaches
      .filter((ca) => ca.id_attache == idAttache)
      .map((ca) => ca.id_classe);

    // 2. Récupérer les classes complètes avec filière et niveau et annee scolaire
    const classesCompletes = classes
      .filter((c) => classesAttache.includes(c.id_classe))
      .map((classe) => {
        const filiere = filieres.find(
          (f) => f.id_filiere === classe.id_filiere
        );
        const niveau = niveaux.find((n) => n.id_niveau === classe.id_niveau);
        // const annee_scolaire = scolarite.find(
        //   (s) => s.id_annee === classe.id_annee
        // );
        return {
          ...classe,
          // idFiliere: filiere?.id_filiere,
          // idAnnee: annee_scolaire?.id_annee,
          nomFiliere: filiere?.libelle || "Inconnu",
          nomNiveau: niveau?.libelle || "Inconnu",
        };
      });

    // 3. Récupérer les étudiants pour chaque classe avec leurs infos utilisateur
    const resultat = classesCompletes.map((classe) => {
      const etudiantsClasse = etudiants
        .filter((e) => e.id_classe === classe.id_classe)
        .map((etudiant) => {
          const utilisateur = utilisateurs.find(
            (u) => u.id_utilisateur === etudiant.id_utilisateur
          );
          return {
            id_etudiant: etudiant.id_etudiant,
            matricule: etudiant.matricule,
            nom: utilisateur?.nom || "Inconnu",
            prenom: utilisateur?.prenom || "Inconnu",
            email: utilisateur?.email || "",
            telephone: utilisateur?.telephone || "",
            date_inscription: etudiant.date_inscription,
          };
        });

      return {
        id_classe: classe.id_classe,
        libelle: classe.libelle,
        statut: classe.state,
        idFiliere: classe.id_filiere,
        idAnnee: classe.id_annee,
        nomFiliere: classe.nomFiliere,
        nomNiveau: classe.nomNiveau,
        capacite_max: classe.capacite_max,
        etudiants: etudiantsClasse,
        nombreEtudiants: etudiantsClasse.length || 0,
      };
    });

    return resultat;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des classes et étudiants:",
      error
    );
    return [];
  }
}
