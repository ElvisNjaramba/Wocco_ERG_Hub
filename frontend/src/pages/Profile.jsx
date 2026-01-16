import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/profile/me/");
      setProfile(res.data);
      setPhone(res.data.phone || "");
    };
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    setLoading(true);
    const formData = new FormData();

    if (phone) formData.append("phone", phone);
    if (avatar) formData.append("avatar", avatar);

    try {
      const res = await api.patch(
        "/profile/update_profile/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProfile((prev) => ({ ...prev, ...res.data }));
      alert("Profile updated successfully");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ---------- HEADER ---------- */}
      <h2 className="text-3xl font-bold text-[#432dd7] mb-6">
        My Profile
      </h2>

      {/* ---------- CARD ---------- */}
      <div className="bg-white dark:bg-[#111029] rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        
        {/* ---------- BASIC INFO ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Username" value={profile.username} />
          <Info label="Email" value={profile.email} />
          <Info label="First Name" value={profile.first_name} />
          <Info label="Last Name" value={profile.last_name} />
        </div>

        {/* ---------- AVATAR ---------- */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Profile Picture
            </p>

            {profile.avatar ? (
              <img
                src={`http://127.0.0.1:8000${profile.avatar}`}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-[#432dd7]"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#432dd7]/10 flex items-center justify-center text-[#432dd7] font-bold">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Change Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="block w-full text-sm
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-[#432dd7] file:text-white
                hover:file:bg-[#3a27c0]
                transition"
            />
          </div>
        </div>

        {/* ---------- EDITABLE FIELDS ---------- */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full px-4 py-3 rounded-lg
              border border-gray-300 dark:border-gray-700
              bg-gray-50 dark:bg-[#1a1a3a]
              focus:ring-2 focus:ring-[#432dd7]
              transition"
          />
        </div>

        {/* ---------- ACTION ---------- */}
        <div className="flex justify-end">
          <button
            onClick={updateProfile}
            disabled={loading}
            className="
              px-6 py-3 rounded-lg
              bg-[#432dd7] text-white font-semibold
              hover:bg-[#3a27c0]
              disabled:opacity-60
              transition
            "
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- INFO COMPONENT ---------- */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {value || "—"}
      </p>
    </div>
  );
}
