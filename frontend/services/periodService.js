import { fetchData } from "./api.js";

export async function checkReinscriptionPeriod(type = "reinscription") {
  try {
    const configs = await fetchData("config");
    const now = new Date();

    // Mapping des clés de configuration
    const configKeys = {
      reinscription: {
        debut: "periode_reinscription_debut",
        fin: "periode_reinscription_fin",
      },
      inscription: {
        debut: "periode_inscription_debut",
        fin: "periode_inscription_fin",
      },
    };

    const keys = configKeys[type];
    if (!keys) throw new Error("Type de période invalide");

    // Extraction des dates
    const getDate = (key) => {
      const value = configs.find((c) => c.cle === key)?.valeur;
      if (!value) throw new Error(`Configuration ${key} manquante`);
      return new Date(value);
    };

    const start = getDate(keys.debut);
    const end = getDate(keys.fin);

    // Vérification avec marge d'un jour
    const isOpen = now >= start && now <= end;

    console.log(`Période ${type}:`, {
      ouverte: isOpen,
      maintenant: now.toISOString(),
      debut: start.toISOString(),
      fin: end.toISOString(),
    });

    return isOpen;
  } catch (error) {
    console.error(`Erreur vérification période ${type}:`, error);
    return false;
  }
}
