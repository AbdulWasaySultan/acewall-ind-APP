import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader2, File, ArrowLeft } from "lucide-react";
import GoogleDriveUpload from "@/CustomComponent/GoogleDriveUpload";
import { useNavigate, useParams } from "react-router-dom";

const CreatePage = () => {
  const navigate = useNavigate();
  const { courseId, type, typeId } = useParams();

  const [isCreating, setIsCreating] = useState(false);
  const [pageData, setPageData] = useState({
    title: "",
    description: "",
    image: null,
    files: [],
  });
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveImage, setDriveImage] = useState(null);

  const handleCreatePage = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData();
    formData.append("title", pageData.title);
    formData.append("description", pageData.description);
    if (pageData.image) formData.append("image", pageData.image);
    pageData.files.forEach((file) => formData.append("files", file));
    if (driveFiles.length > 0) formData.append("driveFiles", JSON.stringify(driveFiles));
    if (driveImage) formData.append("driveImage", JSON.stringify(driveImage));

    try {
      await axiosInstance.post(
        `/pages/createpage/${courseId}/${type}/${typeId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Page created successfully!");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
        </div>

        <form onSubmit={handleCreatePage} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="page-title">
              Title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="page-title"
              type="text"
              required
              value={pageData.title}
              onChange={(e) =>
                setPageData({ ...pageData, title: e.target.value })
              }
              placeholder="Enter page title"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-desc">
              Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="page-desc"
              required
              value={pageData.description}
              onChange={(e) =>
                setPageData({ ...pageData, description: e.target.value })
              }
              placeholder="Enter page details"
              className="min-h-[150px]"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-image">
              Upload Image{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="page-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPageData({ ...pageData, image: e.target.files[0] })
              }
              aria-label="Upload an image for the page"
            />
            {/* Google Drive Image Upload */}
            <div className="mt-3">
              <GoogleDriveUpload
                onUploadComplete={(file) => {
                  setDriveImage(file);
                  toast.success(`Image added from Google Drive`);
                }}
                onUploadError={(error) => {
                  toast.error(error.message || "Failed to upload from Google Drive");
                }}
                multiple={false}
                buttonLabel="Add image from Google Drive"
                allowedTypes={["image/*"]}
              />
            </div>
            {/* Display Drive File */}
            {driveImage && (
              <div className="mt-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-blue-500" />
                    <span className="text-sm truncate max-w-[200px]">
                      {driveImage.filename}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Google Drive
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDriveImage(null)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-files">
              Upload PDF{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="page-files"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) =>
                setPageData({
                  ...pageData,
                  files: Array.from(e.target.files),
                })
              }
              aria-label="Upload documents for the page"
            />
            {/* Google Drive Files Upload */}
            <div className="mt-3">
              <GoogleDriveUpload
                onUploadComplete={(files) => {
                  const newFiles = Array.isArray(files) ? files : [files];
                  setDriveFiles((prev) => [...prev, ...newFiles]);
                  toast.success(`${newFiles.length} file(s) added from Google Drive`);
                }}
                onUploadError={(error) => {
                  toast.error(error.message || "Failed to upload from Google Drive");
                }}
                multiple={true}
                buttonLabel="Add PDFs from Google Drive"
                allowedTypes={["application/pdf"]}
              />
            </div>
            {/* Display Drive Files */}
            {driveFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {driveFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-blue-500" />
                      <span className="text-sm truncate max-w-[200px]">
                        {file.filename}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        Google Drive
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDriveFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                "Create Page"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
