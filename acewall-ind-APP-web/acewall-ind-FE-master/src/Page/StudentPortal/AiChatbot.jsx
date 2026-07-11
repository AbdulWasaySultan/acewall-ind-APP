import { normalizeMessagesFromDB } from "@/utils/messageTransformer";
import { useState, useEffect, useRef, useContext } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import ChatWindow from "@/CustomComponent/Aichatbot/ChatWindow";
import InputBar from "@/CustomComponent/Aichatbot/InputBar";
import RightPanel from "@/CustomComponent/Aichatbot/RightPanel";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Forward, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AiChatbot() {
  const [messages, setMessages] = useState([
    {
      id: Date.now() + 1,
      text: "Hello! I am Acewall Scholars EduMentor, your AI educational assistant. How can I help you today?",
      sender: "ai",
      isLoading: true,
    },
  ]);
  const [difficulty, setDifficulty] = useState("medium");
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { taggedMessage, setTaggedMessage } = useContext(GlobalContext);
  const [input, setInput] = useState("");
  const [file, setFile] = useState();

  const chatEndRef = useRef(null);

  const GENERIC_FOLLOWUP_PATTERNS = [
    "explain more",
    "tell me more",
    "what do you mean",
    "continue",
    "go on",
    "more",
    "more details",
    "explain this",
    "explain that",
    "i don't understand",
    "elaborate",
    "clarify",
    "explain again",
    "explain better",
    "what else",
    "expand this",
    "can you explain",
    "explain it",
    "explain in simple words",
  ];

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch and normalize chat history from DB
  const fetchChats = async () => {
    await axiosInstance
      .get("/aichat/getChatHistory")
      .then((res) => {
        const normalizedMessages = normalizeMessagesFromDB(
          res.data.chats || []
        );
        setMessages((prev) => [...prev, ...normalizedMessages]);
      })
      .catch((err) => {
        console.log(err, "error in fetchChats");
      });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // ------------ MAIN SEND FUNCTION (API INTEGRATION) -------------
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
      file: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : null,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Show loading state
    setLoading(true);
    const loadingMessage = {
      id: Date.now() + 1,
      text: "🤔...",
      sender: "ai",
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append("question", text);
      formData.append("difficulty", difficulty);
      if (taggedMessage) {
        formData.append("context", taggedMessage.dbId);
      }
      if (file) {
        formData.append("file", file);
      }

      const res = await axiosInstance.post("/aichat/askupdated", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      const aiMessage = {
        id: Date.now() + 2,
        text: res.data.answer,
        sender: "ai",
        timestamp: new Date(),
        suggestions: res.data.suggestedQuestions,
        generatedFile: res.data.generatedFile || null,
        fileUsed: res.data.fileUsed || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSuggestedQuestions(res.data.suggestedQuestions || []);
      setTaggedMessage(null);
      setInput("");
      setFile(null); // Clear file after sending
    } catch (error) {
      console.error("AI API Error:", error);

      // Remove loading message
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      const errorMessage = {
        id: Date.now() + 3,
        text: "Oops! Something went wrong while contacting the AI.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // When clicking follow-up question
  const handleFollowUpQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="flex-1 flex flex-col min-h-0 order-1 lg:order-none">
        {/* HEADER */}
        <header className="bg-blue-600 dark:bg-slate-950 px-6 py-4 shadow-md sticky top-0 rounded-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            AI Educational Assistant
          </h1>
        </header>

        {/* CHAT WINDOW SECTION */}
        <section className="flex-1 overflow-y-auto">
          <ChatWindow
            messages={messages}
            chatEndRef={chatEndRef}
            loading={loading}
          />
        </section>

        {/* FOLLOW-UP SUGGESTION SCROLL BAR */}
        <section>
          {messages.length !== 0 && (
            <section className="flex p-2 bg-white dark:bg-slate-800 shadow-lg border-t overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex-wrap">
              {GENERIC_FOLLOWUP_PATTERNS.map((pattern) => (
                <Badge
                  key={pattern}
                  onClick={() => setInput(pattern)}
                  className="mr-2 mb-2 cursor-pointer whitespace-nowrap"
                  variant="outline"
                >
                  {pattern}
                </Badge>
              ))}
            </section>
          )}
        </section>

        {/* INPUT + TAGGED MESSAGE BAR */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-t">
          <p className="text-xs mb-2 text-muted-foreground gap-2">
            {taggedMessage && (
              <>
                <div>
                  <section className="flex justify-between mb-2">
                    <Forward className="cursor-pointer" />
                    <X
                      className="cursor-pointer"
                      onClick={() => {
                        setTaggedMessage(null);
                      }}
                    />
                  </section>
                  <p className="line-clamp-2">{taggedMessage.text}</p>
                </div>
              </>
            )}
          </p>

          <InputBar
            onSendMessage={handleSendMessage}
            input={input}
            setInput={setInput}
            disabled={loading}
            file={file}
            setFile={setFile}
          />
        </div>
      </main>

      {/* RIGHT SIDE PANEL */}
      <aside className="bg-slate-100 dark:bg-slate-900 shadow-xl border-l p-4">
        <RightPanel
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onFollowUpQuestion={handleFollowUpQuestion}
          suggestions={suggestedQuestions}
        />
      </aside>
    </div>
  );
}
