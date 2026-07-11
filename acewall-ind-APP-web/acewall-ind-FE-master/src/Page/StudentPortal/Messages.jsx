import ChatWindow from "@/CustomComponent/MessagesCmp.jsx/chat-window";
import ConversationList from "@/CustomComponent/MessagesCmp.jsx/conversation-list";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";

const Messages = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading (e.g., user data, initial messages, etc.)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // mimic async delay

    return () => clearTimeout(timeout); // cleanup
  }, []);

  return (
    <div className="md:p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold py-4 px-6 mb-6 bg-acewall-main text-white rounded-xl shadow-md">
        Messages
      </h1>

      {/* Main container */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl">
          <div className="flex h-full w-full">
            <div className="h-full w-full">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <section className="flex justify-center items-center h-full w-full">
                    <Loader  className="animate-spin " />
                  </section>
                </div>
              ) : (
                <ConversationList />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
