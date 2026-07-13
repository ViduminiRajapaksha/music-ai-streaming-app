import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { aiService } from "../services/aiService";
import { userService } from "../services/userService";
import ChatBox from "../components/ChatBox";
import toast from "react-hot-toast";

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => Date.now().toString());

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await userService.getChatHistory(20);
        if (history?.length) {
          setMessages(
            history.map((h) => ({
              role: h.role,
              content: h.message
            }))
          );
        }
      } catch {
        // Use empty chat on failure
      }
    };
    loadHistory();
  }, []);

  const handleSend = async (message) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    try {
      const data = await aiService.chat(message, sessionId);
      setSessionId(data.sessionId || sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      toast.error(err.message || "Failed to get AI response");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(Date.now().toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-12rem)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">AI Music Chat</h1>
          <p className="text-spotify-light">Ask anything about music</p>
        </div>
        <button onClick={handleNewChat} className="btn-secondary text-sm !py-2 !px-4">
          New Chat
        </button>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden">
        <ChatBox
          messages={messages}
          onSend={handleSend}
          loading={loading}
          sessionId={sessionId}
        />
      </div>
    </motion.div>
  );
};

export default AIChat;
