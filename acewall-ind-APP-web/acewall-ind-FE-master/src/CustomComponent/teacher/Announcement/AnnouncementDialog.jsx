import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";

// Zod Schema
const AnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  courseId: z.string().trim().min(1, "Course is required"),
  message: z.string().trim().min(1, "Message is required").max(500, "Message cannot exceed 500 characters"),
  links: z.string().optional(),
  attachments: z.any().refine((files) => !files || files.length <= 5, "Max 5 files allowed").optional(),
});

export default function AnnouncementDialog({ open, onOpenChange, onCreated }) {
  const { user } = useContext(GlobalContext);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [messageCharCount, setMessageCharCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: "",
      courseId: "",
      message: "",
      links: "",
      attachments: [],
    },
  });

  useEffect(() => {
    const getCourses = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/course/getVerifiedCourses");
        setAllCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setAllCourses([]);
      } finally {
        setLoading(false);
      }
    };
    getCourses();
  }, []);

  const onSubmit = async (data) => {
    if (!user?._id) return;

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("message", data.message);
    formData.append("courseId", data.courseId);
    formData.append("teacherId", user._id);
    if (data.links) formData.append("links", data.links);

    if (data.attachments?.length) {
      Array.from(data.attachments).forEach((file) => formData.append("attachments", file));
    }

    try {
      const res = await axiosInstance.post("/announcements/createannouncement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusMessage("Announcement created and email sent to enrolled students.");
      alert("✅ Announcement created and email sent to enrolled students.");

      if (onCreated) onCreated(res.data.announcement);

      handleCancel();
    } catch (err) {
      console.error("Error creating announcement:", err);
      setStatusMessage("Failed to create announcement. Please try again.");
      alert("❌ Failed to create announcement. Please try again.");
    }
  };

  const handleCancel = () => {
    reset();
    setTitleCharCount(0);
    setMessageCharCount(0);
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleFilesChange = (e) => {
    const files = e.target.files;
    setSelectedFiles(Array.from(files));
    setValue("attachments", files, { shouldValidate: true });
  };

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby="announcement-dialog-description">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription id="announcement-dialog-description">
              Create a new announcement for your students. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4" noValidate>
            {/* Title */}
            <div>
              <Label htmlFor="title">Announcement Title <span aria-label="required">*</span></Label>
              <Input
                id="title"
                maxLength={100}
                {...register("title")}
                onChange={(e) => {
                  setTitleCharCount(e.target.value.length);
                  setValue("title", e.target.value, { shouldValidate: true });
                }}
                placeholder="Enter title"
                aria-required="true"
                aria-invalid={errors.title ? "true" : "false"}
                aria-describedby={errors.title ? "title-error title-count" : "title-count"}
                className={errors.title ? "border-red-500 focus:ring-red-500" : ""}
              />
              <div id="title-count" className="text-sm text-gray-600 text-right mt-1" aria-live="polite">
                {titleCharCount}/100 characters
              </div>
              {errors.title && <p id="title-error" className="text-sm text-red-700 font-medium mt-1" role="alert">{errors.title.message}</p>}
            </div>

            {/* Course Selection */}
            <div>
              <Label htmlFor="course-select">Select Course <span aria-label="required">*</span></Label>
              <Select
                onValueChange={(value) => setValue("courseId", value, { shouldValidate: true })}
                disabled={loading}
              >
                <SelectTrigger
                  id="course-select"
                  aria-required="true"
                  aria-invalid={errors.courseId ? "true" : "false"}
                  aria-describedby={errors.courseId ? "course-error" : undefined}
                  className={errors.courseId ? "border-red-500 focus:ring-red-500" : ""}
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                  ) : allCourses.length === 0 ? (
                    <SelectItem value="no-courses" disabled>No courses available</SelectItem>
                  ) : (
                    allCourses.map((course) => <SelectItem key={course._id} value={course._id}>{course.courseTitle || "Untitled Course"}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
              {errors.courseId && <p id="course-error" className="text-sm text-red-700 font-medium mt-1" role="alert">{errors.courseId.message}</p>}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Announcement Message <span aria-label="required">*</span></Label>
              <Textarea
                id="message"
                maxLength={500}
                rows={5}
                {...register("message")}
                onChange={(e) => {
                  setMessageCharCount(e.target.value.length);
                  setValue("message", e.target.value, { shouldValidate: true });
                }}
                placeholder="Enter message"
                aria-required="true"
                aria-invalid={errors.message ? "true" : "false"}
                aria-describedby={errors.message ? "message-error message-count" : "message-count"}
                className={errors.message ? "border-red-500 focus:ring-red-500" : ""}
              />
              <div id="message-count" className="text-sm text-gray-600 text-right mt-1" aria-live="polite">
                {messageCharCount}/500 characters
              </div>
              {errors.message && <p id="message-error" className="text-sm text-red-700 font-medium mt-1" role="alert">{errors.message.message}</p>}
            </div>

            {/* Links */}
            <div>
              <Label htmlFor="links">Links (comma separated)</Label>
              <Input id="links" {...register("links")} placeholder="Enter links separated by commas" />
            </div>

            {/* Attachments */}
            <div>
              <Label htmlFor="attachments">Attachments (max 5 files)</Label>
              <Input type="file" id="attachments" multiple onChange={handleFilesChange} />
              {(selectedFiles || []).length > 0 && (
                <ul className="mt-1 text-sm text-gray-700">
                  {selectedFiles.map((file, idx) => <li key={idx}>{file.name}</li>)}
                </ul>
              )}
              {errors.attachments && <p className="text-sm text-red-700 font-medium mt-1">{errors.attachments.message}</p>}
            </div>

            {/* Footer */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
