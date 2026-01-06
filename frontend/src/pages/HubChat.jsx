import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function HubChat({ hubId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [audio, setAudio] = useState(null);
  const ws = useRef(null);

  // Fetch existing messages
  const fetchMessages = async () => {
    const res = await api.get(`/messages/?hub=${hubId}`);
    setMessages(res.data);
  };

  useEffect(() => {
    fetchMessages();

    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/hub/${hubId}/`);

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => ws.current.close();
  }, [hubId]);

  const sendMessage = async () => {
    // 1️⃣ Upload media/audio via REST first
    const formData = new FormData();
    if (text) formData.append("content", text);
    if (media) formData.append("media", media);
    if (audio) formData.append("audio", audio);
    formData.append("hub", hubId);

    const res = await api.post("/messages/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 2️⃣ Send text notification via WebSocket
    ws.current.send(JSON.stringify({
      user: user.username,
      message: text || (media && "Media") || (audio && "Audio")
    }));

    setText("");
    setMedia(null);
    setAudio(null);
  };

  return (
    <div>
      <h3>Hub Chat</h3>
      <div style={{ maxHeight: 400, overflowY: "scroll", border: "1px solid gray", padding: 5 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.user}:</strong> {m.message}
            {m.media && <a href={m.media} target="_blank">[Media]</a>}
            {m.audio && <audio controls src={m.audio} />}
          </div>
        ))}
      </div>

      <input
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => setMedia(e.target.files[0])} />
      <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
