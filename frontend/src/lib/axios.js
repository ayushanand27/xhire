import axios from "axios";
import toast from "react-hot-toast";

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  return value.trim().replace(/\/+$/, "").replace(/\/api\/?$/, "");
};

const API_BASE_URL =
  normalizeApiBaseUrl(import.meta.env.VITE_API_URL) || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("Axios baseURL:", API_BASE_URL);
}

// Store the getToken function from Clerk
let getTokenFn = null;

export const setClerkToken = (getToken) => {
  getTokenFn = getToken;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("✅ Clerk token getter registered", typeof getToken);
  }
};

// Helper to format error messages
const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status === 401) return "Please log in to continue";
  if (error.response?.status === 403) return "You don't have permission for this action";
  if (error.response?.status === 404) return "Resource not found";
  if (error.response?.status === 500) return "Server error. Please try again later";
  if (error.code === 'ECONNABORTED') return "Request timed out. Please check your connection";
  if (error.message === 'Network Error') return "Network error. Please check your internet connection";
  return error.message || "Something went wrong. Please try again";
};

// Add Clerk token to every request
axiosInstance.interceptors.request.use(async (config) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    console.log("   Base URL:", config.baseURL);
    console.log("   Full URL:", config.baseURL + config.url);
  }
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("   ✅ Auth token attached (length:", token.length, ")");
        }
      } else {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("   ⚠️ Token is null or empty");
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("   ❌ Failed to get Clerk token:", e.message);
      }
    }
  } else {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("   ⚠️ No token getter function available!");
    }
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        "API Response:",
        response.config.method?.toUpperCase(),
        response.config.url,
        "Status:",
        response.status
      );
    }
    return response;
  },
  (error) => {
    const errorMsg = getErrorMessage(error);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        "❌ API Error:",
        error.config?.method?.toUpperCase(),
        error.config?.url,
        "\n   Status:",
        error.response?.status,
        "\n   Message:",
        errorMsg,
        "\n   Response data:",
        error.response?.data
      );
    }
    
    // Show user-friendly error toast (skip if caller will handle it)
    if (error.config?.skipErrorToast !== true) {
      toast.error(errorMsg, { duration: 5000 });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
