import { fetchData } from "./api.js";

export async function login(email, password) {
  const users = await fetchData("utilisateurs");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Identifiants incorrects");
  }

  return user;
}
