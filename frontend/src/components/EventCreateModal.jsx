import { useState } from "react"
import api from "../api/axios"

export default function EventCreateModal({ hubId, onClose, onCreated }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [location, setLocation] = useState("")

  const submit = async () => {
    // Remove "hub" from the request body—it's handled server-side
    await api.post(`/events/?hub=${hubId}`, {
      title,
      description,
      location,
      start_time: `${start}:00`,
      end_time: end ? `${end}:00` : null,
    })

    onCreated()
    onClose()
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Create Event</h3>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />

        <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
        <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />

        <div style={{ marginTop: 10 }}>
          <button onClick={submit}>Create</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 320,
}