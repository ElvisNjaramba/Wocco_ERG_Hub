import { useState } from "react";
import api from "../api/axios";

export default function SuperUserRegister() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const register = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/register/", form);

    alert(
      `Superuser created!\n\nUsername: ${res.data.username}\nPassword: ${res.data.password}`
    );
  };

  return (
    <form onSubmit={register}>
      <h2>Register Superuser</h2>

      <input
        required
        placeholder="First Name"
        onChange={(e) =>
          setForm({ ...form, first_name: e.target.value })
        }
      />

      <input
        required
        placeholder="Last Name"
        onChange={(e) =>
          setForm({ ...form, last_name: e.target.value })
        }
      />

      <input
        required
        type="email"
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <button type="submit">Register</button>
    </form>
  );
}


