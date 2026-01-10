import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

/* ---------- helpers ---------- */
const isImage = (url) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");

const buildTree = (messages) => {
  const map = {};
  const roots = [];

  messages.forEach((m) => {
    map[m.id] = { ...m, replies: [] };
  });

  messages.forEach((m) => {
    if (m.parent_id && map[m.parent_id]) {
      map[m.parent_id].replies.push(map[m.id]);
    } else {
      roots.push(map[m.id]);
    }
  });

  return roots;
};

const MessageItem = ({ msg, onReply }) => (
  <div
    style={{
      marginLeft: msg.parent_id ? 24 : 0,
      marginBottom: 12,
      paddingLeft: msg.parent_id ? 8 : 0,
      borderLeft: msg.parent_id ? "2px solid #eee" : "none",
    }}
  >
    <strong>{msg.sender}</strong>: {msg.content}

    {msg.media_url && (
      <div style={{ marginTop: 6 }}>
        {isImage(msg.media_url) ? (
          <img src={msg.media_url} style={{ maxWidth: 200 }} />
        ) : (
          <a href={msg.media_url} target="_blank" rel="noreferrer">
            📎 View file
          </a>
        )}
      </div>
    )}

    <div style={{ fontSize: 12, marginTop: 4 }}>
      <button onClick={() => onReply(msg.id)}>Reply</button>
    </div>

    {msg.replies.map((r) => (
      <MessageItem key={r.id} msg={r} onReply={onReply} />
    ))}
  </div>
);

/* ---------- component ---------- */
export default function HubChat({ hubId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const socketRef = useRef(null);
  const token = localStorage.getItem("access");

  /* 🔥 LOAD EXISTING MESSAGES */
  useEffect(() => {
    if (!hubId) return;

    api.get(`/messages/?hub=${hubId}`).then((res) => {
      setMessages(res.data);
    });
  }, [hubId]);

  /* ⚡ WEBSOCKET (receive only) */
  useEffect(() => {
    if (!hubId || !token) return;

    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/hub/${hubId}/?token=${token}`
    );

    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "chat_message") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [hubId, token]);

  /* 🚀 SEND MESSAGE (REST authoritative) */
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    const tempId = Date.now();

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "You",
        content: text,
        media_url: file ? URL.createObjectURL(file) : null,
        parent_id: replyTo,
        timestamp: new Date().toISOString(),
      },
    ]);

    const form = new FormData();
    form.append("hub", hubId);
    if (text) form.append("content", text);
    if (file) form.append("media", file);
    if (replyTo) form.append("parent", replyTo);

    await api.post("/messages/", form);

    setText("");
    setFile(null);
    setReplyTo(null);
  };

  const threaded = buildTree(messages);

  return (
    <div>
      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 8,
        }}
      >
        {threaded.map((m) => (
          <MessageItem key={m.id} msg={m} onReply={setReplyTo} />
        ))}
      </div>

      {replyTo && (
        <div style={{ fontSize: 12, marginTop: 6 }}>
          Replying to message #{replyTo}
          <button onClick={() => setReplyTo(null)}> ✕</button>
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message"
        style={{ width: "100%", marginTop: 8 }}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginTop: 6 }}
      />

      <button onClick={sendMessage} style={{ marginTop: 6 }}>
        Send
      </button>
    </div>
  );
}
