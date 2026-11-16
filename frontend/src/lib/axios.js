import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If an explicit non-localhost URL is provided, use it
  if (envUrl && (!envUrl.includes("localhost") || import.meta.env.DEV)) {
    return envUrl;
  }
  // In production, fallback to relative /api on the current host
  return import.meta.env.DEV ? "http://localhost:3000/api" : "/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default axiosInstance;
