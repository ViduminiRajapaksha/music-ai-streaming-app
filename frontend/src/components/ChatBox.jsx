import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FiSend, FiUser, FiCpu } from "react-icons/fi";

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-spotify-green rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const ChatBox = ({ messages, onSend, loading, sessionId }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed, sessionId);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <FiCpu className="w-12 h-12 text-spotify-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Music AI Assistant</h3>
            <p className="text-spotify-light">
              Ask me about music, artists, genres, or get recommendations!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-spotify-green text-black" : "bg-spotify-gray"
              }`}
            >
              {msg.role === "user" ? (
                <FiUser className="w-4 h-4" />
              ) : (
                <FiCpu className="w-4 h-4 text-spotify-green" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-spotify-green text-black"
                  : "bg-spotify-gray text-white"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-spotify-gray flex items-center justify-center">
              <FiCpu className="w-4 h-4 text-spotify-green" />
            </div>
            <div className="bg-spotify-gray rounded-2xl">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about music..."
            disabled={loading}
            className="input-field flex-1 !rounded-full"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center
                       disabled:opacity-50 hover:scale-105 transition-transform"
            aria-label="Send message"
          >
            <FiSend className="w-5 h-5 text-black" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
