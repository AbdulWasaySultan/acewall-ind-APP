import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useState } from "react";

const TeacherDropdown = ({ teachers, getConversations }) => {
  const [open, setOpen] = useState(false);
  const handleConversation = async (id) => {
    await axiosInstance
      .post("conversation/create", {
        memberId: id,
      })
      .then((res) => {
        getConversations();
        setOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Start New Conversation</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <ScrollArea className="h-64 w-full">
          {teachers.length === 0  ? "No Teachers" :  teachers.map((teacher) => (
            <div
              key={teacher.teacherId}
              className="mb-2 border p-2 rounded-lg cursor-pointer"
              onClick={() => handleConversation(teacher.teacherId)}
            >
              <div className="font-medium text-sm text-gray-800 pb-1">
                {teacher.firstName} {teacher.middleName} {teacher.lastName}
              </div>
             
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default TeacherDropdown;
