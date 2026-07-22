export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; }
  catch { return {}; }
};

export const getToken = () => {
  try { return JSON.parse(localStorage.getItem("token")) || ""; }
  catch { return ""; }
};

export const getRefreshToken = () => {
  try { return JSON.parse(localStorage.getItem("refreshToken")) || ""; }
  catch { return ""; }
};

export const setSession = ({ user, token, refreshToken }) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", JSON.stringify(token));
  if (refreshToken) localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
};

export const setToken = (token) => localStorage.setItem("token", JSON.stringify(token));
export const setRefreshToken = (refreshToken) => localStorage.setItem("refreshToken", JSON.stringify(refreshToken));

export const clearSession = () => localStorage.clear();

// Decode JWT exp field without verifying the signature — fast client-side check
export const isTokenExpired = () => {
  try {
    const token = getToken();
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getId = () => getUser().id || "";
export const getRole = () => getUser().role || "";
export const getEmail = () => getUser().email || "";
export const getCompanyId = () => getUser().company_id || getUser().id || "";
export const getDisplayName = () => {
  const u = getUser();
  if (u.first_name) return `${u.first_name} ${u.last_name || ""}`.trim();
  return u.company_name || "";
};
