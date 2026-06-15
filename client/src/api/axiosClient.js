import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh on 401
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      isRefreshing = true;

      try {
        const res = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );
        const { token } = res.data;
        localStorage.setItem("token", token);
        queue.forEach(({ resolve }) => resolve(token));
        queue = [];
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        localStorage.removeItem("token");
        queue.forEach(({ reject }) => reject(err));
        queue = [];
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  },
);

export default api;
