"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pen, Loader2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

import JoditEditor from "jodit-react";

const lessonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  youtubeLinks: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) =>
        !val ||
        /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/)[\w-]{11}(&[^ ]*)?|youtu\.be\/[\w-]{11}(\?[^ ]*)?)$/.test(
          val
        ),
      {
        message: "Enter a valid YouTube video link",
      }
    ),
  otherLink: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine((val) => !val || /^https?:\/\/.+$/.test(val), {
      message: "Must be a valid URL",
    }),
});

const EditLessonModal = ({ lesson, fetchChapterDetail }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(lesson.description || "");

  const editor = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson.title || "",
      youtubeLinks: lesson.youtubeLinks || "",
      otherLink: lesson.otherLink || "",
    },
  });

  const onSubmit = async (data) => {
    // Basic validation for Jodit content since it's outside of React Hook Form state
    if (description.replace(/<[^>]*>/g, "").length < 5) {
      toast.error("Description must be at least 5 characters");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", description);
    formData.append("youtubeLinks", data.youtubeLinks || "");
    formData.append("otherLink", data.otherLink || "");

    try {
      const res = await axiosInstance.put(
        `lesson/edit/${lesson._id}`,
        formData
      );
      toast.success(res.data.message || "Lesson updated successfully");
      fetchChapterDetail();
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg h-10 w-10"
          aria-label={`Edit lesson: ${lesson.title}`}
        >
          <Pen size={18} aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>
            Modify lesson details below. Ensure all video links are valid URLs.
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="flex-1 overflow-y-auto px-1 py-4 space-y-6"
        >
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              placeholder="e.g. Introduction to Biology"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-red-500 text-xs font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description (Jodit Editor) */}
          <div className="space-y-2">
            <Label htmlFor="lesson-description">Lesson Description</Label>
            <div id="lesson-description" className="border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
              <JoditEditor
                ref={editor}
                value={description}
                config={{
                   readonly: false,
                   placeholder: "Start typing lesson content...",
                   height: 300
                }}
                onBlur={(newContent) => setDescription(newContent)}
              />
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* YouTube Link */}
            <div className="space-y-2">
              <Label htmlFor="youtube-link">YouTube Link (Optional)</Label>
              <Input
                id="youtube-link"
                placeholder="https://youtube.com/watch?v=..."
                {...register("youtubeLinks")}
                aria-invalid={errors.youtubeLinks ? "true" : "false"}
                aria-describedby={errors.youtubeLinks ? "youtube-error" : undefined}
              />
              {errors.youtubeLinks && (
                <p id="youtube-error" className="text-red-500 text-xs font-medium">
                  {errors.youtubeLinks.message}
                </p>
              )}
            </div>

            {/* Other Link */}
            <div className="space-y-2">
              <Label htmlFor="other-link">Reference Link (Optional)</Label>
              <Input
                id="other-link"
                placeholder="https://example.com"
                {...register("otherLink")}
                aria-invalid={errors.otherLink ? "true" : "false"}
                aria-describedby={errors.otherLink ? "other-link-error" : undefined}
              />
              {errors.otherLink && (
                <p id="other-link-error" className="text-red-500 text-xs font-medium">
                  {errors.otherLink.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setDescription(lesson.description || "");
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonModal;