export function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("currentUser");
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function setCurrentUserRole(role) {
  localStorage.setItem("role_id", JSON.stringify(role));
}

export function clearUserRole() {
  localStorage.removeItem("role_id");
}

export function getCurrentUserRoleId() {
  const roleId = localStorage.getItem("role_id");
  return user ? JSON.parse(user) : null;
}
