export const API_BASE_URL = "http://localhost:3000";

export async function fetchData(endpoint, id = "") {
  const url = id
    ? `${API_BASE_URL}/${endpoint}/${id}`
    : `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url);
  return response.json();
}

export async function generateId(endpoints) {
  const data = await fetchData(endpoints);
  const id = data.length > 0 ? parseInt(data[data.length - 1].id) + 1 : 1;
  return id;
}
