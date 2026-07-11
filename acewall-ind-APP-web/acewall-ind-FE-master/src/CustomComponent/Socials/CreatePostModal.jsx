import React, { useState, useEffect, useRef } from "react";
import { X, Image, Video, Globe, GraduationCap, RefreshCw, FolderOpen } from "lucide-react";
import gsap from "gsap";
import { axiosInstance } from "@/lib/AxiosInstance";
import JoditEditor from "jodit-react";
import GoogleDriveUpload from "../GoogleDriveUpload.jsx";

const CreatePostModal = ({ onClose, onCreate, enrolledCourses: propCourses = [] }) => {
  const [text, setText] = useState("");
  const [postType, setPostType] = useState("public");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState({ url: null, type: null });
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(propCourses);
  const [showDriveUpload, setShowDriveUpload] = useState(false);
  const [driveFile, setDriveFile] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (courses.length === 0) {
      const fetchFallback = async () => {
        try {
          const res = await axiosInstance.get("/enrollment/my-courses");
          setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Modal fetch error:", err); }
      };
      fetchFallback();
    }
  }, [propCourses]);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
    }
  }, []);

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (preview.url) URL.revokeObjectURL(preview.url);

    setFile(selectedFile);
    setDriveFile(null); // Clear drive file when local file selected
    setPreview({
      url: URL.createObjectURL(selectedFile),
      type: type 
    });
  };

  const handleDriveUploadComplete = (uploadedFile) => {
    const fileData = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    setDriveFile(fileData);
    setFile(null); // Clear local file
    setPreview({
      url: fileData.url,
      type: fileData.resourceType === 'video' ? 'video' : 'image'
    });
    setShowDriveUpload(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file && !driveFile) return alert("Please add some content!");
    if (postType === "course" && !selectedCourseId) return alert("Please select a course!");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", text);
      formData.append("postType", postType);
      
      if (postType === "course") {
          formData.append("courseId", selectedCourseId);
      }
      
      if (file) {
          // "assets" must match your backend router: upload.array("assets")
          formData.append("assets", file);
      }
      
      // Send Google Drive file URL if available
      if (driveFile) {
        formData.append("driveUrl", driveFile.url);
        formData.append("drivePublicId", driveFile.publicId);
        formData.append("driveFilename", driveFile.filename);
      }

      const response = await axiosInstance.post("posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onCreate && onCreate(response.data.post);
      onClose();
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      alert("Failed to create post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div ref={modalRef} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X /></button>
        </div>

        {/* Visibility Toggles */}
        <div className="flex gap-4 mb-4">
          <button type="button" onClick={() => setPostType("public")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${postType === 'public' ? 'bg-green-600 border-green-600 text-white shadow-md font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <Globe className="w-4 h-4" /> Public Feed
          </button>
          <button type="button" onClick={() => setPostType("course")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${postType === 'course' ? 'bg-blue-600 border-blue-600 text-white shadow-md font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <GraduationCap className="w-4 h-4" /> Course Class
          </button>
        </div>

        {postType === "course" && (
          <div className="mb-4">
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Choose a Class...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
            </select>
            {courses.length === 0 && <p className="text-xs text-red-500 mt-1 italic">No classes found to post in.</p>}
          </div>
        )}

        <JoditEditor value={text} onBlur={(val) => setText(val)} />

        {/* Media Selectors */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            <Image className="w-4 h-4 text-green-600" /> Photo
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
          </label>
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            <Video className="w-4 h-4 text-blue-600" /> Video
            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
          </label>
          <button
            type="button"
            onClick={() => setShowDriveUpload(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" /> Google Drive
          </button>
        </div>

        {/* Google Drive Upload Modal */}
        {showDriveUpload && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Upload from Google Drive</h3>
                <button onClick={() => setShowDriveUpload(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <GoogleDriveUpload
                onUploadComplete={handleDriveUploadComplete}
                onUploadError={(err) => console.error("Drive upload error:", err)}
                allowedTypes={["image/*", "video/*"]}
                maxFileSize={500 * 1024 * 1024}
                buttonLabel="Select from Google Drive"
              />
            </div>
          </div>
        )}

        {/* Preview Container */}
        {preview.url && (
          <div className="relative mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {preview.type === 'image' ? (
              <img src={preview.url} className="max-h-64 object-contain w-full" alt="preview" />
            ) : (
              <video src={preview.url} className="max-h-64 w-full" controls />
            )}
            <button onClick={() => {setFile(null); setDriveFile(null); setPreview({url:null, type:null});}} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="mt-6 w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50 hover:bg-green-700 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Share Post"}
        </button>
      </div>
    </div>
  );
};

export default CreatePostModal;