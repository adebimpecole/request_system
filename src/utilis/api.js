import axios from "axios";
import { getToken, getRefreshToken, setToken, setRefreshToken, clearSession } from "./storage";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Plain axios instance — bypasses the interceptors below so the refresh
// call itself can't trigger another refresh attempt.
const rawAxios = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const forceLogout = () => {
  clearSession();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  // Share one in-flight refresh across concurrent 401s instead of firing many
  if (!refreshPromise) {
    refreshPromise = rawAxios
      .post("/auth/refresh", { refreshToken })
      .then((res) => {
        setToken(res.data.token);
        setRefreshToken(res.data.refreshToken);
        return res.data.token;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const status = response?.status;

    if ((status === 401 || status === 403) && !config._retry) {
      config._retry = true;
      try {
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch {
        forceLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
