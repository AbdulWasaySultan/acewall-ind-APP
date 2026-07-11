import { Plus, Search } from "lucide-react";
import ConversationItem from "./conversation-item";
// import { conversations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import TeacherList from "../createConversationDropdown";
import TeacherDropdown from "../createConversationDropdown";

export default function ConversationList({
  activeConversation,
  setActiveConversation,
}) {
  const [conversations, setConversations] = useState();
  const { user, currentConversation, setCurrentConversation } =
    useContext(GlobalContext);

  const [teacher, setTeacher] = useState([]);

  const getConversations = () => {
    axiosInstance
      .get("/conversation/get")
      .then((res) => {
        setConversations(res.data.conversations);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getConversations();
  }, []);

  const handleActiveConversation = async (id) => {
    setActiveConversation(id);
  };

  const fetchCoursesbystudent = async () => {
    await axiosInstance
      .get(`/conversation/getTeacherforStudent`)
      .then((res) => {
        console.log(res, "res");
        setTeacher(res.data.teachers);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchCoursesbystudent();
  }, []);

  return (
    <div className="flex flex-col h-full hide-scrollbar p-4 gap-3">

      {
        user.role === "student" && (
          <TeacherList
            teachers={teacher}
            getConversations={getConversations}
          />
        )
      }

      {conversations && conversations.length > 0 ? (
        <div className="overflow-y-auto gap-3 flex flex-wrap">
          {conversations.map((conversation) => (
            <Link
              onClick={() => setCurrentConversation(conversation)}
              to={
                user.role === "student"
                  ? `/student/messages/${conversation.conversationId}`
                  : `/teacher/messages/${conversation.conversationId}`
              }
              key={conversation._id}
            >
              <ConversationItem conversation={conversation} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          No conversations found.
        </div>
      )}
    </div>
  );
}
