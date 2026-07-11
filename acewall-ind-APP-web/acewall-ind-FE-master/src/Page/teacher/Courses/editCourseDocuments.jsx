import React, { useState, useContext, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText, Upload, X, Download, Eye, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";

// Define the form schema
const documentsSchema = z.object({
  courseType: z.enum(["credit", "non-credit"]).optional(),
  documents: z
    .object({
      governmentId: z.any().optional(),
      resume: z.any().optional(),
      certificate: z.any().optional(),
      transcript: z.any().optional(),
    })
    .optional(),
});

function DocumentUploadField({
  label,
  name,
  required,
  currentDocument,
  onFileChange,
  error,
  newFile,
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(file, "file");

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPEG, JPG, and PNG files are allowed.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    onFileChange(name, file);
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    onFileChange(name, null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Current Document Display */}
      {currentDocument && !newFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentDocument.filename}
                </p>
                <p className="text-xs text-gray-500">
                  Uploaded on{" "}
                  {new Date(currentDocument.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(currentDocument.url, "_blank")}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New File Display */}
      {newFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">
                  {newFile.name}
                </p>
                <p className="text-xs text-blue-600">
                  {formatFileSize(newFile.size)} • New file selected
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="relative">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <div className="text-sm text-gray-600 mb-2">
                <label
                  htmlFor={`file-${name}`}
                  className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                >
                  Choose file
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PDF, JPEG, JPG, PNG up to 5MB
              </p>
            </>
          )}
        </div>

        <input
          id={`file-${name}`}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>


      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}

export default function CourseDocumentsEdit() {
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(""); // Replace with actual course context
  const [newFiles, setNewFiles] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  console.log(newFiles, "newFiles");

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      courseType: course.courseType,
      documents: {},
    },
  });

  console.log(errors, "errors");
  const watchedCourseType = watch("courseType");

  const handleFileChange = (documentType, file) => {
    setNewFiles((prev) => ({
      ...prev,
      [documentType]: file,
    }));
    setValue(`documents.${documentType}`, file, { shouldValidate: true });
    // setValue("courseType", watchedCourseType, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Only append files that have been changed
      Object.entries(newFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      // Map form data for inspection
      const mappedData = {
        courseType: data.courseType,
        documents: Object.entries(data.documents).reduce((acc, [key, file]) => {
          acc[key] = file ? file.name : null;
          return acc;
        }, {}),
      };

      console.log("Mapped Form Data:", mappedData);

      // Mock API call
      await axiosInstance
        .put(`course/editCourseDocuments/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          navigate(`/teacher/courses/courseDetail/${id}`);
          toast.success("Documents updated successfully!");
        })
        .catch((err) => {
          console.error(err);
          toast.error(" Failed to update documents. Please try again.");
        });

      setNewFiles({});
    } catch (error) {
      toast.error("Failed to update documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequiredDocuments = async () => {
    await axiosInstance
      .get(`course/getCourseDocuments/${id}`)
      .then((res) => {
        setValue("courseType", res.data.courseType);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchRequiredDocuments();
  }, []);

  const getRequiredDocuments = () => {
    if (watchedCourseType === "credit") {
      return ["governmentId", "resume", "certificate", "transcript"];
    } else {
      return ["resume", "certificate"];
    }
  };

  const documentLabels = {
    governmentId: "Government ID",
    resume: "Resume",
    certificate: "Certificate",
    transcript: "Transcript",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Edit Course Documents
        </h1>
        <p className="text-gray-600">
          Update or replace your course documents. All changes will be reviewed
          before approval.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Course Documents</span>
            <span className="text-sm font-normal text-gray-500">
              (
              {watchedCourseType === "credit"
                ? "Credit Course"
                : "Non-Credit Course"}
              )
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8">
              {getRequiredDocuments().map((docType) => (
                <DocumentUploadField
                  key={docType}
                  label={documentLabels[docType]}
                  name={docType}
                  required={true}
                  currentDocument={course.documents?.[docType]}
                  onFileChange={handleFileChange}
                  error={errors.documents?.[docType]}
                  newFile={newFiles[docType]}
                />
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewFiles({});
                  // Reset form
                }}
              >
                Cancel Changes
              </Button>
              <Button
                type="submit"
                disabled={loading || Object.keys(newFiles).length === 0}
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit(onSubmit)}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Documents"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">Document Requirements</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• All documents must be in PDF, JPEG, JPG, or PNG format</p>
            <p>• Maximum file size: 5MB per document</p>
            <p>• Documents should be clear and legible</p>
            <p>
              • Credit courses require: Government ID, Resume, Certificate, and
              Transcript
            </p>
            <p>• Non-credit courses require: Resume and Certificate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
