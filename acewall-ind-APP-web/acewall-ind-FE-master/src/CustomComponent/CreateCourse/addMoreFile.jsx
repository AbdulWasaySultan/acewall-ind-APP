"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

// Zod schema
const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "Only PDF files are allowed",
  });

const lessonSchema = z.object({
  pdfFiles: z
    .array(pdfFileSchema)
    .min(1, { message: "At least one PDF is required" })
    .refine(
      (files) =>
        files.reduce((acc, file) => acc + (file?.size || 0), 0) <=
        5 * 1024 * 1024,
      {
        message: "Total file size must not exceed 5MB",
      }
    ),
});

const AddMoreFile = ({ lessonId, fetchChapterDetail }) => {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [prevSizeMB, setPrevSizeMB] = useState(0);
  const [newSizeBytes, setNewSizeBytes] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      pdfFiles: [],
    },
  });

  const prevFiles = async () => {
    try {
      const res = await axiosInstance.get(
        `lesson/getallFilesofLesson/${lessonId}`
      );
      const sizeInMB = res.data.totalSizeinMB || 0;
      setPrevSizeMB(sizeInMB);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    prevFiles();
  }, []);

  const calculateTotalSize = (files) =>
    files.reduce((acc, f) => acc + (f?.size || 0), 0);

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    const updatedFiles = [...selectedFiles, file];
    const size = calculateTotalSize(updatedFiles);
    const totalSizeInMB = (prevSizeMB * 1024 * 1024 + size) / (1024 * 1024);

    if (totalSizeInMB > 5) {
      toast.error("Total size exceeds 5MB limit.");
      return;
    }

    setSelectedFiles(updatedFiles);
    setNewSizeBytes(size);
    setValue("pdfFiles", updatedFiles, { shouldValidate: true });
  };

  const handleRemoveFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    const size = calculateTotalSize(updated);
    setSelectedFiles(updated);
    setNewSizeBytes(size);
    setValue("pdfFiles", updated, { shouldValidate: true });
  };

  const onSubmit = async () => {
    setLoading(true);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("pdfFiles", file);
    });

    try {
      const res = await axiosInstance.put(
        `/lesson/addMoreFiles/${lessonId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message);
      reset();
      setSelectedFiles([]);
      fetchChapterDetail();
      prevFiles();
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
        <div className="flex items-center gap-1 text-blue-600 cursor-pointer">
          <Plus size={12} />
          <p className="text-sm">Add</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Files</DialogTitle>
          <DialogDescription>
            Upload only PDF files. Combined total must not exceed 5MB.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {/* File List */}
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <span className="text-sm text-gray-800 truncate max-w-[85%]">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-sm">
              Total size:{" "}
              {(parseFloat(prevSizeMB) + newSizeBytes / 1024 / 1024).toFixed(2)}{" "}
              MB / 5 MB
            </p>

            {errors.pdfFiles && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pdfFiles.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedFiles([]);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Files"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoreFile;