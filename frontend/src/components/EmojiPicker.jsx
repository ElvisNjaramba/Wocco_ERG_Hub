import { useEffect, useRef } from "react";
import { EMOJIS } from "./emojiList";

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  const uniqueEmojis = [...new Set(EMOJIS)];

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-14 right-0 z-50 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-3"
    >
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
{uniqueEmojis.map((emoji) => (
  <button
    key={emoji}
    onClick={() => onSelect(emoji)}
    className="text-xl hover:bg-gray-100 rounded-lg p-1 transition"
  >
    {emoji}
  </button>
))}

      </div>
    </div>
  );
}
