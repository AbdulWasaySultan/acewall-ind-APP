import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CourseContext } from "@/Context/CoursesProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import AiContentModal from "../teacher/teacher/AiContentModal";

// Zod Schema with length limits
const chapterSchema = z.object({
  title: z
    .string()
    .min(5, "Chapter title is required")
    .max(100, "Chapter title cannot exceed 100 characters"),
  description: z
    .string()
    .min(5, "Chapter description is required")
    .max(500, "Chapter description cannot exceed 500 characters"),
});

export default function ChapterCreationModal({
  courseId,
  quarterId,
  setChapters,
  fetchQuarterDetail,
  refreshChapters,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { course, setCourse } = useContext(CourseContext);
  const [isLoading, setIsLoading] = useState(false); // Add this state
  const [aiResponse, setAiResponse] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Watching inputs for live character count
  const titleValue = watch("title", "");
  const descriptionValue = watch("description", "");

  const onSubmit = async (data) => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    const formdata = new FormData();
    formdata.append("title", data.title);
    formdata.append("description", data.description);
    formdata.append("quarter", quarterId);

    try {
      const res = await axiosInstance.post(
        `/chapter/create/${courseId}`,
        formdata
      );
      toast.success(res.data.message);
      refreshChapters();
      setIsOpen(false);
      reset();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 text-white">Create New Chapter</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Chapter Title */}
          <div>
            <Input
              placeholder="Chapter Title"
              {...register("title")}
              className=""
            />
            <div className="flex justify-between text-sm mt-1">
              <p className="text-gray-500">{titleValue.length}/100</p>
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title.message}</p>
              )}
              <div className="flex justify-between items-center w-full">
                <p className="text-gray-500">{titleValue.length}/100</p>
                <AiContentModal
                  aiResponse={aiResponse}
                  setAiResponse={setAiResponse}
                  usedfor="title"
                  setValue={setValue}
                />
              </div>
            </div>
          </div>

          {/* Chapter Description */}
          <div className="">
            <Textarea
              placeholder="Chapter Description"
              className="w-full"
              {...register("description")}
            />
            <div className="flex justify-between text-sm mt-1">
              <p className="text-gray-500">{descriptionValue.length}/500</p>
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
               <div className="flex justify-between items-center w-full">
                <p className="text-gray-500">{descriptionValue.length}/500</p>

                <AiContentModal
                  aiResponse={aiResponse}
                  setAiResponse={setAiResponse}
                  usedfor="description"
                  setValue={setValue}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
