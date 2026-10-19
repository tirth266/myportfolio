import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Key used to persist { token, user } in localStorage. Kept in one place so
// AuthContext and this file can never drift apart.
export const AUTH_KEY = "task_app_auth";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach the JWT to every outgoing call ───────────────
// Practical 7 flow: the client holds a token, the server trusts it, so every
// protected call must carry "Authorization: Bearer <token>".
client.interceptors.request.use((config) => {
  const stored = localStorage.getItem(AUTH_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (error) {
      // Corrupt entry in localStorage — drop it so we retry as a logged-out
      // user instead of sending a broken header forever.
      localStorage.removeItem(AUTH_KEY);
    }
  }

  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
// Practical 7 supplementary task. When the token is missing, expired or
// rejected, the backend answers 401. Instead of every page having to check
// for that itself, I catch it in one place: clear the bad token and send the
// user to /login. This is why the user is redirected automatically when the
// 1 hour token lifetime runs out.
//
// I only redirect for protected endpoints — a failed /auth/login must show
// its own error on the login page instead of bouncing the user.
const PROTECTED_PREFIXES = ["/api/tasks", "/tasks", "/api/auth/me", "/auth/me"];

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isProtectedRequest = PROTECTED_PREFIXES.some((prefix) => url.startsWith(prefix));

    if (status === 401 && isProtectedRequest) {
      // Log the user out on the client side, exactly as the Logout button does.
      localStorage.removeItem(AUTH_KEY);

      // window.location.assign does a full page load, which guarantees the
      // React state (AuthContext) is rebuilt from an empty localStorage.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const register = async (data) => client.post("/api/auth/register", data);
export const login = async (data) => client.post("/api/auth/login", data);
export const googleLogin = async (credential) => client.post("/api/auth/google", { credential });

// POST /api/auth/logout — Practical 7 supplementary.
// A JWT is stateless, so the server cannot really "cancel" a token; this
// endpoint exists so the client has one single place that says "I am done"
// and the real cleanup happens by clearing localStorage.
export const logoutRequest = async () => client.post("/api/auth/logout");

export const getMe = async () => client.get("/api/auth/me");

export const getTasks = async () => client.get("/api/tasks");
export const getTask = async (id) => client.get(`/api/tasks/${id}`);
export const createTask = async (data) => client.post("/api/tasks", data);
export const updateTask = async (id, data) => client.put(`/api/tasks/${id}`, data);
export const deleteTask = async (id) => client.delete(`/api/tasks/${id}`);

export default client;
