import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Log in and get JWT tokens
      const response = await api.post("auth/login/", {
        username: form.username,
        password: form.password,
      });

      const { access, refresh } = response.data;

      // 2️⃣ Save tokens locally
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 3️⃣ Fetch user info from backend
      const dashboardResponse = await api.get("dashboard/");

      // 4️⃣ Redirect based on role
      if (dashboardResponse.data.role === "superuser") {
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
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button type="submit">Login</button>
    </form>
  );
}
