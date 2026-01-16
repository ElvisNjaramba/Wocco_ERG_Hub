import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import api from "../api/axios";
import animationData from "../animations/secure-login.json";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ---------- LOGIN ----------
      const response = await api.post("auth/login/", {
        username: form.username,
        password: form.password,
      });

      const { access, refresh } = response.data;

      // ---------- STORE TOKENS ----------
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("isAuthenticated", "true");

      // ---------- GET USER ROLE ----------
      const dashboardResponse = await api.get("dashboard/");
      const role = dashboardResponse.data.role;

      localStorage.setItem("role", role);

      // ---------- REDIRECT ----------
      if (role === "superuser") {
        navigate("/superuser/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0b1c] p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center bg-white dark:bg-[#111029] rounded-3xl shadow-2xl overflow-hidden">
        
        {/* ---------- Animation Section ---------- */}
        <div className="w-full md:w-1/2 bg-[#f5f5ff] dark:bg-[#1a1a3a] flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#432dd7] mb-4 text-center">
            Wocco ERG Hub
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            Secure, fast, and intuitive platform for all your enterprise needs
          </p>

          <Player
            autoplay
            loop
            src={animationData}
            className="w-64 h-64 md:w-80 md:h-80"
          />
        </div>

        {/* ---------- Login Form ---------- */}
        <form
          onSubmit={handleLogin}
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col gap-6"
        >
          <h2 className="text-3xl font-bold text-[#432dd7]">
            Sign In
          </h2>

          {error && (
            <p className="text-red-500 text-sm font-medium">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a3a] focus:ring-2 focus:ring-[#432dd7]"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a3a] focus:ring-2 focus:ring-[#432dd7]"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#432dd7] text-white font-semibold hover:bg-[#3a27c0]"
          >
            Login
          </button>

          <p className="text-xs text-gray-400 mt-2">
            &copy; 2026 Wocco
          </p>
        </form>
      </div>
    </div>
  );
}
