import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { messageTemplates } from "../components/MessageTemplates";

/* ---------- helpers ---------- */
const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");

const buildMessageMap = (messages) => {
  const map = {};
  messages.forEach((m) => {
    map[m.id] = m;
  });
  return map;
};

/* ---------- message item ---------- */
// const MessageItem = ({ msg, onReply, parent, template = "bubble" }) => {
//   const TemplateComponent =
//     messageTemplates[template]?.component || (({ item }) => <div>{item.text}</div>);

//   const itemData = {
//     text: msg.content,
//     author: {
//       id: msg.sender_id,
//       name: msg.sender,
//       avatarUrl: msg.avatar_url || "https://via.placeholder.com/32",
//     },
//     timestamp: new Date(msg.created_at),
//     media_url: msg.media_url,
//   };

//   return (
//     <div style={{ marginBottom: 14 }}>
//       <div
//         style={{
//           borderRadius: 12,
//           border: "1px solid #e5e7eb",
//           boxShadow: "0 1px 3px rgba(0,0,0,.06)",
//           background: "#ffffff",
//           padding: 8,
//         }}
//       >
//         {/* Quoted parent */}
//         {parent && (
//           <div
//             style={{
//               padding: 8,
//               marginBottom: 6,
//               borderRadius: 8,
//               background: "#f1f5ff",
//               border: "1px solid #6366f1",
//               fontSize: 12,
//               fontWeight: 500,
//               color: "#3730a3",
//             }}
//           >
//             <strong>{parent.sender}</strong>: {parent.content?.slice(0, 120)}
//           </div>
//         )}

//         {/* Actual message content */}
//         <TemplateComponent item={itemData} />

//         {msg.media_url && (
//           <div style={{ marginTop: 6 }}>
//             {isImage(msg.media_url) ? (
//               <img src={msg.media_url} alt="" style={{ maxWidth: 220, borderRadius: 8 }} />
//             ) : (
//               <a
//                 href={msg.media_url}
//                 target="_blank"
//                 rel="noreferrer"
//                 style={{ color: "#6366f1", fontSize: 13 }}
//               >
//                 📎 View file
//               </a>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Reply button */}
//       <div style={{ marginTop: 6 }}>
//         <button
//           onClick={() => onReply(msg)}
//           style={{
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//             color: "#6366f1",
//             fontSize: 12,
//           }}
//         >
//           Reply
//         </button>
//       </div>
//     </div>
//   );
// };

const MessageItem = ({ msg, onReply, parent, template = "bubble", messageMap }) => {
  const TemplateComponent =
    messageTemplates[template]?.component || (({ item }) => <div>{item.text}</div>);

  const itemData = {
    text: msg.content,
    author: {
      id: msg.sender_id,
      name: msg.sender,
      avatarUrl: msg.avatar_url || "https://via.placeholder.com/32",
    },
    timestamp: new Date(msg.created_at),
    media_url: msg.media_url,
  };

  const ref = useRef(null);

  // Save ref in map for jumping
  useEffect(() => {
    messageMap[msg.id]._ref = ref;
  }, [msg.id, messageMap]);

  const handleQuotedClick = () => {
    if (parent && messageMap[parent.id]?._ref?.current) {
      const el = messageMap[parent.id]._ref.current;
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Optional: temporary highlight
      el.style.transition = "background 0.5s";
      const original = el.style.background;
      el.style.background = "#fde68a"; // yellow highlight
      setTimeout(() => {
        el.style.background = original || "#ffffff";
      }, 1000);
    }
  };

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div
        style={{
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          background: "#ffffff",
          padding: 8,
        }}
      >
        {/* Quoted parent */}
        {parent && (
          <div
            onClick={handleQuotedClick}
            style={{
              padding: 8,
              marginBottom: 6,
              borderRadius: 8,
              background: "#f1f5ff",
              border: "1px solid #6366f1",
              fontSize: 12,
              fontWeight: 500,
              color: "#3730a3",
              cursor: "pointer",
            }}
          >
            <strong>{parent.sender}</strong>: {parent.content?.slice(0, 120)}
          </div>
        )}

        {/* Actual message content */}
        <TemplateComponent item={itemData} />

        {msg.media_url && (
          <div style={{ marginTop: 6 }}>
            {isImage(msg.media_url) ? (
              <img src={msg.media_url} alt="" style={{ maxWidth: 220, borderRadius: 8 }} />
            ) : (
              <a
                href={msg.media_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#6366f1", fontSize: 13 }}
              >
                📎 View file
              </a>
            )}
          </div>
        )}
      </div>

      {/* Reply button */}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => onReply(msg)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6366f1",
            fontSize: 12,
          }}
        >
          Reply
        </button>
      </div>
    </div>
  );
};


/* ---------- main HubChat ---------- */
export default function HubChat({ template = "bubble" }) {
  const { hubId } = useParams();
  const numericHubId = Number(hubId);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const socketRef = useRef(null);
  const token = localStorage.getItem("access");

  if (!numericHubId || Number.isNaN(numericHubId)) {
    return <div>Invalid hub</div>;
  }

  /* load messages */
  useEffect(() => {
    api.get(`/messages/?hub=${numericHubId}`).then((res) => {
      setMessages(res.data);
    });
  }, [numericHubId]);

  /* websocket */
  useEffect(() => {
    if (!hubId || !token) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/hub/${numericHubId}/?token=${token}`
    );
    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat_message") {
        setMessages((prev) =>
          prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
        );
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [hubId, token, numericHubId]);

  /* send message */
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    const form = new FormData();
    form.append("hub", numericHubId.toString());
    if (text) form.append("content", text);
    if (file) form.append("media", file);
    if (replyTo?.id) form.append("parent", replyTo.id.toString());

    await api.post("/messages/", form);

    setText("");
    setFile(null);
    setReplyTo(null);
  };

  // Build parent map for quoted messages
  const messageMap = buildMessageMap(messages);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* messages container */}
      <div
        style={{
          height: 420,
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          background: "#f9fafb",
        }}
      >
{messages.map((msg) => (
  <MessageItem
    key={msg.id}
    msg={msg}
    parent={msg.parent_id ? messageMap[msg.parent_id] : null}
    onReply={setReplyTo}
    template={template}
    messageMap={messageMap} // 🔥 Pass the map for scroll
  />
))}

      </div>

      {/* reply box */}
      {replyTo && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "#f1f5ff",
            borderRadius: 12,
            border: "2px solid #6366f1",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          Replying to <strong>{replyTo.sender}</strong>: {replyTo.content}
          <button
            onClick={() => setReplyTo(null)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* message input */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginTop: 6 }}
      />

      <button
        onClick={sendMessage}
        style={{
          marginTop: 8,
          padding: "8px 14px",
          borderRadius: 8,
          background: "#6366f1",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}
