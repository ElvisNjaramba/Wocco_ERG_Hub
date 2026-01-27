// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// /* ---------- helpers ---------- */
// const isImage = (url) =>
//   /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");

// const buildTree = (messages) => {
//   const map = {};
//   const roots = [];

//   messages.forEach((m) => {
//     map[m.id] = { ...m, replies: [] };
//   });

//   messages.forEach((m) => {
//     if (m.parent_id && map[m.parent_id]) {
//       map[m.parent_id].replies.push(map[m.id]);
//     } else {
//       roots.push(map[m.id]);
//     }
//   });

//   return { roots, map };
// };

// /* ---------- message ---------- */
// const MessageItem = ({ msg, onReply, messageMap }) => {
//   const parent = msg.parent_id ? messageMap[msg.parent_id] : null;
//   const isReply = Boolean(parent);
//   const ref = useRef(null);

//   useEffect(() => {
//     messageMap[msg.id]._ref = ref;
//   }, [msg.id, messageMap]);

//   return (
//     <div
//       ref={ref}
//       style={{
//         marginLeft: isReply ? 32 : 0,
//         marginBottom: 12,
//         paddingLeft: isReply ? 12 : 0,
//         borderLeft: isReply ? "2px solid #e5e7eb" : "none",
//       }}
//     >
//       <div
//         style={{
//           background: "#f9fafb",
//           borderRadius: 10,
//           padding: "10px 12px",
//           border: isReply ? "2px solid #6366f1" : "1px solid #e5e7eb",
//           boxShadow: "0 1px 2px rgba(0,0,0,.05)",
//         }}
//       >
//         {/* 🔗 quoted parent */}
//         {parent && (
//           <div
//             onClick={() =>
//               messageMap[parent.id]?._ref?.current?.scrollIntoView({
//                 behavior: "smooth",
//                 block: "center",
//               })
//             }
//             style={{
//               fontSize: 12,
//               padding: "6px 8px",
//               marginBottom: 8,
//               borderLeft: "4px solid #6366f1",
//               background: "#eef2ff",
//               borderRadius: 6,
//               cursor: "pointer",
//               color: "#3730a3",
//             }}
//           >
//             <strong>{parent.sender}</strong>:{" "}
//             {parent.content?.slice(0, 120)}
//           </div>
//         )}

//         <div style={{ fontSize: 13, fontWeight: 600 }}>
//           {msg.sender}
//         </div>

//         <div style={{ fontSize: 14, marginTop: 2 }}>
//           {msg.content}
//         </div>

//         {msg.media_url && (
//           <div style={{ marginTop: 6 }}>
//             {isImage(msg.media_url) ? (
//               <img
//                 src={msg.media_url}
//                 style={{ maxWidth: 220, borderRadius: 6 }}
//               />
//             ) : (
//               <a href={msg.media_url} target="_blank" rel="noreferrer">
//                 📎 View file
//               </a>
//             )}
//           </div>
//         )}

//         <div style={{ marginTop: 6, fontSize: 11 }}>
//           <button
//             onClick={() => onReply(msg)}
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               color: "#6366f1",
//             }}
//           >
//             Reply
//           </button>
//         </div>
//       </div>

//       {msg.replies.map((r) => (
//         <MessageItem
//           key={r.id}
//           msg={r}
//           onReply={onReply}
//           messageMap={messageMap}
//         />
//       ))}
//     </div>
//   );
// };

// /* ---------- main ---------- */
// export default function HubChat() {
//   const { hubId } = useParams();
//   const numericHubId = Number(hubId);

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [file, setFile] = useState(null);
//   const [replyTo, setReplyTo] = useState(null);
//   const socketRef = useRef(null);
//   const token = localStorage.getItem("access");

//   if (!numericHubId || Number.isNaN(numericHubId)) {
//     return <div>Invalid hub</div>;
//   }

//   /* load messages */
// useEffect(() => {
//   api.get(`/messages/?hub=${numericHubId}`).then((res) => {
//     setMessages(res.data);
//   });
// }, [numericHubId]);

//   /* websocket */
// useEffect(() => {
//   if (!hubId || !token) return;

//   let ws;

//   try {
// ws = new WebSocket(
//   `ws://127.0.0.1:8000/ws/hub/${numericHubId}/?token=${token}`
// );
//     socketRef.current = ws;

//     ws.onopen = () => console.log("WebSocket connected");

//     ws.onmessage = (e) => {
//       const data = JSON.parse(e.data);

//       if (data.type === "chat_message") {
//         setMessages((prev) =>
//           prev.some((m) => m.id === data.message.id)
//             ? prev
//             : [...prev, data.message]
//         );
//       }

//       if (data.type === "event_update") {
//         window.dispatchEvent(
//           new CustomEvent("event-update", { detail: data.event })
//         );
//       }

//       if (data.type === "event_notification") {
//         window.dispatchEvent(
//           new CustomEvent("event-notification", { detail: data.event })
//         );
//       }
//     };

//     ws.onerror = (e) => console.warn("WS error", e);

//     ws.onclose = (e) => console.log("WS closed", e.code, e.reason);
//   } catch (err) {
//     console.error("WebSocket failed", err);
//   }

//   return () => {
//     if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
//       ws.close();
//     }
//   };
// }, [hubId, token]);

//   /* send */
// const sendMessage = async () => {
// if (!numericHubId) {
//   console.error("Invalid hubId:", numericHubId);
//   return;
// }


//   if (!text.trim() && !file) return;

//   const form = new FormData();
// form.append("hub", numericHubId.toString());
//   if (text) form.append("content", text);
//   if (file) form.append("media", file);

//   if (replyTo?.id && typeof replyTo.id === "number") {
//     form.append("parent", replyTo.id.toString());
//   }

//   console.log("FINAL SEND:", [...form.entries()]); // 👈 KEEP THIS

//   await api.post("/messages/", form);

//   setText("");
//   setFile(null);
//   setReplyTo(null);
// };


//   const { roots, map } = buildTree(messages);

//   return (
//     <div style={{ maxWidth: 720 }}>
//       <div
//         style={{
//           height: 420,
//           overflowY: "auto",
//           border: "1px solid #e5e7eb",
//           borderRadius: 8,
//           padding: 12,
//         }}
//       >
//         {roots.map((m) => (
//           <MessageItem
//             key={m.id}
//             msg={m}
//             onReply={setReplyTo}
//             messageMap={map}
//           />
//         ))}
//       </div>

//       {replyTo && (
//         <div
//           style={{
//             marginTop: 8,
//             padding: "6px 10px",
//             background: "#eef2ff",
//             borderLeft: "4px solid #6366f1",
//             borderRadius: 6,
//             fontSize: 12,
//           }}
//         >
//           Replying to <strong>{replyTo.sender}</strong>:{" "}
//           {replyTo.content}
//           <button
//             onClick={() => setReplyTo(null)}
//             style={{
//               float: "right",
//               border: "none",
//               background: "none",
//               cursor: "pointer",
//             }}
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       <input
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Type message…"
//         style={{
//           width: "100%",
//           marginTop: 8,
//           padding: 8,
//           borderRadius: 6,
//           border: "1px solid #e5e7eb",
//         }}
//       />

//       <input
//         type="file"
//         onChange={(e) => setFile(e.target.files[0])}
//         style={{ marginTop: 6 }}
//       />

//       <button
//         onClick={sendMessage}
//         style={{
//           marginTop: 8,
//           padding: "6px 12px",
//           borderRadius: 6,
//           background: "#6366f1",
//           color: "#fff",
//           border: "none",
//           cursor: "pointer",
//         }}
//       >
//         Send
//       </button>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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

  return { roots, map };
};

/* ---------- message ---------- */
const MessageItem = ({
  msg,
  onReply,
  messageMap,
  highlightedId,
  setHighlightedId,
}) => {
  const parent = msg.parent_id ? messageMap[msg.parent_id] : null;
  const isReply = Boolean(parent);
  const isHighlighted = msg.id === highlightedId;
  const ref = useRef(null);

  useEffect(() => {
    messageMap[msg.id]._ref = ref;
  }, [msg.id, messageMap]);

  useEffect(() => {
    if (isHighlighted) {
      const t = setTimeout(() => setHighlightedId(null), 1500);
      return () => clearTimeout(t);
    }
  }, [isHighlighted, setHighlightedId]);

  return (
    <div
      ref={ref}
      style={{
        marginLeft: isReply ? 28 : 0,
        marginBottom: 14,
        paddingLeft: isReply ? 12 : 0,
        borderLeft: isReply ? "2px solid #e5e7eb" : "none",
      }}
    >
      <div
        style={{
          background: isHighlighted ? "#eef2ff" : "#ffffff",
          borderRadius: 12,
          padding: "10px 14px",
          border: isHighlighted
            ? "2px solid #6366f1"
            : "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
          transition: "all 0.3s ease",
        }}
      >
        {/* quoted parent */}
        {parent && (
          <div
            onClick={() => {
              setHighlightedId(parent.id);
              messageMap[parent.id]?._ref?.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              marginBottom: 8,
              borderLeft: "4px solid #6366f1",
              background: "#f1f5ff",
              borderRadius: 8,
              cursor: "pointer",
              color: "#3730a3",
            }}
          >
            <strong>{parent.sender}</strong>:{" "}
            {parent.content?.slice(0, 120)}
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {msg.sender}
        </div>

        <div style={{ fontSize: 14, marginTop: 2 }}>
          {msg.content}
        </div>

        {msg.media_url && (
          <div style={{ marginTop: 6 }}>
            {isImage(msg.media_url) ? (
              <img
                src={msg.media_url}
                alt=""
                style={{ maxWidth: 220, borderRadius: 8 }}
              />
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

      {msg.replies.map((r) => (
        <MessageItem
          key={r.id}
          msg={r}
          onReply={onReply}
          messageMap={messageMap}
          highlightedId={highlightedId}
          setHighlightedId={setHighlightedId}
        />
      ))}
    </div>
  );
};

/* ---------- main ---------- */
export default function HubChat() {
  const { hubId } = useParams();
  const numericHubId = Number(hubId);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

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

    let ws;

    ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/hub/${numericHubId}/?token=${token}`
    );

    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "chat_message") {
        setMessages((prev) =>
          prev.some((m) => m.id === data.message.id)
            ? prev
            : [...prev, data.message]
        );
      }
    };

    return () => {
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close();
      }
    };
  }, [hubId, token]);

  /* send */
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    const form = new FormData();
    form.append("hub", numericHubId.toString());
    if (text) form.append("content", text);
    if (file) form.append("media", file);
    if (replyTo?.id) form.append("parent", replyTo.id.toString());

    await api.post("/messages/", form);

    if (replyTo?.id) {
      setHighlightedId(replyTo.id);
    }

    setText("");
    setFile(null);
    setReplyTo(null);
  };

  const { roots, map } = buildTree(messages);

  return (
    <div style={{ maxWidth: 720 }}>
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
        {roots.map((m) => (
          <MessageItem
            key={m.id}
            msg={m}
            onReply={setReplyTo}
            messageMap={map}
            highlightedId={highlightedId}
            setHighlightedId={setHighlightedId}
          />
        ))}
      </div>

      {replyTo && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#f1f5ff",
            borderLeft: "4px solid #6366f1",
            borderRadius: 10,
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Replying to <strong>{replyTo.sender}</strong>:{" "}
          {replyTo.content}
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
