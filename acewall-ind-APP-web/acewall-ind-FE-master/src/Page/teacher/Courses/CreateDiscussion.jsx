import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader2, File, Image, ArrowLeft, X } from "lucide-react";
import GoogleDriveUpload from "@/CustomComponent/GoogleDriveUpload";
import { useNavigate, useSearchParams } from "react-router-dom";
import StrictDatePicker from "@/CustomComponent/Assessment/DueDatePicker";
import CategoryDropdown from "@/CustomComponent/Assessment/Assessment-category-dropdown";
import { FormProvider, useForm } from "react-hook-form";

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const typeId = searchParams.get("typeId");
  const courseId = searchParams.get("course");
  const semester = searchParams.get("semester");
  const quarter = searchParams.get("quarter");

  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [files, setFiles] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const form = useForm({
    defaultValues: {
      topic: "",
      description: "",
      totalPoints: "0",
      category: "",
      dueDate: null,
    },
  });

  // Register category field with validation
  useEffect(() => {
    form.register("category", { required: "Category is required" });
  }, [form]);

  // Watch form values for character count
  const descriptionValue = form.watch("description") || "";

  useEffect(() => {
    const fetchQuarterDate = async () => {
      if (quarter && quarter !== "undefined") {
        try {
          const res = await axiosInstance.get(`quarter/getDatesofQuarter/${quarter}`);
          setStartDate(res.data.startDate);
          setEndDate(res.data.endDate);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchQuarterDate();
  }, [quarter]);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await axiosInstance.get("/course/getVerifiedCourses");
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      }
    };
    getCourses();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    const validFiles = selectedFiles.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PNG, JPEG, JPG, and PDF files are allowed.`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size must not exceed 2MB.`);
        return false;
      }
      return true;
    });

    const totalFiles = files.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error("You can only upload a maximum of 5 files.");
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const removeDriveFile = (index) => {
    setDriveFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.category) {
      toast.error("Please select a category");
      return;
    }

    setIsCreating(true);

    const formData = new FormData();
    formData.append("course", courseId);
    formData.append("topic", data.topic);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("type", type);
    formData.append("dueDate", JSON.stringify(data.dueDate));
    formData.append("totalMarks", data.totalPoints || "0");

    if (semester && semester !== "undefined" && quarter && quarter !== "undefined") {
      formData.append("semester", semester);
      formData.append("quarter", quarter);
    }

    if (type === "chapter") {
      formData.append("chapter", typeId);
    }
    if (type === "lesson") {
      formData.append("lesson", typeId);
    }

    if (files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }
    if (driveFiles.length > 0) {
      formData.append("driveFiles", JSON.stringify(driveFiles));
    }

    try {
      await axiosInstance.post("/discussion/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Discussion created successfully");
      navigate(-1);
    } catch (err) {
      console.log(err);
      toast.error("Failed to create discussion");
    } finally {
      setIsCreating(false);
    }
  };

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const minDate = parsedStartDate < parsedEndDate ? parsedStartDate : parsedEndDate;
  const maxDate = parsedEndDate > parsedStartDate ? parsedEndDate : parsedStartDate;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Discussion</h1>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic <span className="text-red-600">*</span>
              </Label>
              <Input
                id="topic"
                {...form.register("topic", { required: "Topic is required" })}
                placeholder="Enter discussion topic"
              />
              {form.formState.errors.topic && (
                <p className="text-xs text-red-500">{form.formState.errors.topic.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="description"
                rows={4}
                maxLength={2000}
                {...form.register("description", { required: "Description is required" })}
                placeholder="Enter discussion description"
              />
              <p className="text-xs text-gray-500 text-right">
                Characters left: {2000 - descriptionValue.length}
              </p>
            </div>

            {/* Three columns: Total Points, Category, Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPoints">Total Points</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  {...form.register("totalPoints")}
                  placeholder="Enter points"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-600">*</span>
                </Label>
                <CategoryDropdown
                  courseId={courseId}
                  value={form.watch("category")}
                  onValueChange={(val) => form.setValue("category", val, { shouldValidate: true })}
                  error={form.formState.errors.category}
                />
                {form.formState.errors.category && (
                  <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label id="due-date-label">Due Date</Label>
                <div aria-labelledby="due-date-label">
                  <StrictDatePicker
                    name="dueDate"
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>
              </div>
            </div>

          {/* File Upload - Images and PDFs */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Attach Files{" "}
              <span className="text-xs font-normal text-gray-500">
                (Images & PDFs up to 2MB, max 5 files)
              </span>
            </Label>
            <Input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.pdf,image/*"
              multiple
            />

            {/* Google Drive Upload - Images and PDFs */}
            <div className="mt-3">
              <GoogleDriveUpload
                onUploadComplete={(newFiles) => {
                  const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
                  const totalFiles = driveFiles.length + filesArray.length;
                  if (totalFiles > 5) {
                    toast.error("You can only upload a maximum of 5 files.");
                    return;
                  }
                  setDriveFiles((prev) => [...prev, ...filesArray]);
                  toast.success(`${filesArray.length} file(s) added from Google Drive`);
                }}
                onUploadError={(error) => {
                  toast.error(error.message || "Failed to upload from Google Drive");
                }}
                allowedTypes={["image/*", "application/pdf"]}
                maxFileSize={2 * 1024 * 1024}
                multiple={true}
                buttonLabel="Add from Google Drive"
              />
            </div>

            {/* File List */}
            <div className="flex flex-col gap-2 mt-3">
              {/* Local files */}
              {files.map((file, index) => (
                <div
                  key={`local-${index}`}
                  className="border p-3 rounded-lg border-gray-300 flex items-center justify-between bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {file.type === "application/pdf" ? (
                      <File className="text-green-500 w-4 h-4" />
                    ) : (
                      <Image className="text-green-500 w-4 h-4" />
                    )}
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}

              {/* Google Drive files */}
              {driveFiles.map((file, index) => (
                <div
                  key={`drive-${index}`}
                  className="border p-3 rounded-lg border-blue-300 flex items-center justify-between bg-blue-50"
                >
                  <div className="flex items-center gap-2">
                    <File className="text-blue-500 w-4 h-4" />
                    <span className="text-sm truncate max-w-[200px]">
                      {file.filename}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Google Drive
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDriveFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 text-white hover:bg-green-700 flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Discussion"
              )}
            </Button>
          </div>
        </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateDiscussion;
