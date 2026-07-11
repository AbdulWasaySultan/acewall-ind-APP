"use client";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  FileText,
  HelpCircle,
  ImageIcon,
  Upload,
} from "lucide-react";
import JoditEditor from "jodit-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CategoryDropdown from "@/CustomComponent/Assessment/Assessment-category-dropdown";
import StrictDatePicker from "@/CustomComponent/Assessment/DueDatePicker";
import AiContentModal from "@/CustomComponent/teacher/teacher/AiContentModal";
import BackButton from "@/CustomComponent/BackButton";
import GoogleDriveUpload from "@/CustomComponent/GoogleDriveUpload";

// Define the form schema with Zod
const optionSchema = z.string().min(1, { message: "Option cannot be empty" });

const baseQuestionSchema = z.object({
  type: z.enum(["mcq", "truefalse", "qa", "file"], {
    required_error: "Please select a question type",
  }),
});

const mcqQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("mcq"),
  question: z
    .string()
    .min(1, { message: "Question must be at least 1 characters" }),
  concept: z
    .string()
    .min(1, { message: "Concept must be at least 1 characters" }),
  options: z
    .array(optionSchema)
    .min(2, { message: "At least 2 options are required" })
    .max(4, { message: "Maximum 4 options are allowed" }),
  correctAnswer: z
    .string()
    .min(1, { message: "Please select the correct answer" }),
  points: z.number({ required_error: "Points are required" }).min(1).max(999),
});

const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("truefalse"),
  question: z
    .string()
    .min(1, { message: "Question must be at least 1 characters" }),
  concept: z
    .string()
    .min(1, { message: "Concept must be at least 1 characters" }),
  correctAnswer: z.enum(["true", "false"], {
    required_error: "Please select the correct answer",
  }),
  points: z.number().min(1).max(999),
});

const qaQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("qa"),
  question: z
    .string()
    .min(5, { message: "Question must be at least 5 characters" }),
  concept: z
    .string()
    .min(1, { message: "Concept must be at least 1 characters" }),
  points: z.number().min(1).max(999),
});

// New file question schema for PDF/Image uploads (local or Google Drive)
const fileQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("file"),
  question: z.string().optional(),
  files: z
    .array(
      z
        .any()
        .refine((file) => file instanceof File, {
          message: "Please upload valid files",
        })
        .refine(
          (file) =>
            file?.type === "application/pdf" ||
            file?.type?.startsWith("image/"),
          {
            message: "Only PDF and image files are allowed",
          },
        ),
    )
    .max(5, { message: "Maximum 5 files are allowed" })
    .optional()
    .default([]),
  driveFiles: z
    .array(z.any())
    .max(5, { message: "Maximum 5 Google Drive files are allowed" })
    .optional()
    .default([]),
  concept: z
    .string()
    .min(1, { message: "Concept must be at least 1 characters" }),
  points: z.number().min(1).max(999),
});

const questionSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  trueFalseQuestionSchema,
  qaQuestionSchema,
  fileQuestionSchema,
]);

const dueDateSchema = z.object({
  dateTime: z
    .preprocess(
      (val) =>
        typeof val === "string" || val instanceof Date ? new Date(val) : val,
      z.date({
        required_error: "Due date is required",
        invalid_type_error: "Invalid date format",
      }),
    )
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: "Please select a valid due date",
    }),
});

// Updated form schema - now only question-based since files are handled as questions
const formSchema = z
  .object({
    assessmentTitle: z
      .string()
      .min(1, { message: "Title must be at least 1 characters" })
      .max(120, { message: "Title cannot exceed 120 characters" }),
    assessmentDescription: z
      .string()
      .min(1, { message: "Description must be at least 1 characters" })
      .max(1000, { message: "Description cannot exceed 1000 characters" }),
    category: z.string().min(1, { message: "Please select a category" }),
    dueDate: dueDateSchema,
    assessmentType: z.enum(["question", "file"], {
      required_error: "Please select assessment type",
    }),
    questions: z
      .array(questionSchema)
      .min(1, { message: "At least one question is required" }),
    isFinalAssessment: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.assessmentType === "file" && data.questions.length > 1) {
      ctx.addIssue({
        path: ["questions"],
        code: z.ZodIssueCode.custom,
        message: "File-based assessments can only have one upload question",
      });
    }

    // Validate file questions have at least one file (local or drive)
    data.questions.forEach((question, index) => {
      if (question.type === "file") {
        const localCount = question.files?.length || 0;
        const driveCount = question.driveFiles?.length || 0;
        const totalCount = localCount + driveCount;

        if (totalCount === 0) {
          ctx.addIssue({
            path: ["questions", index, "files"],
            code: z.ZodIssueCode.custom,
            message: "At least 1 file is required (from computer or Google Drive)",
          });
        }

        if (totalCount > 5) {
          ctx.addIssue({
            path: ["questions", index, "files"],
            code: z.ZodIssueCode.custom,
            message: "Maximum 5 files allowed in total",
          });
        }

        // Check total size across both local and drive files
        const localSize = question.files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
        const driveSize = question.driveFiles?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
        const totalSize = localSize + driveSize;

        if (totalSize > 5 * 1024 * 1024) {
          ctx.addIssue({
            path: ["questions", index, "files"],
            code: z.ZodIssueCode.custom,
            message: "Total file size must be less than 5MB",
          });
        }
      }
    });
  });

export default function CreateAssessmentPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [assessmentType, setAssessmentType] = useState("question");
  const [aiResponse, setAiResponse] = useState("");
  const { type, courseId, id } = useParams();
  const [searchParams] = useSearchParams();
  const TITLE_LIMIT = 120;
  const DESC_LIMIT = 1000;

  const [editorConfig] = useState({
    readonly: false,
    height: 200,
    toolbar: true,
    uploader: {
      insertImageAsBase64URI: true,
    },
  });

  const semester = searchParams.get("semester");
  const quarter = searchParams.get("quarter");

  const fetchQuarterDate = async () => {
    await axiosInstance
      .get(`quarter/getDatesofQuarter/${quarter}`)
      .then((res) => {
        setStartDate(res.data.startDate);
        setEndDate(res.data.endDate);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (quarter === "undefined") {
      setStartDate(null);
      setEndDate(null);
    } else {
      fetchQuarterDate();
    }
  }, []);

  const today = new Date();
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  // minDate becomes the later of "today" or "quarter start"
  const minDate = parsedStartDate > today ? parsedStartDate : today;
  const maxDate = parsedEndDate;

  // Optional: prevent user error if quarter data is incorrect
  if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
    console.warn("Invalid start or end date for the quarter.");
  }

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assessmentTitle: "",
      assessmentDescription: "",
      category: "",
      assessmentType: "question",
      questions: [],
      dueDate: {
        date: "",
        time: "",
        dateTime: null,
      },
      isFinalAssessment: false,
    },
  });

  const [finalAssessmentExists, setFinalAssessmentExists] = useState(false);

  useEffect(() => {
    const checkFinal = async () => {
      try {
        const res = await axiosInstance.get(
          `assessment/final-assessment/course/${courseId}`,
        );
        setFinalAssessmentExists(res.data.exists);
      } catch (err) {
        console.error("Error checking final assessment:", err);
      }
    };
    if (courseId) checkFinal();
  }, [courseId]);

  console.log(form.formState.errors, "form");

  // Use fieldArray to handle the dynamic questions array
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const addQuestion = () => {
    append({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
  };

  const addFileQuestion = () => {
    append({
      type: "file",
      question: "",
      files: [],
      driveFiles: [],
      points: 1,
    });
  };

  useEffect(() => {
    if (assessmentType === "question" && fields.length === 0) {
      addQuestion();
    } else if (assessmentType === "file" && fields.length === 0) {
      addFileQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentType, fields.length]);

  const removeQuestion = (index) => {
    // For file-based assessments, don't allow removing the only question
    if (assessmentType === "file" && fields.length <= 1) return;
    // For question-based assessments, don't allow removing if only one question
    if (assessmentType === "question" && fields.length <= 1) return;
    remove(index);
  };

  const moveQuestion = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    move(index, newIndex);
  };

  const addOption = (questionIndex) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length < 4) {
      form.setValue(`questions.${questionIndex}.options`, [
        ...currentOptions,
        "",
      ]);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length > 2) {
      const newOptions = [...currentOptions];
      newOptions.splice(optionIndex, 1);
      form.setValue(`questions.${questionIndex}.options`, newOptions);
    }
  };
  const handleAssessmentTypeChange = (newType) => {
    setAssessmentType(newType);
    form.setValue("assessmentType", newType);

    // Clear questions and add appropriate default
    form.setValue("questions", []);
    if (newType === "question") {
      setTimeout(() => addQuestion(), 0);
    } else if (newType === "file") {
      setTimeout(() => {
        if (fields.length === 0) addFileQuestion();
      }, 0);
    }
  };

  const handleFileChange = (questionIndex, files) => {
    const fileArray = Array.from(files);

    // Validate file count
    if (fileArray.length > 5) {
      toast.error("Maximum 5 files are allowed");
      return;
    }

    // Validate file types and total size
    let totalSize = 0;
    const validFiles = [];

    for (const file of fileArray) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        toast.error(`${file.name}: Only PDF and image files are allowed`);
        return;
      }
      totalSize += file.size;
      validFiles.push(file);
    }

    if (totalSize > 5 * 1024 * 1024) {
      toast.error("Total file size must be less than 5MB");
      return;
    }

    form.setValue(`questions.${questionIndex}.files`, validFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeFile = (questionIndex, fileIndex) => {
    const currentFiles =
      form.getValues(`questions.${questionIndex}.files`) || [];
    const newFiles = [...currentFiles];
    newFiles.splice(fileIndex, 1);
    form.setValue(`questions.${questionIndex}.files`, newFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleDriveFiles = (questionIndex, files) => {
    const newFiles = Array.isArray(files) ? files : [files];
    const currentFiles = form.getValues(`questions.${questionIndex}.files`) || [];
    const driveFiles = form.getValues(`questions.${questionIndex}.driveFiles`) || [];

    // Calculate total size including existing files
    const currentSize = currentFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const driveSize = driveFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const newSize = newFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const totalSize = currentSize + driveSize + newSize;

    if (totalSize > 5 * 1024 * 1024) {
      toast.error("Total file size would exceed 5MB limit");
      return;
    }

    if (currentFiles.length + driveFiles.length + newFiles.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    form.setValue(`questions.${questionIndex}.driveFiles`, [...driveFiles, ...newFiles], {
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.success(`${newFiles.length} file(s) added from Google Drive`);
  };

  const removeDriveFile = (questionIndex, fileIndex) => {
    const currentFiles = form.getValues(`questions.${questionIndex}.driveFiles`) || [];
    const newFiles = [...currentFiles];
    newFiles.splice(fileIndex, 1);
    form.setValue(`questions.${questionIndex}.driveFiles`, newFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Creating assessment...");

    try {
      const formData = new FormData();
      formData.append("title", data.assessmentTitle);
      formData.append("description", data.assessmentDescription);
      formData.append("category", data.category);
      formData.append("assessmentType", data.assessmentType);
      formData.append(type, id);

      // ✅ Validate and apply due date
      const dueDate = new Date(data.dueDate.dateTime);

      if (isNaN(dueDate)) {
        toast.error("Please select a valid due date.", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // ✅ Enforce due date within quarter range
      if (startDate && endDate) {
        if (dueDate < minDate || dueDate > maxDate) {
          toast.error(
            `Due date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()} (Quarter duration).`,
            { id: toastId },
          );
          setIsSubmitting(false);
          return;
        }
      }

      formData.append("dueDate", dueDate.toISOString());

      // ========================
      // Process questions
      // ========================
      const processedQuestions = data.questions.map((question, index) => {
        if (question.type === "file") {
          return {
            type: "file",
            question: question.question || `File Upload Question ${index + 1}`,
            points: question.points,
            fileCount: question.files.length,
          };
        }
        return question;
      });

      formData.append("questions", JSON.stringify(processedQuestions));

      // Attach files if any
      data.questions.forEach((question, questionIndex) => {
        if (question.type === "file" && question.files) {
          question.files.forEach((file, fileIndex) => {
            formData.append(
              `question_${questionIndex}_file_${fileIndex}`,
              file,
            );
          });
        }
        // Attach drive files metadata
        if (question.type === "file" && question.driveFiles) {
          question.driveFiles.forEach((file, fileIndex) => {
            formData.append(
              `question_${questionIndex}_driveFile_${fileIndex}`,
              JSON.stringify(file),
            );
          });
        }
      });

      if (semester) formData.append("semester", semester);
      if (quarter) formData.append("quarter", quarter);

      let finalType;
      if (data.isFinalAssessment) {
        finalType = "final-assessment";
      } else if (type === "lesson") {
        finalType = "lesson-assessment";
      } else if (type === "chapter") {
        finalType = "chapter-assessment";
      } else {
        finalType = "lesson-assessment"; // default fallback
      }
      formData.append("type", finalType);

      // Debug log
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Submit the form
      const res = await axiosInstance.post(
        "assessment/createAssessment/updated",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success(res.data.message, { id: toastId });
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to create assessment",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg max-w-4xl">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
      </div>

      <h2 id="main-content" className="text-2xl font-bold mb-4">
        Create New Assessment
      </h2>
      <p className="text-gray-600 mb-6">
        Create a new Assessment for students.
      </p>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="form-announcements"
      >
        {/* This will be used for screen reader announcements */}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Assessment Type Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Assessment Type</Label>
            <div
              className="grid grid-cols-2 gap-4 mt-3"
              role="radiogroup"
              aria-labelledby="assessment-type-label"
            >
              <div
                role="radio"
                aria-checked={assessmentType === "question"}
                tabIndex={0}
                className={`cursor-pointer transition-all rounded-lg ${
                  assessmentType === "question"
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border-2 border-gray-200 hover:border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleAssessmentTypeChange("question")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAssessmentTypeChange("question");
                  }
                }}
              >
                <CardContent className="p-4 text-center">
                  <HelpCircle
                    className="h-8 w-8 mx-auto mb-2 text-blue-600"
                    aria-hidden="true"
                  />
                  <h3 className="font-medium">Question-Based</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Create custom questions (MCQ, True/False, Q&A)
                  </p>
                </CardContent>
              </div>

              <div
                role="radio"
                aria-checked={assessmentType === "file"}
                tabIndex={0}
                className={`cursor-pointer transition-all rounded-lg ${
                  assessmentType === "file"
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border-2 border-gray-200 hover:border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleAssessmentTypeChange("file")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAssessmentTypeChange("file");
                  }
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center gap-2 mb-2">
                    <FileText
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                    <ImageIcon
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-medium">File-Based</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Upload PDF files or images (1-5 files, max 5MB total)
                  </p>
                </CardContent>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="isFinalAssessment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={finalAssessmentExists && !field.value}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Mark as Final Assessment (End of Course)
                  </FormLabel>
                  {finalAssessmentExists && !field.value && (
                    <p className="text-sm text-amber-600">
                      A final assessment already exists for this course.
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />

          {/* Basic Information */}
          <div className="grid gap-4">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="assessmentTitle"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Assessment Title</FormLabel>

                    <AiContentModal
                      aiResponse={aiResponse}
                      setAiResponse={setAiResponse}
                      usedfor="assessmentTitle"
                      setValue={form.setValue}
                    />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={TITLE_LIMIT}
                      onChange={(e) => {
                        if (e.target.value.length <= TITLE_LIMIT) {
                          field.onChange(e);
                        }
                      }}
                      placeholder="Enter Assessment title"
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground text-right">
                    {field.value.length}/{TITLE_LIMIT}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="assessmentDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                    <AiContentModal
                      aiResponse={aiResponse}
                      setAiResponse={setAiResponse}
                      usedfor="assessmentDescription"
                      setValue={form.setValue}
                    />
                  </div>

                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={DESC_LIMIT}
                      onChange={(e) => {
                        if (e.target.value.length <= DESC_LIMIT) {
                          field.onChange(e);
                        }
                      }}
                      placeholder="Enter description and instructions"
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground text-right">
                    {field.value.length}/{DESC_LIMIT}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryDropdown
                      courseId={courseId}
                      value={field.value}
                      onValueChange={field.onChange}
                      error={form.formState.errors.category?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Due Date</h3>
            {startDate && endDate ? (
              <StrictDatePicker
                name="dueDate"
                minDate={minDate}
                maxDate={maxDate}
              />
            ) : (
              <StrictDatePicker name="dueDate" />
            )}
          </div>
          {form.formState.errors.dueDate && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.dueDate.dateTime.message}
            </p>
          )}

          {/* Questions Section */}
          {fields.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {assessmentType === "file" ? "File Uploads" : "Questions"}
              </h3>
              {fields.map((question, questionIndex) => (
                <Card key={question.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {assessmentType === "file"
                          ? `File Upload ${questionIndex + 1}`
                          : `Question ${questionIndex + 1}`}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveQuestion(questionIndex, "up")}
                          disabled={questionIndex === 0}
                          className="h-8 w-8 p-0"
                          aria-label={`Move question ${questionIndex + 1} up`}
                        >
                          <ChevronUp size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveQuestion(questionIndex, "down")}
                          disabled={questionIndex === fields.length - 1}
                          className="h-8 w-8 p-0"
                          aria-label={`Move question ${questionIndex + 1} down`}
                        >
                          <ChevronDown size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          disabled={
                            (assessmentType === "file" && fields.length <= 1) ||
                            (assessmentType === "question" &&
                              fields.length <= 1)
                          }
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          aria-label={`Delete question ${questionIndex + 1}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Question Type - only show for question-based assessments */}
                    {assessmentType === "question" && (
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mcq">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="truefalse">
                                  True/False
                                </SelectItem>
                                <SelectItem value="qa">
                                  Question & Answer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Points */}
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.points`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              max={999}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 1 && value <= 999) {
                                  field.onChange(value);
                                } else {
                                  field.onChange("");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.concept`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concept</FormLabel>
                          <FormControl>
                            <Textarea {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload Section */}
                    {form.watch(`questions.${questionIndex}.type`) ===
                      "file" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter instructions for file upload..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.files`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                id={`file-upload-label-${questionIndex}`}
                              >
                                Upload Files (PDF or Images, max 5MB total)
                              </FormLabel>
                              <FormControl>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-center w-full">
                                    <label
                                      htmlFor={`file-input-${questionIndex}`}
                                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                                      aria-labelledby={`file-upload-label-${questionIndex}`}
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload
                                          className="w-8 h-8 mb-4 text-gray-500"
                                          aria-hidden="true"
                                        />
                                        <p className="mb-2 text-sm text-gray-700">
                                          <span className="font-semibold">
                                            Click to upload
                                          </span>
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          PDF or Images (5MB max)
                                        </p>
                                      </div>
                                      <input
                                        id={`file-input-${questionIndex}`}
                                        type="file"
                                        multiple
                                        accept=".pdf,image/*"
                                        className="sr-only"
                                        onChange={(e) =>
                                          handleFileChange(
                                            questionIndex,
                                            e.target.files,
                                          )
                                        }
                                        aria-describedby={`file-help-${questionIndex}`}
                                      />
                                    </label>
                                  </div>
                                  <p
                                    id={`file-help-${questionIndex}`}
                                    className="text-xs text-gray-600 sr-only"
                                  >
                                    Upload up to 5 PDF or image files. Total
                                    size must be less than 5 megabytes.
                                  </p>

                                  {/* Display selected files */}
                                  {field.value && field.value.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        Selected Files:
                                      </p>
                                      {field.value.map((file, fileIndex) => (
                                        <div
                                          key={fileIndex}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-2">
                                            {file.type === "application/pdf" ? (
                                              <FileText className="h-5 w-5 text-red-600" />
                                            ) : (
                                              <ImageIcon className="h-5 w-5 text-blue-600" />
                                            )}
                                            <div>
                                              <p className="font-medium text-sm">
                                                {file.name}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                {formatFileSize(file.size)}
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeFile(
                                                questionIndex,
                                                fileIndex,
                                              )
                                            }
                                            aria-label={`Remove file ${file.name}`}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2
                                              size={16}
                                              aria-hidden="true"
                                            />
                                            <span className="sr-only">
                                              Remove
                                            </span>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Google Drive Upload */}
                                  <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                      Or upload from Google Drive
                                    </p>
                                    <GoogleDriveUpload
                                      allowedTypes={["application/pdf", "image/*"]}
                                      maxFileSize={5 * 1024 * 1024}
                                      multiple={true}
                                      buttonLabel="Select from Google Drive"
                                      onUploadComplete={(files) =>
                                        handleDriveFiles(questionIndex, files)
                                      }
                                      onUploadError={(err) =>
                                        toast.error(err?.message || "Failed to upload from Google Drive")
                                      }
                                    />
                                  </div>

                                  {/* Display Google Drive files */}
                                  <FormField
                                    control={form.control}
                                    name={`questions.${questionIndex}.driveFiles`}
                                    render={({ field: driveField }) => (
                                      <>
                                        {driveField.value && driveField.value.length > 0 && (
                                          <div className="space-y-2">
                                            <p className="text-sm font-medium text-green-700">
                                              Google Drive Files:
                                            </p>
                                            {driveField.value.map((file, fileIndex) => (
                                              <div
                                                key={fileIndex}
                                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                                              >
                                                <div className="flex items-center gap-2">
                                                  {file.type?.includes("pdf") ? (
                                                    <FileText className="h-5 w-5 text-red-600" />
                                                  ) : (
                                                    <ImageIcon className="h-5 w-5 text-blue-600" />
                                                  )}
                                                  <div>
                                                    <p className="font-medium text-sm">
                                                      {file.filename || file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                      {formatFileSize(file.size)}
                                                    </p>
                                                  </div>
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    removeDriveFile(
                                                      questionIndex,
                                                      fileIndex,
                                                    )
                                                  }
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <Trash2 size={16} />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  />

                                  {/* Total size display */}
                                  {(field.value?.length > 0 || form.watch(`questions.${questionIndex}.driveFiles`)?.length > 0) && (
                                    <p className="text-xs text-gray-600 pt-2">
                                      Total size:{" "}
                                      {formatFileSize(
                                        (field.value || []).reduce(
                                          (sum, file) => sum + (file.size || 0),
                                          0,
                                        ) +
                                        (form.watch(`questions.${questionIndex}.driveFiles`) || []).reduce(
                                          (sum, file) => sum + (file.size || 0),
                                          0,
                                        ),
                                      )}{" "}
                                      / 5MB
                                    </p>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Regular Question Content */}
                    {form.watch(`questions.${questionIndex}.type`) !==
                      "file" && (
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex item-center justify-between">
                              <FormLabel>Question</FormLabel>
                              <AiContentModal
                                aiResponse={aiResponse}
                                setAiResponse={setAiResponse}
                                usedfor={`questions.${questionIndex}.question`}
                                questionType={form.watch(
                                  `questions.${questionIndex}.type`,
                                )}
                                setValue={form.setValue}
                              />
                            </div>
                            <FormControl>
                              <div className="border rounded-md">
                                <JoditEditor
                                  value={field.value}
                                  config={editorConfig}
                                  onBlur={field.onChange}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Question-specific answer fields */}
                    {form.watch(`questions.${questionIndex}.type`) ===
                      "truefalse" && (
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.correctAnswer`}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <fieldset>
                              <legend className="text-sm font-medium mb-3">
                                Correct Answer
                              </legend>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="true"
                                      id={`true-${question.id}`}
                                      aria-describedby={`true-desc-${question.id}`}
                                    />
                                    <Label
                                      htmlFor={`true-${question.id}`}
                                      className="font-normal cursor-pointer"
                                    >
                                      True
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="false"
                                      id={`false-${question.id}`}
                                      aria-describedby={`false-desc-${question.id}`}
                                    />
                                    <Label
                                      htmlFor={`false-${question.id}`}
                                      className="font-normal cursor-pointer"
                                    >
                                      False
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </fieldset>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* MCQ Options */}
                    {form.watch(`questions.${questionIndex}.type`) ===
                      "mcq" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Answer Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(questionIndex)}
                            disabled={
                              form.watch(`questions.${questionIndex}.options`)
                                ?.length >= 4
                            }
                            className="h-7 text-xs"
                          >
                            Add Option
                          </Button>
                        </div>
                        {form.watch(`questions.${questionIndex}.options`)
                          ?.length >= 4 && (
                          <p className="text-xs text-muted-foreground">
                            Maximum of 4 options allowed.
                          </p>
                        )}
                        <RadioGroup
                          value={form.watch(
                            `questions.${questionIndex}.correctAnswer`,
                          )}
                          onValueChange={(val) => {
                            form.setValue(
                              `questions.${questionIndex}.correctAnswer`,
                              val,
                            );
                          }}
                          className="space-y-3"
                        >
                          {form
                            .watch(`questions.${questionIndex}.options`)
                            ?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-3"
                              >
                                <RadioGroupItem
                                  value={
                                    form.watch(
                                      `questions.${questionIndex}.options.${optionIndex}`,
                                    ) || ""
                                  }
                                  id={`option-${questionIndex}-${optionIndex}`}
                                />
                                <FormField
                                  control={form.control}
                                  name={`questions.${questionIndex}.options.${optionIndex}`}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1"
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                      }}
                                    />
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeOption(questionIndex, optionIndex)
                                  }
                                  disabled={
                                    form.watch(
                                      `questions.${questionIndex}.options`,
                                    )?.length <= 2
                                  }
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                        </RadioGroup>
                        <FormMessage>
                          {
                            form.formState.errors.questions?.[questionIndex]
                              ?.options?.message
                          }
                        </FormMessage>
                        <FormMessage>
                          {
                            form.formState.errors.questions?.[questionIndex]
                              ?.correctAnswer?.message
                          }
                        </FormMessage>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {form.formState.errors.questions?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.questions.message}
            </p>
          )}

          {/* Add Question/File Button */}
          {assessmentType === "question" && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </div>
          )}

          {assessmentType === "file" && fields.length === 0 && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addFileQuestion}
                variant="outline"
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Plus size={16} />
                Add File Upload
              </Button>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
