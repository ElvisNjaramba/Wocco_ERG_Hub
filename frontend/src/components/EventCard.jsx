import api from "../api/axios"
import { useEffect, useState } from "react"

export default function EventCard({ event }) {
  const [attending, setAttending] = useState(event.user_attending)
  const [count, setCount] = useState(event.attendees_count)

useEffect(() => {
  const handler = (e) => {
    if (e.detail.event_id !== event.id) return

    setCount(c =>
      e.detail.action === "attending" ? c + 1 : Math.max(0, c - 1)
    )
  }

  window.addEventListener("event-update", handler)
  return () => window.removeEventListener("event-update", handler)
}, [event.id])



const attend = async () => {
  const res = await api.post(`/events/${event.id}/attend/`)
  setAttending(res.data.attending)
  setCount(res.data.attendees_count)
}

const unattend = async () => {
  const res = await api.post(`/events/${event.id}/unattend/`)
  setAttending(false)
  setCount(res.data.attendees_count)
}


  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>👥 {count} attending</p>

      {attending ? (
        <button onClick={unattend}>Cancel</button>
      ) : (
        <button onClick={attend}>Attend</button>
      )}
    </div>
  )
}
