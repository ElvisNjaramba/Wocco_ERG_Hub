import { useState } from "react";
import api from "../api/axios";



export default function CreateUserForm() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);

  const submit = async () => {
    const res = await api.post("/users/create/", form);
    setResult(res.data);
  };

  return (
    <div className="card">
      <h3>Create User</h3>

      <div className="form-grid">
        <input
          placeholder="First Name"
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <input
          placeholder="Last Name"
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <button style={{ marginTop: "1rem" }} onClick={submit}>
        Create
      </button>

      {result && (
        <div className="result-box">
          <p><strong>Username:</strong> {result.username}</p>
          <p><strong>Password:</strong> {result.password}</p>
        </div>
      )}
    </div>
  );
}

