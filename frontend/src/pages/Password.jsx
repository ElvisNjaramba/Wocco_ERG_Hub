export function ChangePassword() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");

  const changePassword = async () => {
    await api.post("/profile/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });

    alert("Password changed. Please login again.");
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div>
      <h3>Change Password</h3>

      <input
        type="password"
        placeholder="Old password"
        onChange={(e) => setOld(e.target.value)}
      />

      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setNew(e.target.value)}
      />

      <button onClick={changePassword}>Update Password</button>
    </div>
  );
}
