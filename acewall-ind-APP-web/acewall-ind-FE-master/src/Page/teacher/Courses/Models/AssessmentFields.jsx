"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContext, useState } from "react";
import { CourseContext } from "@/Context/CoursesProvider";
import axios from "axios";

const AssessmentSchema = z.object({
  title: z.string().min(5, "Assessment title must be at least 5 characters"),
  description: z
    .string()
    .min(5, "Assessment description must be at least 5 characters"),
  pdfFiles: z.array(z.instanceof(File)).optional(), // Validate files as an array of File objects
});

export function AssessmentDialog({ id }) {
  const { course, setCourse } = useContext(CourseContext);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AssessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      pdfFiles: undefined,
    },
  });

  console.log(errors, "errors");

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setValue("pdfFiles", filesArray);
  };

  //   const handleLessonPDF = async (e) => {
  //     const files = e.target.files;
  //     if (!files || files.length === 0) return;
  //     if (e.target.files) {
  //       const fileArray = Array.from(e.target.files);
  //       setFiles(fileArray);
  //     }

  //     const uploadedUrls = [];

  //     for (const file of files) {
  //       const data = new FormData();
  //       data.append("file", file);
  //       data.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
  //       data.append("cloud_name", import.meta.env.VITE_CLOUD_NAME);

  //       try {
  //         const res = await axios.post(
  //           `https://api.cloudinary.com/v1_1/${
  //             import.meta.env.VITE_CLOUD_NAME
  //           }/auto/upload`,
  //           data
  //         );
  //         console.log(res.data.url, "res.data.url");

  //         uploadedUrls.push(res.data.url);
  //       } catch (err) {
  //         console.error("Error uploading file:", err);
  //       }
  //     }
  //     setValue("pdfFiles", uploadedUrls, { shouldValidate: true });
  //   };

  const onSubmit = (data) => {
    // Add the Assessment to the correct chapter
    setCourse((prev) => {
      const updatedChapters = (prev.chapters || []).map((chapter) => {
        if (chapter.id === id) {
          return {
            ...chapter,
            Assessment: data,
          };
        }
        return chapter;
      });

      return {
        ...prev,
        chapters: updatedChapters,
      };
    });

    // Cleanup
    setOpen(false);
    reset();
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Assessment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Assessment</DialogTitle>
            <DialogDescription>
              Create an Assessment with title, description, and PDF files.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Assessment Title</Label>
              <Input
                id="title"
                placeholder="Enter Assessment title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="min-h-[100px]"
                placeholder="Enter Assessment description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pdfFiles">PDF Files</Label>
              <Input
                id="pdfFiles"
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => {
                  handleFileChange(e);
                }}
              />
              {files.length > 0 && (
                <div className="text-sm text-gray-500">
                  {files.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
                setFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Assessment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
