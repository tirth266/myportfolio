import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { googleLogin as postGoogleLogin, login as loginRequest } from "../services/taskApi";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginRequest(form);
      login({ token: response.data.token, user: response.data.user });
      navigate("/tasks");
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to connect to the server.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (googleResponse) => {
    if (!googleResponse?.credential) {
      setError("Google sign-in was cancelled.");
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      const response = await postGoogleLogin(googleResponse.credential);

      login({ token: response.data.token, user: response.data.user });
      navigate("/tasks");
    } catch (err) {
      const message = err?.response?.data?.message || "Google authentication failed. Please try again.";
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Login</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || googleLoading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            text="signin_with"
            size="large"
            width="100%"
            theme="filled_blue"
            shape="pill"
            type="standard"
            auto_select={false}
            locale="en"
            disabled={isSubmitting || googleLoading}
          />
        </div>

        <div className="mt-6 text-center text-sm text-slate-300">
          Don’t have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
