import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { messageTemplates } from "../components/MessageTemplates";
import EmojiPicker from "../components/EmojiPicker";
import {
  Send,
  Paperclip,
  X,
  Reply,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Smile,
  Users,
  CheckCircle,
  User,
  Maximize2,
  Minimize2,
  Edit2,
  Trash2,
  Hash,
  Circle,
} from "lucide-react";

/* ---------- helpers ---------- */
const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url || "");

/* ---------- Avatar ---------- */
const Avatar = ({ user, size = "md" }) => {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  const initials = user?.username?.slice(0, 2).toUpperCase() || "?";
  // stable color based on username
  const colors = [
    "bg-rose-500", "bg-orange-500", "bg-amber-500",
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500",
    "bg-blue-500", "bg-violet-500", "bg-pink-500",
  ];
  const idx = (user?.username || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return (
    <div className={`${sz} ${colors[idx]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden ring-2 ring-white/10`}>
      {user?.avatar_url
        ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        : initials}
    </div>
  );
};

/* ---------- MessageItem ---------- */
const MessageItem = ({ msg, onReply, onEdit, onDelete, parent, messageMap }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (messageMap && messageMap[msg.id]) messageMap[msg.id]._ref = ref;
  }, [msg.id, messageMap]);

  const handleQuotedClick = () => {
    const el = messageMap[parent?.id]?._ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.transition = "background 0.3s";
    el.style.background = "rgba(99,102,241,0.15)";
    setTimeout(() => { el.style.background = ""; }, 1600);
  };

  const currentUsername = localStorage.getItem("username");
  const isOwner = msg.sender?.username === currentUsername;
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (msg.is_deleted) {
    return (
      <div ref={ref} className="flex items-start gap-3 px-4 py-2 group">
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-zinc-500" />
        </div>
        <div>
          <span className="text-xs font-semibold text-zinc-400 mr-2">{msg.sender?.username}</span>
          <span className="text-xs text-zinc-600 italic">• {time}</span>
          <div className="mt-1 text-sm text-zinc-600 italic bg-zinc-800/50 px-3 py-1.5 rounded-lg w-fit border border-zinc-700/50">
            🗑 This message was deleted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="group flex items-start gap-3 px-4 py-2 hover:bg-zinc-800/40 rounded-lg transition-colors duration-150 relative"
    >
      {/* Avatar */}
      <div className="mt-0.5">
        <Avatar user={msg.sender} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm text-zinc-100">{msg.sender?.username}</span>
          <span className="text-[11px] text-zinc-500">{time}</span>
          {msg.is_edited && <span className="text-[11px] text-zinc-600 italic">(edited)</span>}
        </div>

        {/* Quoted parent */}
        {parent && (
          <div
            onClick={handleQuotedClick}
            className="mb-2 flex items-start gap-2 pl-3 border-l-2 border-indigo-500/60 cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <Reply className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-indigo-400 mr-1">
                {typeof parent.sender === "object" ? parent.sender?.username : parent.sender}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {parent.content?.slice(0, 100)}{parent.content?.length > 100 ? "…" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Text */}
        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
        </p>

        {/* Media */}
        {msg.media_url && (
          <div className="mt-2 rounded-xl overflow-hidden max-w-xs border border-zinc-700">
            {isImage(msg.media_url) ? (
              <img
                src={msg.media_url}
                alt="Attachment"
                className="w-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => window.open(msg.media_url, "_blank")}
              />
            ) : (
              <a
                href={msg.media_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200 truncate max-w-[160px]">
                    {msg.media_url.split("/").pop()}
                  </div>
                  <div className="text-xs text-zinc-500">Click to download</div>
                </div>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-0.5">
        <ActionBtn icon={<Reply className="w-3.5 h-3.5" />} title="Reply" onClick={() => onReply(msg)} />
        {isOwner && (
          <>
            <ActionBtn icon={<Edit2 className="w-3.5 h-3.5" />} title="Edit" onClick={() => onEdit(msg)} color="amber" />
            <ActionBtn icon={<Trash2 className="w-3.5 h-3.5" />} title="Delete" onClick={() => onDelete(msg.id)} color="red" />
          </>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, title, onClick, color }) => {
  const hover = color === "red"
    ? "hover:text-red-400 hover:bg-red-500/10"
    : color === "amber"
    ? "hover:text-amber-400 hover:bg-amber-500/10"
    : "hover:text-indigo-400 hover:bg-indigo-500/10";
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-zinc-400 transition-colors ${hover}`}
    >
      {icon}
    </button>
  );
};

/* ---------- Typing indicator ---------- */
const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers?.length) return null;
  const label = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
    : "Several people are typing";
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-zinc-500">
      <div className="flex gap-1">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
};

/* ---------- main HubChat ---------- */
export default function HubChat() {
  const { hubId } = useParams();
  const numericHubId = Number(hubId);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [fullScreen, setFullScreen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingTimersRef = useRef({});

  const token = localStorage.getItem("access");
  const currentUsername = localStorage.getItem("username");

  const messageMap = useMemo(() => {
    const map = {};
    messages.forEach((m) => { map[m.id] = { ...m }; });
    return map;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll button visibility
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    api.get(`/messages/?hub=${numericHubId}`).then((res) => {
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    });
  }, [numericHubId, scrollToBottom]);

  useEffect(() => {
    if (!hubId || !token) return;
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/hub/${numericHubId}/?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      if (currentUsername) {
        setOnlineUsers((prev) =>
          prev.some((u) => u.username === currentUsername) ? prev : [...prev, { username: currentUsername }]
        );
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "chat_message":
          setMessages((prev) => prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]);
          setTimeout(scrollToBottom, 80);
          break;
        case "message_edit":
          setMessages((prev) => prev.map((m) => (m.id === data.message.id ? data.message : m)));
          break;
        case "message_delete":
          setMessages((prev) => prev.map((m) => m.id === data.message_id ? { ...m, is_deleted: true, content: null } : m));
          break;
        case "typing": {
          const { user: typingUser, is_typing } = data;
          if (typingUser === currentUsername) break;
          setTypingUsers((prev) => is_typing ? (prev.includes(typingUser) ? prev : [...prev, typingUser]) : prev.filter((u) => u !== typingUser));
          if (is_typing) {
            clearTimeout(typingTimersRef.current[typingUser]);
            typingTimersRef.current[typingUser] = setTimeout(() => {
              setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
              delete typingTimersRef.current[typingUser];
            }, 3000);
          } else {
            clearTimeout(typingTimersRef.current[typingUser]);
            delete typingTimersRef.current[typingUser];
          }
          break;
        }
        case "presence":
          setOnlineUsers((prev) => {
            if (!data.user?.username) return prev;
            if (data.action === "online") return prev.some((u) => u.username === data.user.username) ? prev : [...prev, data.user];
            if (data.action === "offline") return prev.filter((u) => u.username !== data.user.username);
            return prev;
          });
          break;
        case "online_users":
          setOnlineUsers(Array.from(new Map((data.users || []).map((u) => [u.username, u])).values()));
          break;
        default: break;
      }
    };

    return () => {
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    };
  }, [hubId, token, numericHubId, currentUsername, scrollToBottom]);

  const handleTyping = useCallback(() => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "typing", is_typing: true }));
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }, 1500);
  }, []);

  const onEdit = useCallback((msg) => {
    setEditingMessage(msg);
    setText(msg.content || "");
    setReplyTo(null);
    textareaRef.current?.focus();
  }, []);

  const cancelEdit = useCallback(() => { setEditingMessage(null); setText(""); }, []);

  const saveEdit = useCallback(async () => {
    if (!editingMessage || !text.trim()) return;
    try {
      await api.patch(`/messages/${editingMessage.id}/edit/`, { content: text });
      setEditingMessage(null);
      setText("");
    } catch (err) { console.error("Edit failed:", err); }
  }, [editingMessage, text]);

  const onDelete = useCallback(async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/messages/${msgId}/delete_message/`);
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, is_deleted: true, content: null } : m));
    } catch (err) { console.error("Delete failed:", err); }
  }, []);

  const sendMessage = useCallback(async () => {
    if (editingMessage) { await saveEdit(); return; }
    if (!text.trim() && !file) return;
    const form = new FormData();
    form.append("hub", numericHubId.toString());
    if (text.trim()) form.append("content", text);
    if (file) form.append("media", file);
    if (replyTo?.id) form.append("parent", replyTo.id.toString());
    const ws = socketRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
      clearTimeout(typingTimeoutRef.current);
    }
    try {
      await api.post("/messages/", form);
      setText(""); setFile(null); setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } catch (err) { console.error("Send failed:", err); }
  }, [editingMessage, saveEdit, text, file, numericHubId, replyTo, scrollToBottom]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === "Escape" && editingMessage) cancelEdit();
  }, [sendMessage, editingMessage, cancelEdit]);

  const insertEmoji = useCallback((emoji) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, en = ta.selectionEnd;
    const next = text.slice(0, s) + emoji + text.slice(en);
    setText(next);
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + emoji.length; });
  }, [text]);

  if (!numericHubId || Number.isNaN(numericHubId)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm">
          <X className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Invalid Hub</h2>
          <p className="text-zinc-500 text-sm mb-5">The hub ID is invalid or not found.</p>
          <button onClick={() => window.history.back()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  /* ── Sub-components ── */

  const ReplyBar = () => replyTo ? (
    <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-0.5 h-8 bg-indigo-500 rounded-full flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-indigo-400">
            Replying to {typeof replyTo.sender === "object" ? replyTo.sender?.username : replyTo.sender}
          </div>
          <div className="text-xs text-zinc-500 truncate max-w-xs">{replyTo.content}</div>
        </div>
      </div>
      <button onClick={() => setReplyTo(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ml-2">
        <X className="w-4 h-4 text-zinc-500" />
      </button>
    </div>
  ) : null;

  const EditBanner = () => editingMessage ? (
    <div className="px-4 py-2.5 border-t border-amber-900/40 bg-amber-900/10 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <Edit2 className="w-4 h-4 text-amber-400" />
        <div>
          <div className="text-xs font-semibold text-amber-400">Editing message</div>
          <div className="text-xs text-zinc-500">Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> to cancel</div>
        </div>
      </div>
      <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-amber-900/20 transition-colors">
        <X className="w-4 h-4 text-amber-500" />
      </button>
    </div>
  ) : null;

  const InputArea = () => (
    <div className="flex-shrink-0 px-4 pb-4 pt-3">
      <div className={`rounded-xl border transition-colors ${editingMessage ? "border-amber-700/60 bg-zinc-800" : "border-zinc-700 bg-zinc-800 focus-within:border-indigo-600/70"}`}>
        <textarea
          value={text}
          ref={textareaRef}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? "Edit your message…" : `Message #hub-${numericHubId}`}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none min-h-[44px] max-h-36"
          rows={2}
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            {/* Emoji */}
            <div className="relative">
              <ToolbarBtn ref={emojiButtonRef} icon={<Smile className="w-4 h-4" />} label="Emoji" onClick={() => setShowEmojiPicker((v) => !v)} active={showEmojiPicker} />
              {showEmojiPicker && (
                <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} triggerRef={emojiButtonRef} />
              )}
            </div>
            {/* File */}
            {!editingMessage && (
              <>
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file-upload-input" />
                <label htmlFor="file-upload-input" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/60 cursor-pointer transition-colors text-xs font-medium">
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                </label>
              </>
            )}
          </div>

          {/* File preview pill */}
          {file && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-700 rounded-lg text-xs text-zinc-300">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                <X className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
              </button>
            </div>
          )}

          {/* Send / Save */}
          <button
            onClick={sendMessage}
            disabled={!text.trim() && !file}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              editingMessage
                ? "bg-amber-500 hover:bg-amber-400 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {editingMessage ? <><CheckCircle className="w-4 h-4" /> Save</> : <><Send className="w-4 h-4" /> Send</>}
          </button>
        </div>
      </div>
      <div className="mt-1.5 text-right text-[11px] text-zinc-700">
        <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-700">Enter</kbd> to {editingMessage ? "save" : "send"} &nbsp;·&nbsp;
        <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-700">Shift+Enter</kbd> newline
      </div>
    </div>
  );

  const MessagesList = () => (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-4 space-y-0.5 scroll-smooth">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-16">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
            <Hash className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-base font-semibold text-zinc-500">No messages yet</p>
          <p className="text-sm text-zinc-700 mt-1">Be the first to say something!</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              parent={msg.parent_id ? messageMap[msg.parent_id] : null}
              onReply={(m) => { setReplyTo(m); setEditingMessage(null); }}
              onEdit={onEdit}
              onDelete={onDelete}
              messageMap={messageMap}
            />
          ))}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );

  const OnlineSidebar = ({ compact = false }) => (
    <div className={compact ? "flex flex-col h-full" : ""}>
      <div className={`${compact ? "px-4 py-3 border-b border-zinc-800" : "px-5 pt-5 pb-3"}`}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          Online — {onlineUsers.length}
        </h3>
      </div>
      <div className={`space-y-0.5 ${compact ? "flex-1 overflow-y-auto px-2 py-2" : "px-3 pb-3 mt-1"}`}>
        {onlineUsers.length === 0 ? (
          <div className="py-8 text-center text-zinc-600 text-xs">No one online</div>
        ) : onlineUsers.map((user, idx) => (
          <div key={user.username || idx} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800 transition-colors group">
            <div className="relative flex-shrink-0">
              <Avatar user={user} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-300 truncate">
                {user.username}
                {user.username === currentUsername && <span className="text-zinc-600 text-xs ml-1">(you)</span>}
              </div>
              <div className="text-[11px] text-emerald-600">Active now</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── CHAT PANEL (shared between normal/fullscreen) ── */
  const ChatPanel = ({ sidebarCompact = false }) => (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Messages */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 relative">
        <MessagesList />

        {/* Scroll to bottom pill */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full shadow-xl transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5" /> New messages
          </button>
        )}

        <EditBanner />
        <ReplyBar />
        <InputArea />
      </div>

      {/* Sidebar */}
      <div className={`hidden lg:flex flex-col border-l border-zinc-800 bg-zinc-900 ${sidebarCompact ? "w-56" : "w-60"}`}>
        <OnlineSidebar compact={sidebarCompact} />
      </div>
    </div>
  );

  /* ── RENDER ── */

  // FULLSCREEN
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100">Hub Chat</h1>
              <p className="text-xs text-zinc-500">{onlineUsers.length} online · {messages.length} messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFullScreen(false)} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Exit fullscreen">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              Invite Members
            </button>
          </div>
        </div>
        <ChatPanel sidebarCompact />
      </div>
    );
  }

  // NORMAL
  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Hub Chat</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
                  {onlineUsers.length} online
                </span>
                <span>·</span>
                <span>{messages.length} messages</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFullScreen(true)} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-zinc-800 transition-colors" title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/30">
              Invite Members
            </button>
          </div>
        </div>

        {/* Chat box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl" style={{ height: "calc(100vh - 140px)" }}>
          {/* Chat header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2 text-zinc-400">
              <Hash className="w-4 h-4" />
              <span className="text-sm font-semibold text-zinc-300">hub-{numericHubId}</span>
            </div>
            <TypingIndicator typingUsers={typingUsers} />
          </div>

          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

/* ── Toolbar button helper ── */
const ToolbarBtn = ({ icon, label, onClick, active, ref: _ref, ...rest }) => (
  <button
    ref={_ref}
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      active ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/60"
    }`}
    {...rest}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);