import { useEffect, useState } from "react"
import api from "../api/axios"
import "../assets/adminTables.css"

export function HubsTable() {
  const [hubs, setHubs] = useState([])

  useEffect(() => {
    api.get("/users/hubs/").then(res => setHubs(res.data))
  }, [])

  return (
    <section className="admin-section">
      <h2>Hubs</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Admin</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {hubs.map(h => (
            <tr key={h.id}>
              <td>{h.name}</td>
              <td>{h.admin}</td>
              <td>{new Date(h.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

