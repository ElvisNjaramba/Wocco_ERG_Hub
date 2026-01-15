import { useEffect, useState } from "react"
import api from "../api/axios"
import EventCreateModal from "./EventCreateModal"

export default function HubEvents({ hubId, hub, user }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  // const user = JSON.parse(localStorage.getItem("user"))


  const fetchEvents = async () => {
    setLoading(true)
    const res = await api.get(`/events/?hub=${hubId}`)
    setEvents(res.data)
    setLoading(false)
  }

  useEffect(() => {
    if (hubId) fetchEvents()
  }, [hubId])

  const attend = async (eventId) => {
    await api.post(`/events/${eventId}/attend/`)
    fetchEvents()
  }

  const unattend = async (eventId) => {
    await api.post(`/events/${eventId}/unattend/`)
    fetchEvents()
  }

  const isAdmin = user && hub && user.username === hub.admin;

  if (loading) return <p>Loading events…</p>

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Events</h2>


{isAdmin && (
  <button onClick={() => setShowCreate(true)}>
    Create Event
  </button>
)}

      </div>

      {/* ✅ MODAL RENDER */}
      {showCreate && (
        <EventCreateModal
          hubId={hubId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchEvents}
        />
      )}

      {events.length === 0 && <p>No events yet.</p>}

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <h3>{event.title}</h3>
          <p>{event.description}</p>

          <p>
            🕒 {new Date(event.start_time).toLocaleString()} –{" "}
            {new Date(event.end_time).toLocaleString()}
          </p>

          <strong>{event.attendees_count} attending</strong>

          <div style={{ marginTop: 10 }}>
            {event.user_attending ? (
              <button onClick={() => unattend(event.id)}>
                Cancel Attendance
              </button>
            ) : (
              <button onClick={() => attend(event.id)}>
                Attend
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
