import { fetchData } from "./api.js";

export async function getIdRpByUserId(id_utilisateur) {
  const responsables = await fetchData("responsables_pedagogiques");
  const rp = responsables.find((item) => item.id_utilisateur == id_utilisateur);
  const rpId = rp ? rp.id : null;
  return rpId;
}
