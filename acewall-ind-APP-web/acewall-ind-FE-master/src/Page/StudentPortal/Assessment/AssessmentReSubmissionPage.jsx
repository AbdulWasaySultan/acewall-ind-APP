"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader, X } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import AssessmentResultCard from "@/CustomComponent/Assessment/AssessmentResultCard";
import { Input } from "@/components/ui/input";
import BackButton from "@/CustomComponent/BackButton";
import GoogleDriveUpload from "@/CustomComponent/GoogleDriveUpload";

const AssessmentReSubmissionPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const navigate = useNavigate();

  // Handle Google Drive files
  const handleDriveFiles = (newFiles) => {
    const newFilesSize = newFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const currentDriveSize = driveFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const localSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const totalSize = localSize + currentDriveSize + newFilesSize;

    if (totalSize > 5 * 1024 * 1024) {
      toast.error("Total file size must be less than 5MB");
      return;
    }

    if (files.length + driveFiles.length + newFiles.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    setDriveFiles((prev) => [...prev, ...newFiles]);
  };

  const removeDriveFile = (index) => {
    setDriveFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const invalidFiles = selectedFiles.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast.error(
        `${invalidFiles[0].name}: Only PDF and image files are allowed`,
      );
      return;
    }

    const newTotalFileSize =
      totalFileSize + selectedFiles.reduce((sum, file) => sum + file.size, 0);

    if (newTotalFileSize > 5 * 1024 * 1024) {
      toast.error("Total file size must be less than 5MB");
      return;
    }

    setTotalFileSize(newTotalFileSize);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemove = (index) => {
    const newTotalFileSize = totalFileSize - files[index].size;
    setTotalFileSize(newTotalFileSize);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await axiosInstance.get(`/assessment/resubmit/${id}`);
        setAssessment(res.data.assessment);

        console.log(res, "response int eh submission page");

        // If there's already a submission, set it and mark as submitted
        if (res.data.submission) {
          setResult(res.data.submission);
          setSubmitted(true);
        }
      } catch (err) {
        setError("Failed to load assessment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const createValidationSchema = (assessment) => {
    if (!assessment || !assessment.questions) return z.object({});
    const schemaShape = {};
    assessment.questions.forEach((question) => {
      const key = `question-${question._id}`;
      if (question.type === "mcq" || question.type === "truefalse") {
        schemaShape[key] = z.string().min(1, "Please select an answer");
      } else if (question.type === "qa") {
        schemaShape[key] = z.string().min(1, "Answer cannot be empty");
      }
    });
    return z.object(schemaShape);
  };

  const form = useForm({
    resolver: zodResolver(createValidationSchema(assessment)),
    defaultValues: { studentId: "" },
  });

  const onSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);

    let answers;
    const formData = new FormData();

    if (assessment.assessmentType === "file") {
      const totalFiles = files.length + driveFiles.length;
      if (totalFiles === 0) {
        toast.error("Please upload at least one file");
        setSubmitting(false);
        return;
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      // Append Google Drive files
      driveFiles.forEach((file, index) => {
        formData.append(`driveFile_${index}`, JSON.stringify(file));
      });

      const questionIds = assessment.questions.map((question) => question._id);
      formData.append("questionId", questionIds);
    } else {
      answers = assessment.questions.map((question) => ({
        questionId: question._id,
        selectedAnswer: data[`question-${question._id}`],
      }));
    }

    try {
      const res = await axiosInstance.post(
        `/assessmentSubmission/submission/v2/${assessment._id}?resubmission=true`,
        assessment.assessmentType === "file" ? formData : { answers },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const submission = res.data.submission;
      const isGraded = submission.graded;

      setSubmitted(true);
      setResult(submission);

      if (isGraded) {
        toast.success("Assessment graded and submitted successfully!");
      } else {
        toast.success("Submission recorded. Awaiting manual review.");
      }

      navigate(`/student/assessment`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        role="status"
        aria-live="polite"
      >
        <Loader
          className="h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Loading assessment...</span>
      </div>
    );
  }

  // Show error if assessment couldn't be loaded
  if (error && !assessment) {
    return (
      <Alert
        variant="destructive"
        className="max-w-md mx-auto mt-8"
        role="alert"
        aria-live="assertive"
      >
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show error if assessment not found
  if (!assessment && !result) {
    return (
      <Alert
        variant="destructive"
        className="max-w-md mx-auto mt-8"
        role="alert"
        aria-live="assertive"
      >
        <AlertDescription>Assessment not found</AlertDescription>
      </Alert>
    );
  }

  // console.log(submitted, "submitted");
  // console.log(result, "result");

  // Render the result card if we have a result
  if (submitted && result) {
    return <AssessmentResultCard submission={result} />;
  }

  // Main Form Rendering
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <Form {...form}>
        {/* Added aria-label for clear form context */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          aria-label={`Submit Assessment: ${assessment?.title || ""}`}
        >
          <Card>
            <CardHeader>
              <CardTitle>{assessment.title}</CardTitle>
              <CardDescription>{assessment.description}</CardDescription>
            </CardHeader>
            {/* Assessment Files Section (Accompanying materials) */}
            <section aria-labelledby="assessment-files-heading">
              {assessment.files && assessment.files.length > 0 && (
                <div className="flex items-center gap-2 mb-4 border rounded-lg w-40 p-4 ml-5">
                  <FileText className="text-green-500" aria-hidden="true" />
                  <span
                    className="text-sm font-medium text-gray-800"
                    id="assessment-files-heading"
                  >
                    {assessment.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        // Added aria-label for clear link purpose
                        aria-label={`Download accompanying file: ${file.filename}`}
                      >
                        {file.filename}
                      </a>
                    ))}
                  </span>
                </div>
              )}
            </section>
            <CardContent>
              <div className="space-y-6 ">
                {assessment?.questions?.map((question, index) => (
                  <Card key={question._id} className="border shadow-sm">
                    <CardHeader className="">
                      <div className="flex justify-between items-start">
                        {/* Title acts as the primary label for the section */}
                        <CardTitle
                          className="text-base"
                          id={`question-title-${question._id}`}
                        >
                          Question {index + 1}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          Points: {question.points}
                        </span>
                      </div>
                      <p
                        className="text-sm font-medium text-gray-800 mb-2"
                        dangerouslySetInnerHTML={{
                          __html: ` ${question.question}`,
                        }}
                        // Links the main question text to the title
                        aria-describedby={`question-title-${question._id}`}
                      />
                      <CardDescription className="text-base font-medium text-foreground mt-2">
                        {question.text}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* MCQ Question Type */}
                      {question.type === "mcq" && (
                        <FormField
                          control={form.control}
                          name={`question-${question._id}`}
                          render={({ field }) => (
                            // Added role=radiogroup and aria-labelledby for screen readers
                            <FormItem
                              role="radiogroup"
                              aria-labelledby={`question-title-${question._id}`}
                            >
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <RadioGroupItem
                                        value={option}
                                        id={`q${question._id}-opt${optIndex}`}
                                      />
                                      {/* Proper Label association with htmlFor */}
                                      <Label
                                        htmlFor={`q${question._id}-opt${optIndex}`}
                                      >
                                        {option}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* True/False Question Type */}
                      {question.type === "truefalse" && (
                        <FormField
                          control={form.control}
                          name={`question-${question._id}`}
                          render={({ field }) => (
                            // Added role=radiogroup and aria-labelledby for screen readers
                            <FormItem
                              role="radiogroup"
                              aria-labelledby={`question-title-${question._id}`}
                            >
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="true"
                                      id={`q${question._id}-true`}
                                    />
                                    <Label htmlFor={`q${question._id}-true`}>
                                      True
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="false"
                                      id={`q${question._id}-false`}
                                    />
                                    <Label htmlFor={`q${question._id}-false`}>
                                      False
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* QA (Textarea) Question Type */}
                      {question.type === "qa" && (
                        <FormField
                          control={form.control}
                          name={`question-${question._id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                {/* Added explicit ID and aria-labelledby linking to the question title */}
                                <Textarea
                                  placeholder="Type your answer here..."
                                  className="min-h-[120px]"
                                  {...field}
                                  id={`q${question._id}-qa-input`}
                                  aria-labelledby={`question-title-${question._id}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* File Upload Question Type */}
                      {question.type === "file" && (
                        <FormField
                          control={form.control}
                          name={`question-${question._id}`}
                          render={({ field }) => (
                            <FormItem>
                              {/* Attached Files for the Question */}
                              {(() => {
                                const localFiles = question.file || question.files || [];
                                const driveFiles = question.driveFile || question.driveFiles || [];
                                const hasFiles = localFiles.length > 0 || driveFiles.length > 0;
                                
                                if (!hasFiles) {
                                  return <p className="text-sm text-gray-500 italic mb-2">No reference files attached</p>;
                                }
                                
                                return (
                                  <>
                                    {localFiles.length > 0 && localFiles.map((file, index) => (
                                      <div
                                        key={`local-${index}`}
                                        className="flex items-center gap-2 mb-1 border p-2 w-fit rounded-lg bg-blue-50"
                                      >
                                        <FileText
                                          className="text-blue-500"
                                          aria-hidden="true"
                                        />
                                        <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          aria-label={`Download attached file: ${file.filename} for question ${index + 1}`}
                                        >
                                          {file.filename}
                                        </a>
                                      </div>
                                    ))}
                                    {driveFiles.length > 0 && driveFiles.map((file, index) => (
                                      <div
                                        key={`drive-${index}`}
                                        className="flex items-center gap-2 mb-1 border p-2 w-fit rounded-lg bg-green-50"
                                      >
                                        <FileText
                                          className="text-green-500"
                                          aria-hidden="true"
                                        />
                                        <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          aria-label={`Download Google Drive file: ${file.filename} for question ${index + 1}`}
                                        >
                                          {file.filename}
                                        </a>
                                      </div>
                                    ))}
                                  </>
                                );
                              })()}

                              <FormControl>
                                <section
                                  aria-labelledby={`question-title-${question._id}`}
                                >
                                  {/* Hidden Label for the file input to meet accessibility requirements */}
                                  <Label
                                    htmlFor={`q${question._id}-file-input`}
                                    className="sr-only" // Visually hidden but available to screen readers
                                  >
                                    File Upload for Question {index + 1}
                                  </Label>
                                  <Input
                                    type={"file"}
                                    onChange={(e) => {
                                      handleFileChange(e);
                                    }}
                                    multiple
                                    id={`q${question._id}-file-input`} // Linked to the hidden Label
                                  />
                                  <p
                                    className="text-xs text-muted-foreground mt-1"
                                    aria-live="polite"
                                  >
                                    Total file size:{" "}
                                    {(totalFileSize / (1024 * 1024)).toFixed(2)}{" "}
                                    MB (Max 5 MB).
                                  </p>

                                  {/* List of files pending upload */}
                                  {files.length > 0 && (
                                    // aria-live="polite" announces changes to the list of uploaded files
                                    <div
                                      className="flex flex-wrap gap-2 mt-4"
                                      aria-live="polite"
                                      aria-atomic="true"
                                    >
                                      {files.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 mb-1 border p-2 w-fit rounded-lg bg-blue-50"
                                        >
                                          <FileText
                                            className="text-red-500"
                                            aria-hidden="true"
                                          />
                                          <span>{file.name}</span>
                                          {/* Replaced X icon with an accessible button/interactable element */}
                                          <button
                                            type="button"
                                            onClick={() => handleRemove(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                            aria-label={`Remove file ${file.name}`}
                                          >
                                            <X size={16} aria-hidden="true" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Google Drive Upload */}
                                  <div className="pt-4 border-t border-gray-200 mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                      Or upload from Google Drive
                                    </p>
                                    <GoogleDriveUpload
                                      allowedTypes={["application/pdf", "image/*"]}
                                      maxFileSize={5 * 1024 * 1024}
                                      multiple={true}
                                      buttonLabel="Select from Google Drive"
                                      onUploadComplete={(uploadedFiles) =>
                                        handleDriveFiles(uploadedFiles)
                                      }
                                      onUploadError={(err) =>
                                        toast.error(err?.message || "Failed to upload from Google Drive")
                                      }
                                    />
                                  </div>

                                  {/* List of Google Drive files pending upload */}
                                  {driveFiles.length > 0 && (
                                    <div
                                      className="flex flex-wrap gap-2 mt-4"
                                      aria-live="polite"
                                      aria-atomic="true"
                                    >
                                      {driveFiles.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 mb-1 border p-2 w-fit rounded-lg bg-green-50"
                                        >
                                          <FileText
                                            className="text-green-500"
                                            aria-hidden="true"
                                          />
                                          <span>{file.filename}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeDriveFile(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                            aria-label={`Remove Google Drive file ${file.filename}`}
                                          >
                                            <X size={16} aria-hidden="true" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </section>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>

            {/* General Error Display */}
            {error && (
              // role="alert" and aria-live="assertive" ensures immediate announcement
              <Alert
                variant="destructive"
                className="mx-6 mb-4"
                role="alert"
                aria-live="assertive"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-500 hover:bg-green-600"
                // aria-live="polite" helps announce the change in status/label
                aria-live="polite"
              >
                {submitting ? (
                  <>
                    <Loader
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default AssessmentReSubmissionPage;
