import axios from "axios";

const api = axios.create({
  baseURL: "https://ranking-back.vercel.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  },
);

export function errMsg(err) {
  return err.response?.data?.error || "Algo deu errado. Tente novamente.";
}

export default api;
