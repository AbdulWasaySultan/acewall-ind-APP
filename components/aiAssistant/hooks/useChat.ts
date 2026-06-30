import { useState, useCallback, useEffect } from "react";
import { Message } from "../types";
import { sendAIMessage, getChatHistory } from "../../../services/aiAssistant";

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_REPLIES_DEFAULT = [
  "explain more",
  "tell me more",
  "what do you mean",
  "continue",
  "go on",
  "more",
  "more details",
  "explain this",
  "i don't understand",
  "elaborate",
  "clarify",
  "explain again",
];

const generateId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface UseChatOptions {
  systemPrompt?: string;
  sessionType?: string;
  courseId?: string;
  context?: string;
  model?: string;
  difficulty?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE — each chat item { question, answer } → 2 messages
// API response: { chats: [{ question: { text }, answer: { text }, _id, ... }] }
// ─────────────────────────────────────────────────────────────────────────────
const normalizeChatItem = (item: any): Message[] => {
  const msgs: Message[] = [];
  const timestamp = item.createdAt ? new Date(item.createdAt) : new Date();

  // User message from question.text
  if (item.question?.text) {
    msgs.push({
      id: `${item._id}_q`,
      role: "user",
      content: item.question.text,
      timestamp,
    });
  }

  // AI message from answer.text
  if (item.answer?.text) {
    msgs.push({
      id: `${item._id}_a`,
      role: "assistant",
      content: item.answer.text,
      timestamp,
    });
  }

  return msgs;
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ── Load chat history on mount ────────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      console.log("=== LOADING CHAT HISTORY ===");
      setHistoryLoading(true);
      try {
        const data = await getChatHistory();
        console.log("=== HISTORY DATA KEYS ===", Object.keys(data ?? {}));

        // ✅ API returns { chats: [] }
        const raw: any[] = data.chats ?? data.messages ?? data.history ?? [];
        console.log("=== RAW CHATS COUNT ===", raw.length);

        if (raw.length > 0) {
          // ✅ Each chat { question, answer } → flatMap into [userMsg, aiMsg]
          const normalized = raw.flatMap(normalizeChatItem);
          setMessages(normalized);
          console.log(
            `✅ Loaded ${normalized.length} messages from ${raw.length} chats`
          );
        }
      } catch (e: any) {
        // Fail silently — start with empty chat
        console.warn("Could not load chat history:", e.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  // const sendMessage = useCallback(
  //   async (userText: string, file?: any) => {
  //     if (!userText.trim() && !file) return;
  //     if (isTyping) return;

  //     setError(null);
  //     setQuickReplies([]);

  //     console.log("=== useChat.sendMessage ===");
  //     console.log("text:", userText);
  //     console.log("file:", file ? file.name : "none");

  //     // ✅ Store file inside message so ChatMessage can render image/PDF
  //     const userMessage: Message = {
  //       id: generateId(),
  //       role: "user",
  //       content: userText.trim(),
  //       timestamp: new Date(),
  //       file: file
  //         ? {
  //             uri: file.uri,
  //             name: file.name,
  //             type: file.type ?? "application/octet-stream",
  //             size: file.size,
  //           }
  //         : undefined,
  //     };
  //     setMessages((prev) => [...prev, userMessage]);
  //     setIsTyping(true);

  //     try {
  //       const data = await sendAIMessage({
  //         question: userText.trim(),
  //         difficulty: options.difficulty,
  //         context: options.context,
  //         sessionType: options.sessionType,
  //         model: options.model,
  //         file: file,
  //       });

  //       const aiText =
  //         data.answer ??
  //         data.response ??
  //         data.reply ??
  //         data.message ??
  //         "No response received.";

  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           id: generateId(),
  //           role: "assistant",
  //           content: aiText,
  //           timestamp: new Date(),
  //         },
  //       ]);

  //       setQuickReplies(data.suggestedQuestions ?? QUICK_REPLIES_DEFAULT);
  //     } catch (err: any) {
  //       setError(err.message || "Failed to get response.");
  //       console.log("AI chat error:", err);
  //       console.error("AI chat error:", err);
  //     } finally {
  //       setIsTyping(false);
  //     }
  //   },
  //   [messages, isTyping, options]
  // );

  // ── Send message ──────────────────────────────────────────────────────────
const sendMessage = useCallback(
  async (userText: string, file?: any) => {
    if (!userText.trim() && !file) {
      console.log("⚠️ No message or file to send");
      return;
    }
    
    if (isTyping) {
      console.log("⏳ Already typing, skipping...");
      return;
    }

    setError(null);
    setQuickReplies([]);

    console.log("=== useChat.sendMessage ===");
    console.log("text:", userText);
    console.log("file:", file ? file.name : "none");

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: userText.trim(),
      timestamp: new Date(),
      file: file
        ? {
            uri: file.uri,
            name: file.name || file.fileName || "file.pdf",
            type: file.type || "application/octet-stream",
            size: file.size,
          }
        : undefined,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log("📤 Sending to AI...");
      
      const data = await sendAIMessage({
        question: userText.trim(),
        difficulty: options.difficulty,
        context: options.context,
        sessionType: options.sessionType,
        model: options.model,
        file: file,
      });

      console.log("📥 AI Response received:", data);

      const aiText =
        data.answer ??
        data.response ??
        data.reply ??
        data.message ??
        "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: aiText,
          timestamp: new Date(),
        },
      ]);

      setQuickReplies(data.suggestedQuestions ?? QUICK_REPLIES_DEFAULT);
    } catch (err: any) {
      console.error("❌ AI chat error:", err);
      setError(err.message || "Failed to get response. Please try again.");
      
      // ✅ Show user-friendly error message
      const errorMessage = err.message || "Failed to get response. Please try again.";
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  },
  [isTyping, options] // ✅ Removed messages from dependencies to avoid infinite loops
);

  // ── Clear conversation ────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    quickReplies,
    error,
    historyLoading,
    sendMessage,
    clearChat,
  };
};

export default useChat;
