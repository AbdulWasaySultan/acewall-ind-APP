import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileJson, 
  Upload, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { toast } from "react-hot-toast";
import { axiosInstance } from "@/lib/AxiosInstance";

const CourseImportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [previewData, setPreviewData] = useState(null);
  const [isImported, setIsImported] = useState(false); 
  const fileInputRef = useRef(null);

  // 1. Handle selection and local parsing for preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    if (selectedFile.type === "application/json" || selectedFile.name.endsWith('.json')) {
      setFile(selectedFile);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setPreviewData(json);
          toast.success("File parsed successfully");
        } catch (err) {
          console.error("JSON Parse Error:", err);
          toast.error("Invalid JSON format inside file");
          setFile(null);
          setPreviewData(null);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      toast.error("Please select a valid .json file");
    }
  };

  // 2. Process the Import
  const handleStartImport = async () => {
    if (!previewData) {
      toast.error("No data to import");
      return;
    }

    setLoading(true);
    try {
      // We send the previewData which is already a JavaScript object
      const response = await axiosInstance.post("/course/import-full-course", previewData);

      if (response.data.success) {
        setIsImported(true);
        toast.success("Course Created Successfully!");
      }
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(err.response?.data?.message || "Server Error during import");
    } finally {
      setLoading(false);
    }
  };

  const resetPage = () => {
    setFile(null);
    setPreviewData(null);
    setIsImported(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Course Importer</h1>
            <p className="text-gray-500 text-sm">Clone full courses using exported JSON data.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!isImported ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Upload Zone */}
            <div className="md:col-span-2 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer
                  ${file 
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-500/5' 
                    : 'border-gray-300 hover:border-blue-500 bg-white dark:bg-neutral-900 dark:border-neutral-800'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
                
                <div className="flex flex-col items-center">
                  {file ? (
                    <FileJson size={64} className="text-green-500 mb-4" />
                  ) : (
                    <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-full mb-4">
                      <Upload size={32} className="text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{file ? file.name : "Select Course JSON"}</h3>
                  <p className="text-gray-500 mt-2 text-sm">Click to browse or drag and drop files here</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <strong>Important:</strong> This process will replicate the entire course structure. Make sure you are using a JSON file exported from the "Course Tools" menu.
                </p>
              </div>
            </div>

            {/* Right: Summary Box */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border dark:border-neutral-800 shadow-sm h-fit">
              <h2 className="font-bold mb-4 border-b pb-2 dark:border-neutral-800 flex items-center gap-2">
                <History size={18} />
                Import Summary
              </h2>
              {previewData ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-400 block mb-1">Target Course Title:</span>
                    <p className="font-medium text-blue-600 leading-tight">{previewData.courseTitle}</p>
                  </div>
                  <div className="flex justify-between border-t pt-2 dark:border-neutral-800">
                    <span className="text-gray-500">Chapters:</span>
                    <b>{previewData.curriculum?.length || 0}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assessments:</span>
                    <b>{previewData.assessments?.length || 0}</b>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-500">Discussions:</span>
                    <b>{previewData.discussions?.length || 0}</b>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 py-6"
                    onClick={handleStartImport}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Confirm & Create"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <p className="text-sm">No file loaded yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SUCCESS STATE UI */
          <div className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 p-16 rounded-3xl border-2 border-green-500/20 shadow-xl text-center">
            <div className="bg-green-100 dark:bg-green-500/20 p-6 rounded-full mb-6">
              <CheckCircle2 size={100} className="text-green-500 animate-in zoom-in duration-500" />
            </div>
            <h2 className="text-4xl font-bold mb-3">Course Imported!</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg">
              The course <strong>"{previewData?.courseTitle}"</strong> has been successfully cloned to your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                onClick={() => navigate('/teacher/courses')}
                className="flex-1 py-6"
              >
                Go to Courses
              </Button>
              <Button 
                onClick={resetPage}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-6"
              >
                <PlusCircle size={20} className="mr-2" />
                Import Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseImportPage;