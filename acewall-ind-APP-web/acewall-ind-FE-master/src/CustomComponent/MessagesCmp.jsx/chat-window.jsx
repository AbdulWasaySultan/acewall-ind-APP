import { useContext, useEffect, useState } from "react";
import { MoreHorizontal, Send, Edit, Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getContactByName, messages as initialMessages } from "@/lib/data";
import MessageList from "./messages-list";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useParams } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import avatar from "../../assets/avatar.png";

export default function ChatWindow() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, socket, currentConversation } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(false);

  const activeConversation = useParams().id;

  console.log(socket, "socket");

  const subscribeToMessages = () => {
    socket?.on("newMessage", (message) => {
      setMessages((prev) => [message, ...prev]);
    });
  };

  const unsubscripteToMessages = () => {
    socket?.off("newMessage");
  };

  const getMessages = async (page = 1, limit = 10) => {
    try {
      const res = await axiosInstance.get(
        `/messeges/get/${activeConversation}?page=${page}&limit=${limit}`
      );
      const initialMessages = res.data.messages;

      setMessages(initialMessages);
      setHasMore(initialMessages.length === limit); // ✅ correct comparison
      setPage(page); // reset to 1
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      setHasMore(true); // ✅ reset
      setPage(1); // ✅ reset
      getMessages();
      subscribeToMessages();
    }

    return () => unsubscripteToMessages(); // cleanup
  }, [loading]);

  useEffect(() => {
    if (activeConversation) {
      axiosInstance.post(`messeges/markAsRead/${activeConversation}`);
      axiosInstance.patch(`conversation/lastSeen/${activeConversation}`);
    }
  }, [getMessages]);

  // return;
  const handleSendMessage = async () => {
    setLoading(true);
    await axiosInstance
      .post(`/messeges/create/${activeConversation}`, {
        text: newMessage,
      })
      .then((res) => {
        console.log(res, "res.datares.data");
        setLoading(false);
        getMessages();
        setNewMessage("");
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });

    /// real time functinality
    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: activeConversation,
      text: newMessage,
    });
  };

  return (
    <div className="flex flex-col h-[500px] overflow-auto hide-scrollbar border-red-600">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={currentConversation?.otherMember.profileImg?.url || avatar}
            />
            <AvatarFallback>
              {currentConversation?.otherMember.name}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {currentConversation?.otherMember.name}
            </h3>
          </div>
        </div>
      </div>

      <MessageList
        messages={messages}
        setMessages={setMessages}
        activeConversation={activeConversation}
        subscribeToMessages={subscribeToMessages}
        page={page}
        setPage={setPage}
        hasMore={hasMore}
        setHasMore={setHasMore}
        loadingMessage={loadingMessage}
        setLoadingMessage={setLoadingMessage}
        loading={loading}
        setLoading={setLoading}
      />

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type your message"
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 rounded-full h-12 w-12 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
          >
            {loading ? (
              <Loader className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Send className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
