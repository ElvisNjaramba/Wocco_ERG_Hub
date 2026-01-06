import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/profile/me/");
      setProfile(res.data);
      setPhone(res.data.phone || "");
    };
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    const formData = new FormData();
    if (phone) formData.append("phone", phone);
    if (avatar) formData.append("avatar", avatar);

    const res = await api.patch("/profile/update_profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setProfile((prev) => ({ ...prev, ...res.data }));
    alert("Profile updated successfully");
  };

  return (
    <div>
      <h2>My Profile</h2>

      {/* Read-only fields */}
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>First Name:</strong> {profile.first_name}</p>
      <p><strong>Last Name:</strong> {profile.last_name}</p>
      <p><strong>Email:</strong> {profile.email}</p>

      {/* Editable fields */}
      <input
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files[0])}
      />

      {profile.avatar && (
        <div>
          <p>Current Avatar:</p>
          <img
            src={`http://127.0.0.1:8000${profile.avatar}`}
            alt="avatar"
            width={100}
          />
        </div>
      )}

      <button onClick={updateProfile}>Save</button>
    </div>
  );
}
