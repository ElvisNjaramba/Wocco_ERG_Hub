import { useEffect, useState } from "react"
import api from "../api/axios"
import "../assets/adminTables.css"

export function EventsTable() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get("/users/events/").then(res => setEvents(res.data))
  }, [])

  return (
    <section className="admin-section">
      <h2>Events</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Hub</th>
            <th>Created By</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.hub}</td>
              <td>{e.created_by}</td>
              <td>{new Date(e.start_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

