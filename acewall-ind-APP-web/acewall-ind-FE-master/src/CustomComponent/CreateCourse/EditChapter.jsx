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
import { Loader, Pen, Pencil } from "lucide-react";

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

export default function EditChapterDialog({
  fetchChapterDetail,
  chapterId,
  title,
  description,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { course, setCourse } = useContext(CourseContext);
  const [isLoading, setIsLoading] = useState(false); // Add this state

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: title,
      description: description,
    },
  });

  // Watching inputs for live character count
  const titleValue = watch("title", "");
  const descriptionValue = watch("description", "");

  const onSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    const formdata = new FormData();
    formdata.append("title", data.title);
    formdata.append("description", data.description);

    try {
      const res = await axiosInstance.put(
        `/chapter/edit/${chapterId}`,
        formdata
      );
      toast.success(res.data.message);
      fetchChapterDetail();
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
      <DialogTrigger asChild className={"w-9 h-9"}> 
        <div className="bg-green-200 hover:bg-green-300 cursor-pointer rounded-lg p-2 item-center">
          <Pencil className="text-green-600" size={20} />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Chapter Title */}
          <div>
            <Input
              placeholder="Chapter Title"
              maxLength={100}
              {...register("title")}
            />
            <div className="flex justify-between text-sm mt-1">
              <p className="text-gray-500">{titleValue.length}/100</p>
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Chapter Description */}
          <div className="w-[28rem]">
            <Textarea
              placeholder="Chapter Description"
              maxLength={500}
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
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin mr-2" />
              ) : (
                "Edit Chapter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
