"use client";

import { useState, useId, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash, AlertCircle, Info } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import JoditEditor from "jodit-react";
import AiContentModal from "../teacher/teacher/AiContentModal";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../BackButton";
import GoogleDriveUpload from "../GoogleDriveUpload";

// Zod schema
const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "Only PDF files are allowed",
  });

const lessonSchema = z.object({
  lessonTitle: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters"),
  lessonDescription: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(250000, "Description exceeds maximum length"),
  youtubeLinks: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) =>
        !val ||
        /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/)[\w-]{11}(&[^ ]*)?|youtu\.be\/[\w-]{11}(\?[^ ]*)?)$/.test(
          val,
        ),
      {
        message:
          "Enter a valid YouTube video link (e.g., https://youtube.com/watch?v=...)",
      },
    ),
  otherLink: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine((val) => !val || /^https?:\/\/.+$/.test(val), {
      message: "Must be a valid URL starting with http:// or https://",
    }),
  pdfFiles: z
    .array(pdfFileSchema)
    .optional()
    .refine(
      (files) =>
        !files ||
        files.reduce((acc, file) => acc + (file?.size || 0), 0) <=
          5 * 1024 * 1024,
      {
        message: "Total file size must not exceed 5MB",
      },
    ),
});

const AddLessonPage = ({ chapterID, fetchQuarterDetail }) => {
  const [pdfInputs, setPdfInputs] = useState([{ id: Date.now(), file: null }]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [driveFiles, setDriveFiles] = useState([]);

  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const youtubeFieldId = useId();
  const otherLinkFieldId = useId();
  const totalSizeId = useId();
  const editorRef = useRef(null);

  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 250000;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const { chapterId } = useParams();
  const navigate = useNavigate();

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 400,
      toolbarSticky: true,
      toolbarButtonSize: "middle",
      askBeforePasteHTML: true,
      askBeforePasteFromWord: true,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "superscript",
        "subscript",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "link",
        "table",
        "|",
        "align",
        "undo",
        "redo",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
        "source",
      ],
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      lessonTitle: "",
      lessonDescription: "",
      youtubeLinks: "",
      otherLink: "",
      pdfFiles: [],
    },
  });

  const calculateTotalSize = (files) =>
    files.reduce((acc, f) => acc + (f?.size || 0), 0);

  const handleFileChange = (id, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed. Please select a PDF.");
      return;
    }

    const updated = pdfInputs.map((input) =>
      input.id === id ? { ...input, file } : input,
    );

    const newSize = calculateTotalSize(updated.map((i) => i.file));
    if (newSize > MAX_FILE_SIZE) {
      toast.error("Total file size exceeds 5MB. Please remove some files.");
      return;
    }

    setPdfInputs(updated);
    setTotalSize(newSize);
    setValue("pdfFiles", updated.map((i) => i.file).filter(Boolean), {
      shouldValidate: true,
    });
    toast.success(`File "${file.name}" added successfully.`);
  };

  const handleAddField = () => {
    const currentTotal = calculateTotalSize(pdfInputs.map((i) => i.file));
    if (currentTotal >= MAX_FILE_SIZE) {
      toast.error("Cannot add more files. 5MB limit reached.");
      return;
    }
    setPdfInputs((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const handleRemoveField = (id) => {
    if (pdfInputs.length === 1) {
      toast.error("You must keep at least one file input field.");
      return;
    }
    const updated = pdfInputs.filter((input) => input.id !== id);
    const newSize = calculateTotalSize(updated.map((i) => i.file));
    setPdfInputs(updated);
    setTotalSize(newSize);
    setValue("pdfFiles", updated.map((i) => i.file).filter(Boolean), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", data.lessonTitle);
    formData.append("description", data.lessonDescription);
    formData.append("youtubeLinks", data.youtubeLinks || "");
    formData.append("otherLink", data.otherLink || "");
    formData.append("chapter", chapterId);

    pdfInputs
      .map((input) => input.file)
      .filter(Boolean)
      .forEach((file) => {
        formData.append("pdfFiles", file);
      });

    // Append Google Drive files
    driveFiles.forEach((file) => {
      formData.append("driveFiles", JSON.stringify(file));
    });

    try {
      const res = await axiosInstance.post("/lesson/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      navigate(`/teacher/courses/chapter/${chapterId}`);
      handleReset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setPdfInputs([{ id: Date.now(), file: null }]);
    setTitleValue("");
    setDescValue("");
    setTotalSize(0);
    setDriveFiles([]);
  };

  const handleEditorChange = useMemo(
    () => (newContent) => {
      setDescValue(newContent);
      setValue("lessonDescription", newContent, { shouldValidate: true });
    },
    [setValue],
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-lg border">
      <BackButton label="Back" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Lesson</h1>
        <div className="flex items-start gap-2 mt-2 text-gray-600">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            Create a lesson with title, description, and optional resources.
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Title Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={titleFieldId} className="font-medium text-gray-700">
              Lesson Title <span className="text-red-500">*</span>
            </Label>
            <AiContentModal
              aiResponse={aiResponse}
              setAiResponse={setAiResponse}
              usedfor="lessonTitle"
              setValue={setValue}
            />
          </div>
          <Input
            id={titleFieldId}
            placeholder="Enter a descriptive lesson title"
            {...register("lessonTitle")}
            value={titleValue}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => {
              const value = e.target.value;
              setTitleValue(value);
              setValue("lessonTitle", value, { shouldValidate: true });
            }}
          />
          <div className="flex justify-between">
            {errors.lessonTitle && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.lessonTitle.message}
              </p>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {titleValue.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={descriptionFieldId}
              className="font-medium text-gray-700"
            >
              Lesson Description <span className="text-red-500">*</span>
            </Label>
            <AiContentModal
              aiResponse={aiResponse}
              setAiResponse={setAiResponse}
              usedfor="lessonDescription"
              handleEditorChange={handleEditorChange}
            />
          </div>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <JoditEditor
              ref={editorRef}
              config={editorConfig}
              value={descValue}
              onBlur={handleEditorChange}
            />
          </div>
          <div className="flex justify-between">
            {errors.lessonDescription && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{" "}
                {errors.lessonDescription.message}
              </p>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {descValue.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* YouTube Link */}
        <div className="space-y-2">
          <Label htmlFor={youtubeFieldId}>
            YouTube Link{" "}
            <span className="text-gray-400 text-xs ml-1">(Optional)</span>
          </Label>
          <Input
            id={youtubeFieldId}
            placeholder="https://www.youtube.com/watch?v=..."
            {...register("youtubeLinks")}
          />
          {errors.youtubeLinks && (
            <p className="text-red-500 text-sm">
              {errors.youtubeLinks.message}
            </p>
          )}
        </div>

        {/* Other Link */}
        <div className="space-y-2">
          <Label htmlFor={otherLinkFieldId}>
            Other Resource Link{" "}
            <span className="text-gray-400 text-xs ml-1">(Optional)</span>
          </Label>
          <Input
            id={otherLinkFieldId}
            placeholder="https://example.com"
            {...register("otherLink")}
          />
          {errors.otherLink && (
            <p className="text-red-500 text-sm">{errors.otherLink.message}</p>
          )}
        </div>

        {/* PDF Files */}
        <div className="space-y-4">
          <Label>
            Lesson PDF Files{" "}
            <span className="text-gray-400 text-xs ml-1">
              (Optional, Max 5MB total)
            </span>
          </Label>
          <div className="grid gap-3">
            {pdfInputs.map((input, index) => (
              <div
                key={input.id}
                className="flex items-end gap-2 p-3 bg-gray-50 border rounded-md"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1 font-medium">
                    File {index + 1}{" "}
                    {input.file && (
                      <span className="text-green-600 ml-2">
                        ✓ {input.file.name}
                      </span>
                    )}
                  </p>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(input.id, e.target.files?.[0])
                    }
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveField(input.id)}
                  disabled={pdfInputs.length === 1 || loading}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddField}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another File
          </Button>

          {/* Google Drive Upload */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Or upload from Google Drive
            </p>
            <GoogleDriveUpload
              allowedTypes={["application/pdf"]}
              maxFileSize={MAX_FILE_SIZE}
              multiple={true}
              buttonLabel="Select PDF from Google Drive"
              onUploadComplete={(files) => {
                const newFiles = Array.isArray(files) ? files : [files];
                const currentTotal = totalSize + newFiles.reduce((acc, f) => acc + (f.size || 0), 0);
                if (currentTotal > MAX_FILE_SIZE) {
                  toast.error("Total file size would exceed 5MB limit.");
                  return;
                }
                setDriveFiles((prev) => [...prev, ...newFiles]);
                setTotalSize(currentTotal);
                toast.success(`${newFiles.length} PDF(s) added from Google Drive`);
              }}
              onUploadError={(err) => {
                toast.error(err?.message || "Failed to upload from Google Drive");
              }}
            />
            {driveFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Google Drive Files:</p>
                {driveFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm text-gray-700 truncate">{file.originalname || file.name}</span>
                      <span className="text-xs text-gray-500">({((file.size || 0) / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const removedSize = driveFiles[index]?.size || 0;
                        setDriveFiles((prev) => prev.filter((_, i) => i !== index));
                        setTotalSize((prev) => prev - removedSize);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
            <span className="text-sm font-medium">Total File Size:</span>
            <span
              className={`text-sm font-bold ${totalSize > MAX_FILE_SIZE * 0.8 ? "text-red-600" : "text-green-600"}`}
            >
              {(totalSize / 1024 / 1024).toFixed(2)} MB / 5 MB
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {loading ? "Adding Lesson..." : "Add Lesson"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLessonPage;
