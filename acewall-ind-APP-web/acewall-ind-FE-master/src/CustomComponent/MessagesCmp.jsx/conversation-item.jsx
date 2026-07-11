import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import avatar from "../../assets/avatar.png";
import { useContext, useEffect } from "react";
import { GlobalContext } from "@/Context/GlobalProvider";
import { format, formatDistanceToNow } from "date-fns";
import { axiosInstance } from "@/lib/AxiosInstance";

export default function ConversationItem({ conversation, isActive, onClick }) {
  console.log(conversation.unreadCount, "conversation.unreadCount");
  return (
    <div
      className={cn(
        "flex justify-center gap-2 p-6 rounded-xl border-2  shadow-sm  cursor-pointer transition-all hover:shadow-md hover:bg-gray-50",
        isActive && "bg-green-50 border-green-200 shadow-md"
      )}
      onClick={onClick}
    >
      <Avatar className="h-16 w-16 flex items-center justify-center rounded-full border-2 border-green-200">
        <AvatarImage
          src={conversation.otherMember.profileImg?.url || avatar}
          alt={conversation.otherMember.name}
          className="w-full h-full bg-cover rounded-full"
        />
        <AvatarFallback className="text-green-500 font-bold">
          {conversation.otherMember.name[0]}
        </AvatarFallback>
      </Avatar>

      <section className="flex justify-between items-center py-2 gap-4 w-full">
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="text-md font-medium text-gray-800 truncate">
            {conversation.otherMember.name}
          </h3>
          {conversation.lastMessage ? (
            <div className="flex items-center rounded-lg mt-1">
              <p className="text-xs text-gray-600 italic truncate flex-1">
                {conversation.lastMessage}
              </p>

              {conversation.unreadCount > 0 && (
                <div className="ml-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center rounded-lg mt-1">
              <p className="text-xs text-gray-600 italic truncate flex-1">
                No messages yet
              </p>
            </div>
          )}
        </div>

        <div className="text-right min-w-fit ml-2">
          <p className="text-xs text-gray-500">
            {conversation?.lastMessageDate &&
              formatDistanceToNow(new Date(conversation?.lastMessageDate), {
                addSuffix: true,
              })}
            {}
          </p>
        </div>
      </section>
    </div>
  );
}
