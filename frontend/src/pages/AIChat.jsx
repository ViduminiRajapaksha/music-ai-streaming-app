import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { aiService } from "../services/aiService";
import { userService } from "../services/userService";
import ChatBox from "../components/ChatBox";
import PageHero from "../components/PageHero";
import toast from "react-hot-toast";
import { FiMessageCircle, FiPlus } from "react-icons/fi";

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
      className="flex h-[calc(100vh-10rem)] flex-col gap-6"
    >
      <PageHero
        eyebrow="AI Assistant"
        title="AI Music Chat"
        description="Ask for listening ideas, local library picks, lyrics help, or playlist direction."
        icon={FiMessageCircle}
        action={(
          <button onClick={handleNewChat} className="btn-secondary flex items-center gap-2 text-sm !px-4 !py-2">
            <FiPlus /> New Chat
          </button>
        )}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg bg-white/[0.06] ring-1 ring-white/10">
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
