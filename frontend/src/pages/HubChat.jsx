
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { messageTemplates } from "../components/MessageTemplates";
import EmojiPicker from "../components/EmojiPicker";
import {
  Send,
  Paperclip,
  X,
  Reply,
  ChevronUp,
  Image as ImageIcon,
  File,
  Smile,
  MoreVertical,
  Users,
  Pin,
  Search,
  Clock,
  CheckCircle,
  User,
  Maximize2,
  Minimize2
} from "lucide-react";

/* ---------- helpers ---------- */
const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url || "");

const buildMessageMap = (messages) => {
  const map = {};
  messages.forEach((m) => {
    map[m.id] = m;
  });
  return map;
};

/* ---------- message item ---------- */
const MessageItem = ({ msg, onReply, parent, template = "bubble", messageMap }) => {
  const TemplateComponent =
    messageTemplates[template]?.component ||
    (({ item }) => (
      <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
        {item.text}
      </p>
    ));

  const itemData = {
    text: msg.content,
    author: {
      id: msg.sender_id,
      name: msg.sender,
      avatarUrl: msg.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    },
    timestamp: new Date(msg.created_at),
    media_url: msg.media_url,
  };

  const ref = useRef(null);

  // Save ref in map for jumping
  useEffect(() => {
    if (messageMap[msg.id]) {
      messageMap[msg.id]._ref = ref;
    }
  }, [msg.id, messageMap]);

  const handleQuotedClick = () => {
    if (parent && messageMap[parent.id]?._ref?.current) {
      const el = messageMap[parent.id]._ref.current;
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Temporary highlight
      el.style.transition = "all 0.5s ease";
      const original = el.style.background;
      el.style.background = "#fef3c7";
      el.style.boxShadow = "0 0 0 3px #f59e0b";
      
      setTimeout(() => {
        el.style.background = original || "#ffffff";
        el.style.boxShadow = "";
      }, 1500);
    }
  };

  return (
    <div 
      ref={ref} 
      className="group relative mb-4 transition-all duration-200 hover:bg-gray-50/50 rounded-2xl p-2"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#432dd7] to-purple-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
            {itemData.author.avatarUrl ? (
              <img 
                src={itemData.author.avatarUrl} 
                alt={itemData.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Quoted parent */}
          {parent && (
            <div
              onClick={handleQuotedClick}
              className="mb-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#432dd7]/10 to-purple-500/10 border border-[#432dd7]/20 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Reply className="w-3 h-3 text-[#432dd7]" />
                <span className="text-xs font-semibold text-[#432dd7]">
                  {parent.sender}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {parent.content?.slice(0, 80)}
                  {parent.content?.length > 80 ? "..." : ""}
                </span>
              </div>
            </div>
          )}

          {/* Message Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">
              {itemData.author.name}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(itemData.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {msg.isEdited && (
              <span className="text-xs text-gray-400 italic">edited</span>
            )}
          </div>

          {/* Message Body */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 hover:border-gray-300 transition-all group-hover:shadow-md">
              <TemplateComponent item={itemData} />
              
              {/* Media Attachment */}
              {msg.media_url && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                  {isImage(msg.media_url) ? (
                    <div className="relative">
                      <img 
                        src={msg.media_url} 
                        alt="Attachment" 
                        className="w-full max-w-md object-cover transition-transform hover:scale-[1.02] duration-300 cursor-zoom-in"
                        onClick={() => window.open(msg.media_url, '_blank')}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <a
                      href={msg.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#432dd7]/20 to-purple-500/20 flex items-center justify-center">
                        <File className="w-5 h-5 text-[#432dd7]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate text-sm">
                          {msg.media_url.split('/').pop()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Click to download
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Message Actions */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onReply(msg)}
                  className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-[#432dd7] hover:text-white hover:border-[#432dd7] transition-all"
                  title="Reply"
                >
                  <Reply className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [fullScreen, setFullScreen] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);


  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
const typingTimeoutRef = useRef(null);

  const token = localStorage.getItem("access");

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
const currentUsername = localStorage.getItem("username");

  // Load messages
  useEffect(() => {
    api.get(`/messages/?hub=${numericHubId}`).then((res) => {
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    });
  }, [numericHubId]);

  // WebSocket connection
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
        setTimeout(scrollToBottom, 100);
      }
      
      // Handle typing indicators
      if (data.type === "typing") {
        // Ignore my own typing events
        if (data.user === currentUsername) return;

        if (data.is_typing) {
          setTypingUser(data.user);
          setIsTyping(true);
        } else {
          setTypingUser(null);
          setIsTyping(false);
        }
      }



if (data.type === "presence") {
  setOnlineUsers((prev) => {
if (data.action === "online") {
  if (!data.user.username) return prev; // ignore users without username
  if (prev.some(u => u.username === data.user.username)) return prev;
  return [...prev, data.user];
}

if (data.action === "offline") {
  if (!data.user.username) return prev;
  return prev.filter(u => u.username !== data.user.username);
}


    return prev;
  });
}


      
      // Handle online users
      if (data.type === "online_users") {
        setOnlineUsers(data.users);
      }
    };

ws.onopen = () => {
  console.log("WebSocket connected");

  if (currentUsername) {  // Only add if username exists
    setOnlineUsers((prev) => {
      if (prev.some(u => u.username === currentUsername)) return prev;
      return [...prev, { username: currentUsername }];
    });
  }
};


    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [hubId, token, numericHubId]);


const handleTyping = () => {
  const ws = socketRef.current;

  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type: "typing",
    is_typing: true,
  }));

  clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "typing",
        is_typing: false,
      }));
    }
  }, 1500);
};


  // Send message
  const sendMessage = async () => {
    if (!text.trim() && !file) return;

    const form = new FormData();
    form.append("hub", numericHubId.toString());
    if (text) form.append("content", text);
    if (file) form.append("media", file);
    if (replyTo?.id) form.append("parent", replyTo.id.toString());

    try {
      await api.post("/messages/", form);
      setText("");
      setFile(null);
      setReplyTo(null);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle Enter key for sending
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const insertEmoji = (emoji) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newText =
    text.slice(0, start) + emoji + text.slice(end);

  setText(newText);

  // restore cursor position
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd =
      start + emoji.length;
  }, 0);

  setShowEmojiPicker(false);
};


  // Build parent map for quoted messages
  const messageMap = buildMessageMap(messages);

  if (!numericHubId || Number.isNaN(numericHubId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center p-8 rounded-3xl bg-white shadow-2xl border border-gray-200 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Hub</h2>
          <p className="text-gray-600 mb-6">The hub ID is invalid or not found.</p>
          <button
            onClick={() => window.history.back()}
            className="rounded-xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white px-6 py-3 font-semibold hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50 ${fullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Normal Mode Container */}
      {!fullScreen && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Chat Header */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#432dd7] to-purple-600 flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{onlineUsers.length}</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hub Chat</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Real-time messaging</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>{messages.length} messages</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFullScreen(true)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  title="Enter fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                </button>
                {/* <button className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <Pin className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <Search className="w-5 h-5 text-gray-600" />
                </button> */}
                <button className="rounded-xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white px-6 py-3 font-semibold hover:shadow-lg transition-all">
                  Invite Members
                </button>
              </div>
            </div>
          </div>

          {/* Main Chat Layout for Normal Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Messages */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-[calc(100vh-250px)] flex flex-col">
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                  <div className="flex items-center gap-4">
                    {isTyping && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 animate-pulse">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="italic">
                          {typingUser || "Someone"} is typing…
                        </span>

                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      {messages.length} total messages
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50/50 space-y-3"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                        <Send className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <MessageItem
                          key={msg.id}
                          msg={msg}
                          parent={msg.parent_id ? messageMap[msg.parent_id] : null}
                          onReply={setReplyTo}
                          template={template}
                          messageMap={messageMap}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Reply Preview */}
                {replyTo && (
                  <div className="border-t border-gray-100 bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#432dd7] to-purple-500 flex items-center justify-center">
                          <Reply className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Replying to <span className="text-[#432dd7]">{replyTo.sender}</span>
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-md">
                            {replyTo.content}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t border-gray-100 p-4">
                  <div className="relative flex items-center">
                    <textarea
                      value={text}
                      ref={textareaRef}
                      onChange={(e) => {
                        setText(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      className="flex-1 min-h-[70px] p-4 pr-24 rounded-2xl border-2 border-gray-200 focus:border-[#432dd7] focus:ring-2 focus:ring-[#432dd7]/20 focus:outline-none resize-none transition-all"
                      rows="2"
                    />

                    <div className="absolute right-4 bottom-4 flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                        title="Attach file"
                      >
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </label>

                      {file && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#432dd7]/10 to-purple-500/10 rounded-lg">
                          <File className="w-4 h-4 text-[#432dd7]" />
                          <span className="text-sm text-gray-700 truncate max-w-[100px]">
                            {file.name}
                          </span>
                          <button
                            onClick={() => {
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-1"
                          >
                            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={sendMessage}
                        disabled={!text.trim() && !file}
                        className="p-3 rounded-xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                        title="Send message"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
<div className="relative">
  <button
    type="button"
    onClick={() => setShowEmojiPicker((v) => !v)}
    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
  >
    <Smile className="w-4 h-4" />
    <span className="hidden sm:inline">Emoji</span>
  </button>

  {showEmojiPicker && (
    <EmojiPicker
      onSelect={insertEmoji}
      onClose={() => setShowEmojiPicker(false)}
    />
  )}
</div>


                      <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Image</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                        <File className="w-4 h-4" />
                        <span className="hidden sm:inline">File</span>
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm">
                      Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to send
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Online Users Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Online Members ({onlineUsers.length})
                </h3>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {onlineUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#432dd7] to-purple-500 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate text-sm">{user.username}</div>
                        <div className="text-xs text-gray-500">Active now</div>
                      </div>
                    </div>
                  ))}
                  
                  {onlineUsers.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No members online</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Chat Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5">
                      <Send className="w-4 h-4 text-[#432dd7]" />
                      <span className="text-xs text-gray-700">Real-time messaging</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5">
                      <Paperclip className="w-4 h-4 text-[#432dd7]" />
                      <span className="text-xs text-gray-700">File sharing</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5">
                      <Reply className="w-4 h-4 text-[#432dd7]" />
                      <span className="text-xs text-gray-700">Threaded replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN MODE - Takes entire screen */}
      {fullScreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#432dd7] to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hub Chat - Fullscreen</h1>
                  <p className="text-sm text-gray-600">{onlineUsers.length} online • {messages.length} messages</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFullScreen(false)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  title="Exit fullscreen"
                >
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="rounded-xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white px-4 py-2 text-sm font-semibold hover:shadow-lg transition-all">
                  Invite Members
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Chat Area - Takes remaining space */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Messages</h2>
              <div className="flex items-center gap-4">
                {isTyping && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#432dd7] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {messages.length} total messages
                </div>
              </div>
            </div>

            {/* Messages List - Takes maximum available space */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50/50 space-y-3"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <Send className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      msg={msg}
                      parent={msg.parent_id ? messageMap[msg.parent_id] : null}
                      onReply={setReplyTo}
                      template={template}
                      messageMap={messageMap}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div className="border-t border-gray-100 bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5 p-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#432dd7] to-purple-500 flex items-center justify-center">
                      <Reply className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Replying to <span className="text-[#432dd7]">{replyTo.sender}</span>
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-md">
                        {replyTo.content}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-gray-100 p-4 flex-shrink-0">
              <div className="relative flex items-center">
                <textarea
                  value={text}
                  ref={textareaRef}
                  onChange={(e) => {
                    setText(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[70px] p-4 pr-24 rounded-2xl border-2 border-gray-200 focus:border-[#432dd7] focus:ring-2 focus:ring-[#432dd7]/20 focus:outline-none resize-none transition-all"
                  rows="2"
                />

                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </label>

                  {file && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#432dd7]/10 to-purple-500/10 rounded-lg">
                      <File className="w-4 h-4 text-[#432dd7]" />
                      <span className="text-sm text-gray-700 truncate max-w-[100px]">
                        {file.name}
                      </span>
                      <button
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="ml-1"
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={sendMessage}
                    disabled={!text.trim() && !file}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-4">
<div className="relative">
  <button
    type="button"
    onClick={() => setShowEmojiPicker((v) => !v)}
    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
  >
    <Smile className="w-4 h-4" />
    <span className="hidden sm:inline">Emoji</span>
  </button>

  {showEmojiPicker && (
    <EmojiPicker
      onSelect={insertEmoji}
      onClose={() => setShowEmojiPicker(false)}
    />
  )}
</div>


                  <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Image</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                    <File className="w-4 h-4" />
                    <span className="hidden sm:inline">File</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to send
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {!fullScreen && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-[#432dd7] to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
          title="Scroll to bottom"
        >
          <ChevronUp className="w-6 h-6 rotate-180" />
        </button>
      )}
    </div>
  );
}