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
  <div style={{ marginLeft: msg.parent_id ? 20 : 0, marginBottom: 10 }}>
    <strong>{msg.sender}</strong>: {msg.content}

    {msg.media_url && (
      <div style={{ marginTop: 4 }}>
        {isImage(msg.media_url) ? (
          <img src={msg.media_url} style={{ maxWidth: 200 }} />
        ) : (
          <a href={msg.media_url} target="_blank" rel="noreferrer">
            📎 View file
          </a>
        )}
      </div>
    )}

    <div style={{ fontSize: 12 }}>
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
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const token = localStorage.getItem("access");

  /* 🔥 LOAD EXISTING MESSAGES */
  useEffect(() => {
    if (!hubId) return;

    api.get(`/messages/?hub=${hubId}`).then((res) => {
      setMessages(res.data);
    });
  }, [hubId]);

  /* ⚡ WEBSOCKET */
useEffect(() => {
  if (!hubId || !token) return;

  // ⛔ prevent duplicate sockets (StrictMode safe)
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

  ws.onopen = () => {
    console.log("✅ WS connected");
    setConnected(true);
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "chat_message") {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    }
  };

  ws.onerror = (e) => {
    console.error("WS error", e);
  };

  ws.onclose = () => {
    console.log("❌ WS closed");
    setConnected(false);
    socketRef.current = null;
  };

  // ⚠️ IMPORTANT: do NOT close immediately in StrictMode
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, [hubId, token]);


const sendMessage = async () => {
  // 🧱 guard
  if (!text.trim() && !file) return;

  /* ---------- MEDIA MESSAGE (REST) ---------- */
  if (file) {
    const tempId = Date.now(); // optimistic id

    // 👀 optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "You",
        content: text,
        media_url: URL.createObjectURL(file),
        parent_id: replyTo,
        replies: [],
        timestamp: new Date().toISOString(),
      },
    ]);

    const form = new FormData();
    form.append("hub", hubId);
    form.append("content", text);
    form.append("media", file);
    if (replyTo) form.append("parent", replyTo);

    await api.post("/messages/", form);

    setFile(null);
    setText("");
    setReplyTo(null);
    return;
  }

  /* ---------- TEXT MESSAGE (WS) ---------- */
  if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
    console.warn("Socket not ready");
    return;
  }

  const tempId = Date.now(); // optimistic id

  // 👀 optimistic UI
  setMessages((prev) => [
    ...prev,
    {
      id: tempId,
      sender: "You",
      content: text,
      media_url: null,
      parent_id: replyTo,
      replies: [],
      timestamp: new Date().toISOString(),
    },
  ]);

  socketRef.current.send(
    JSON.stringify({
      content: text,
      parent: replyTo,
    })
  );

  setText("");
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
        <div style={{ fontSize: 12 }}>
          Replying to message #{replyTo}
          <button onClick={() => setReplyTo(null)}>✕</button>
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message"
      />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

<button disabled={!connected} onClick={sendMessage}>
  {connected ? "Send" : "Connecting..."}
</button>

    </div>
  );
}
