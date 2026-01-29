import { useEffect, useRef } from "react";
import { EMOJIS } from "./emojiList";

export default function EmojiPicker({ onSelect, onClose, triggerRef }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      // click inside picker → ignore
      if (pickerRef.current?.contains(e.target)) return;

      // click on emoji button → ignore (toggle handles it)
      if (triggerRef?.current?.contains(e.target)) return;

      // true outside click
      onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, triggerRef]);

  return (
    <div
      ref={pickerRef}
      className="
        fixed bottom-24 right-6 z-[9999]
        w-96 bg-white border border-gray-200
        rounded-2xl shadow-2xl p-3
      "
    >
      <div className="text-sm font-semibold text-gray-700 px-2 pb-2">
        Pick emojis
      </div>

      <div className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto px-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

