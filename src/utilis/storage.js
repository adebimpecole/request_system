export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; }
  catch { return {}; }
};

export const getToken = () => {
  try { return JSON.parse(localStorage.getItem("token")) || ""; }
  catch { return ""; }
};

export const getId = () => getUser().id || "";
export const getRole = () => getUser().role || "";
export const getEmail = () => getUser().email || "";
export const getCompanyId = () => getUser().companyid || getUser().id || "";
export const getDisplayName = () => {
  const u = getUser();
  if (u.firstname) return `${u.firstname} ${u.lastname || ""}`.trim();
  return u.company_name || "";
};
