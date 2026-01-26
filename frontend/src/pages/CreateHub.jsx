import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateHub() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adminId, setAdminId] = useState("");
  const [image, setImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch all users to select admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/"); // Make sure your API provides a users list
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateHub = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (adminId) formData.append("admin", adminId);
      if (image) formData.append("image", image);

      await api.post("/hubs/create_hub/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Hub created successfully!");
      navigate("/hubs/list");
    } catch (err) {
      console.error("Failed to create hub:", err);
      alert("Failed to create hub. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-semibold text-[#432dd7] mb-6">Create New Hub</h2>

      <form onSubmit={handleCreateHub} className="space-y-4">
        {/* Hub Name */}
        <label className="block">
          <span className="text-gray-700 font-medium">Hub Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
          />
        </label>

        {/* Description */}
        <label className="block">
          <span className="text-gray-700 font-medium">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
          />
        </label>

        {/* Admin */}
        <label className="block">
          <span className="text-gray-700 font-medium">Admin</span>
          <select
            required
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
          >
            <option value="">Select Admin</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </label>

        {/* Image Upload */}
        <label className="block">
          <span className="text-gray-700 font-medium">Hub Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="mt-1 block w-full text-gray-700"
          />
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-[#432dd7] text-white px-4 py-2 hover:bg-[#3725b8] transition"
        >
          {loading ? "Creating..." : "Create Hub"}
        </button>
      </form>
    </div>
  );
}
