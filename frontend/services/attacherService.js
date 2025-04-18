import { fetchData } from "./api.js";

export async function getIdAttacherByUserId(id_utilisateur) {
  const attaches = await fetchData("attaches");
  const attache = attaches.find(
    (item) => item.id_utilisateur == id_utilisateur
  );
  const actorId = attache ? attache.id : null;
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
      classesAttache.some((ca) => ca.id_classe == c.id)
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
      .filter((item) => item.id_attache == idAttache)
      .map((item) => item.id_classe);

    const etudiantsIds = etudiants
      .filter((etud) => classesIds.includes(etud.id_classe))
      .map((etud) => etud.id);

    const absencesIds = absences
      .filter((abs) => etudiantsIds.includes(abs.id_etudiant))
      .map((abs) => abs.id);

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
      classesAttache.some((ca) => ca.id_classe == e.id_classe)
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
    const [classesAttaches, etudiants, absences, classes, utilisateurs] =
      await Promise.all([
        fetchData("classes_attaches"),
        fetchData("etudiants"),
        fetchData("absences"),
        fetchData("classes"),
        fetchData("utilisateurs"),
      ]);

    const classesAttache = classesAttaches.filter(
      (ca) => ca.id_attache == idAttache
    );
    const idClassesGerees = classesAttache.map((ca) => ca.id_classe);

    const etudiantsAvecInfos = etudiants
      .filter((e) => idClassesGerees.includes(e.id_classe))
      .map((etudiant) => {
        const utilisateur = utilisateurs.find(
          (u) => u.id == etudiant.id_utilisateur
        );
        const classe = classes.find((c) => c.id == etudiant.id_classe);
        return {
          ...etudiant,
          id: etudiant.id,
          nom: utilisateur?.nom || "Inconnu",
          prenom: utilisateur?.prenom || "Inconnu",
          avatar: utilisateur?.avatar || "Inconnu",
          nomClasse: classe?.libelle || "Inconnu",
        };
      });

    const absencesParEtudiant = etudiantsAvecInfos.map((etudiant) => {
      const absencesEtudiant = absences.filter(
        (a) => a.id_etudiant == etudiant.id && a.justified !== "justifier"
      );
      return {
        id: etudiant.id,
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        classe: etudiant.nomClasse,
        avatar: etudiant.avatar,
        nombreAbsences: absencesEtudiant.length,
        heuresAbsences: absencesEtudiant.reduce((total, absence) => {
          return total + (absence?.nombre_heures || 0); // correction ici
        }, 0),
      };
    });

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
    const [
      classesAttaches,
      classes,
      etudiants,
      utilisateurs,
      filieres,
      niveaux,
    ] = await Promise.all([
      fetchData("classes_attaches"),
      fetchData("classes"),
      fetchData("etudiants"),
      fetchData("utilisateurs"),
      fetchData("filieres"),
      fetchData("niveaux"),
    ]);

    // 1. Filtrer les classes assignées à cet attaché
    const classesAttache = classesAttaches
      .filter((ca) => ca.id_attache == idAttache)
      .map((ca) => ca.id_classe);

    // 2. Récupérer les classes complètes avec filière et niveau
    const classesCompletes = classes
      .filter((c) => classesAttache.includes(c.id))
      .map((classe) => {
        const filiere = filieres.find((f) => f.id == classe.id_filiere);
        const niveau = niveaux.find((n) => n.id == classe.id_niveau);

        return {
          ...classe,
          nomFiliere: filiere?.libelle || "Inconnu",
          nomNiveau: niveau?.libelle || "Inconnu",
        };
      });

    // 3. Récupérer les étudiants pour chaque classe avec leurs infos utilisateur
    const resultat = classesCompletes.map((classe) => {
      const etudiantsClasse = etudiants
        .filter((e) => e.id_classe == classe.id)
        .map((etudiant) => {
          const utilisateur = utilisateurs.find(
            (u) => u.id == etudiant.id_utilisateur
          );
          return {
            id: etudiant.id,
            matricule: etudiant.matricule,
            nom: utilisateur?.nom || "Inconnu",
            prenom: utilisateur?.prenom || "Inconnu",
            email: utilisateur?.email || "",
            telephone: utilisateur?.telephone || "",
            date_inscription: etudiant.date_inscription,
          };
        });

      return {
        id: classe.id,
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

export async function getEtudiantsAvecAbsences(idAttache) {
  try {
    const [
      classesAttaches,
      classes,
      filieres,
      anneeScolaires,
      inscriptions,
      etudiants,
      utilisateurs,
      absences,
      cours,
      modules,
    ] = await Promise.all([
      fetchData("classes_attaches"),
      fetchData("classes"),
      fetchData("filieres"),
      fetchData("annee_scolaire"),
      fetchData("inscriptions"),
      fetchData("etudiants"),
      fetchData("utilisateurs"),
      fetchData("absences"),
      fetchData("cours"),
      fetchData("modules"),
    ]);

    const anneeEnCours = anneeScolaires.find((a) => a.est_active === 1);
    if (!anneeEnCours) throw new Error("Aucune année scolaire active trouvée");

    const idClassesAttache = classesAttaches
      .filter((ca) => ca.id_attache == idAttache)
      .map((ca) => ca.id_classe);

    const classesFiltrees = classes.filter(
      (c) => idClassesAttache.includes(c.id) && c.id_annee == anneeEnCours.id
    );

    const etudiantsAvecInfos = etudiants
      .filter((etudiant) => {
        const inscriptionValide = inscriptions.find(
          (i) =>
            i.id_etudiant == etudiant.id &&
            i.statut === "validée" &&
            classesFiltrees.some((c) => c.id == i.id_classe)
        );
        return !!inscriptionValide;
      })
      .map((etudiant) => {
        const utilisateur = utilisateurs.find(
          (u) => u.id == etudiant.id_utilisateur
        );
        const classe = classes.find((c) => c.id == etudiant.id_classe);
        const filiere = filieres.find((f) => f.id == classe?.id_filiere);

        const absencesEtudiant = absences
          .filter((a) => a.id_etudiant == etudiant.id)
          .map((absence) => {
            const coursAbsence = cours.find((c) => c.id == absence.id_cours);
            const moduleAbsence = modules.find(
              (m) => m.id == coursAbsence?.id_module
            );

            return {
              id: absence.id,
              date_absence: absence.date_absence,
              heure_marquage: absence.heure_marquage,
              justified: absence.justified,
              cours: {
                id: coursAbsence?.id,
                module: moduleAbsence?.libelle || "Inconnu",
                date_cours: coursAbsence?.date_cours,
                heure_debut: coursAbsence?.heure_debut,
                salle: coursAbsence?.salle,
              },
            };
          });

        return {
          id: etudiant.id,
          matricule: etudiant.matricule,
          nom: utilisateur?.nom || "Inconnu",
          prenom: utilisateur?.prenom || "Inconnu",
          email: utilisateur?.email || "",
          avatar: utilisateur?.avatar || "",
          classeLibelle: classe?.libelle,
          idNiveau: classe?.id_niveau,
          filiereLibelle: filiere?.libelle,
          absences: absencesEtudiant,
          nombreAbsences: absencesEtudiant.length,
          heuresAbsences: absencesEtudiant.reduce((total, abs) => {
            const duree =
              cours.find((c) => c.id == abs.cours?.id)?.nombre_heures || 0;
            return total + (abs.justified === "justifier" ? 0 : duree);
          }, 0),
        };
      });

    return etudiantsAvecInfos;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants avec absences:",
      error
    );
    return [];
  }
}

export async function getDemandesJustificationAttache(idAttache) {
  try {
    const [
      anneeScolaires,
      classesAttaches,
      classes,
      justifications,
      absences,
      etudiants,
      utilisateurs,
      cours,
      modules,
    ] = await Promise.all([
      fetchData("annee_scolaire"),
      fetchData("classes_attaches"),
      fetchData("classes"),
      fetchData("justifications"),
      fetchData("absences"),
      fetchData("etudiants"),
      fetchData("utilisateurs"),
      fetchData("cours"),
      fetchData("modules"),
    ]);

    const anneeEnCours = anneeScolaires.find((a) => a.est_active == 1);
    if (!anneeEnCours) throw new Error("Aucune année scolaire active trouvée");

    const idClassesAttache = classesAttaches
      .filter((ca) => ca.id_attache == idAttache)
      .map((ca) => ca.id_classe);

    const classesAttache = classes.filter(
      (c) => idClassesAttache.includes(c.id) && c.id_annee == anneeEnCours.id
    );

    const idEtudiantsAttache = etudiants
      .filter((e) => classesAttache.some((c) => c.id == e.id_classe))
      .map((e) => e.id);

    const demandes = justifications
      .filter((j) => idEtudiantsAttache.includes(j.id_etudiant))
      .map((j) => {
        const absence = absences.find((a) => a.id == j.id_absence);
        const etudiant = etudiants.find((e) => e.id == j.id_etudiant);
        const utilisateur = utilisateurs.find(
          (u) => u.id == etudiant?.id_utilisateur
        );
        const classe = classes.find((c) => c.id == etudiant?.id_classe);
        const coursAbsence = cours.find((c) => c.id == absence?.id_cours);
        const moduleAbsence = modules.find(
          (m) => m.id == coursAbsence?.id_module
        );

        return {
          id: j.id,
          date_justification: j.date_justification,
          motif: j.motif,
          pieces_jointes: j.pieces_jointes,
          statut: j.statut,
          date_traitement: j.date_traitement,
          commentaire_traitement: j.commentaire_traitement,
          etudiant: {
            id: etudiant?.id,
            matricule: etudiant?.matricule,
            nom: utilisateur?.nom || "Inconnu",
            prenom: utilisateur?.prenom || "Inconnu",
            classe: {
              id: classe?.id,
              libelle: classe?.libelle || "Inconnu",
            },
          },
          absence: {
            id: absence?.id,
            date_absence: absence?.date_absence,
            cours: {
              id: coursAbsence?.id,
              module: moduleAbsence?.libelle || "Inconnu",
              date_cours: coursAbsence?.date_cours,
              heure_debut: coursAbsence?.heure_debut,
              professeur: coursAbsence?.id_professeur,
            },
          },
        };
      });

    return demandes;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de justification:",
      error
    );
    return [];
  }
}

export async function getClassesByAttache(idAttache) {
  try {
    // Récupération des données nécessaires en parallèle
    const [classesAttaches, classes] = await Promise.all([
      fetchData("classes_attaches"),
      fetchData("classes"),
    ]);

    // Filtrer et mapper les classes de l'attaché
    return classesAttaches
      .filter((ca) => ca.id_attache == idAttache)
      .map((ca) => {
        const classe = classes.find((c) => c.id == ca.id_classe);
        return {
          id_classe: ca.id_classe,
          libelle: classe?.libelle || "Classe inconnue",
        };
      });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des classes simplifiées:",
      error
    );
    return [];
  }
}

export async function getEtudiantsParAttache(idAttache) {
  try {
    // Récupération des données en parallèle
    const [classesAttaches, classes, etudiants, utilisateurs, inscriptions] =
      await Promise.all([
        fetchData("classes_attaches"),
        fetchData("classes"),
        fetchData("etudiants"),
        fetchData("utilisateurs"),
        fetchData("inscriptions"),
      ]);

    // 1. Trouver les classes gérées par l'attaché
    const idClassesAttache = classesAttaches
      .filter((ca) => ca.id_attache === idAttache)
      .map((ca) => ca.id_classe);

    // 2. Filtrer les étudiants inscrits dans ces classes
    return etudiants
      .filter((etudiant) => {
        // Vérifier que l'étudiant est dans une classe gérée
        const estDansClasseAttache = idClassesAttache.includes(
          etudiant.id_classe
        );

        // Vérifier qu'il a une inscription validée
        const inscriptionValide = inscriptions.some(
          (i) => i.id_etudiant === etudiant.id && i.statut === "validée"
        );

        return estDansClasseAttache && inscriptionValide;
      })
      .map((etudiant) => {
        const utilisateur = utilisateurs.find(
          (u) => u.id === etudiant.id_utilisateur
        );
        const classe = classes.find((c) => c.id == etudiant.id_classe);
        const inscription = inscriptions.find(
          (i) => i.id_etudiant == etudiant.id
        );

        return {
          id: etudiant.id,
          matricule: etudiant.matricule,
          nom: utilisateur?.nom || "Inconnu",
          prenom: utilisateur?.prenom || "Inconnu",
          email: utilisateur?.email || "",
          telephone: utilisateur?.telephone || "",
          avatar: utilisateur?.avatar,
          id_classe: etudiant.id_classe,
          idAnnee: classe?.id_annee,
          classe_libelle: classe?.libelle || "Inconnu",
          date_inscription: inscription?.date_inscription || "Inconnu",
          est_reinscription: inscription?.est_reinscription || false,
        };
      });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants par attaché:",
      error
    );
    return [];
  }
}
