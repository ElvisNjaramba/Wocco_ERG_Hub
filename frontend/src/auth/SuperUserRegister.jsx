import { useState, useEffect } from "react";
import api from "../api/axios";

export default function SuperUserRegister() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [superusers, setSuperusers] = useState([]);

  // Fetch all superusers on component mount
  useEffect(() => {
    const fetchSuperusers = async () => {
      try {
        const res = await api.get("/superusers/"); // Backend endpoint to get all superusers
        setSuperusers(res.data);
      } catch (err) {
        console.error("Failed to fetch superusers", err);
      }
    };
    fetchSuperusers();
  }, []);

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/register/", form);

      // Add new superuser to table
      setSuperusers((prev) => [
        ...prev,
        {
          username: res.data.username,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          password: res.data.password, // only show password once
        },
      ]);

      setForm({ first_name: "", last_name: "", email: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create superuser. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0b1c] p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-[#111029] rounded-3xl shadow-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-[#432dd7] mb-6 text-center">
          Register Superuser
        </h2>

        {errorMsg && <p className="text-red-500 text-sm font-medium mb-4">{errorMsg}</p>}

        <form className="flex flex-col gap-4 mb-6" onSubmit={register}>
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a3a] focus:ring-2 focus:ring-[#432dd7]"
            required
            disabled={loading}
          />

          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a3a] focus:ring-2 focus:ring-[#432dd7]"
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a3a] focus:ring-2 focus:ring-[#432dd7]"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#432dd7] hover:bg-[#3a27c0]"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Superusers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-[#111029] border border-gray-300 dark:border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#1a1a3a]">
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">First Name</th>
                <th className="text-left px-4 py-2">Last Name</th>
                <th className="text-left px-4 py-2">Password</th>
              </tr>
            </thead>
            <tbody>
              {superusers.map((user, idx) => (
                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.first_name}</td>
                  <td className="px-4 py-2">{user.last_name}</td>
                  <td className="px-4 py-2 font-mono">{user.password || "••••••••"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">&copy; 2026 Wocco</p>
      </div>
    </div>
  );
}
