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
    <div>
      <h3>Create User</h3>
      <input placeholder="First Name" onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
      <input placeholder="Last Name" onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <button onClick={submit}>Create</button>

      {result && (
        <div>
          <p>Username: {result.username}</p>
          <p>Password: {result.password}</p>
        </div>
      )}
    </div>
  );
}
