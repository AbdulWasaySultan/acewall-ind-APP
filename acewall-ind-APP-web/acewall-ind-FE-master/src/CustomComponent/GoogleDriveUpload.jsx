import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { X, Check, Loader2, FolderOpen } from "lucide-react";

// Google Picker API configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_DRIVE_APP_ID;

/**
 * Google Drive Upload Component with Native Google Picker API
 */
const GoogleDriveUpload = ({
  onUploadComplete,
  onUploadError,
  allowedTypes = ["image/*", "video/*", "application/pdf"],
  maxFileSize = 500 * 1024 * 1024, // 500MB
  multiple = false,
  buttonLabel = "Select from Google Drive",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pickerLoaded, setPickerLoaded] = useState(false);

  // Check Google Drive connection status on mount
  useEffect(() => {
    checkDriveConnection();
  }, []);

  /**
   * Check if user has connected Google Drive
   */
  const checkDriveConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const response = await axiosInstance.get("drive/status");
      setIsConnected(response.data.connected);

      if (response.data.isExpired) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Drive connection check failed:", error);
      setIsConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  /**
   * Connect Google Drive - initiates OAuth flow
   */
  const connectGoogleDrive = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("drive/auth-url");

      if (response.data.authUrl) {
        // Store current URL to redirect back after OAuth
        sessionStorage.setItem("driveRedirectUrl", window.location.href);

        // Open OAuth in same window
        window.location.href = response.data.authUrl;
      } else {
        toast.error("Failed to get Google Drive authorization URL");
      }
    } catch (error) {
      console.error("Connect drive error:", error);
      toast.error(error.response?.data?.message || "Failed to connect Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disconnect Google Drive
   */
  const disconnectGoogleDrive = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post("drive/disconnect");
      setIsConnected(false);
      toast.success("Google Drive disconnected successfully");
    } catch (error) {
      console.error("Disconnect drive error:", error);
      toast.error(error.response?.data?.message || "Failed to disconnect Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  /**
   * Load Google Picker API script
   */
  useEffect(() => {
    // Check if picker is already loaded
    if (window.google && window.google.picker) {
      setPickerLoaded(true);
      return;
    }

    // Load Google Picker API
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = () => {
      window.gapi.load("picker", { callback: () => {
        setPickerLoaded(true);
      }});
    };
    script.onerror = () => {
      console.error("Failed to load Google Picker API");
      toast.error("Failed to load Google Picker");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts during loading
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  /**
   * Handle Google Drive button click - opens native Google Picker
   */
  const handleGoogleDriveClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isConnected) {
      connectGoogleDrive();
      return;
    }

    if (!pickerLoaded) {
      toast.error("Google Picker is still loading. Please try again in a moment.");
      return;
    }

    try {
      // Get OAuth token from backend
      const response = await axiosInstance.get("drive/picker-token");
      const oauthToken = response.data.accessToken;

      if (!oauthToken) {
        toast.error("Failed to get Google Drive authorization. Please reconnect.");
        setIsConnected(false);
        return;
      }

      // Create and show the Google Picker
      createPicker(oauthToken);
    } catch (error) {
      console.error("Failed to get picker token:", error);
      toast.error(error.response?.data?.message || "Failed to open Google Drive picker");
    }
  };

  /**
   * Create and show Google Picker
   */
  const createPicker = (oauthToken) => {
    if (!window.google || !window.google.picker) {
      toast.error("Google Picker not available");
      return;
    }

    const google = window.google;
    const { View, PickerBuilder, Feature } = google.picker;
    const ViewId = google.picker.ViewId;

    // Build view based on allowed types
    let view;
    let pdfView;
    let hasImages = allowedTypes.includes("image/*");
    let hasPDFs = allowedTypes.includes("application/pdf");
    let hasVideos = allowedTypes.includes("video/*");

    if (hasImages && hasVideos) {
      // Images and videos
      view = new View(ViewId.DOCS_IMAGES_AND_VIDEOS);
    } else if (hasImages && hasPDFs) {
      // Images and PDFs - use separate views
      view = new View(ViewId.DOCS_IMAGES);
      pdfView = new View(ViewId.DOCS);
      pdfView.setMimeTypes("application/pdf");
    } else if (hasImages) {
      // Images only
      view = new View(ViewId.DOCS_IMAGES);
    } else if (hasVideos) {
      // Videos only - use docs view and filter
      view = new View(ViewId.DOCS);
      view.setMimeTypes("video/*");
    } else if (hasPDFs) {
      // PDFs only
      view = new View(ViewId.DOCS);
      view.setMimeTypes("application/pdf");
    } else {
      // All files
      view = new View(ViewId.DOCS);
    }

    // Build the picker
    const pickerBuilder = new PickerBuilder()
      .addView(view)

    if (pdfView) {
      pickerBuilder.addView(pdfView);
    }

    pickerBuilder
      .setAppId(GOOGLE_APP_ID)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .setTitle("Select files from Google Drive");

    if (multiple) {
      pickerBuilder.enableFeature(Feature.MULTISELECT_ENABLED);
    }

    const picker = pickerBuilder.build();
    picker.setVisible(true);
  };

  /**
   * Handle picker response
   */
  const pickerCallback = async (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files = data.docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        size: doc.sizeBytes || 0,
      }));

      // Validate files
      const validFiles = files.filter((file) => {
        // Check file size
        if (file.size > maxFileSize) {
          toast.error(`${file.name} exceeds the ${formatFileSize(maxFileSize)} limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setSelectedFiles(validFiles);

      // Upload files
      await uploadFromGoogleDrive(validFiles);
    }
  };

  /**
   * Upload files from Google Drive
   */
  const uploadFromGoogleDrive = async (driveFiles) => {
    setIsLoading(true);
    setUploadProgress(0);

    const results = [];
    const errors = [];

    for (let i = 0; i < driveFiles.length; i++) {
      const file = driveFiles[i];
      try {
        setUploadProgress(Math.round(((i + 1) / driveFiles.length) * 100));

        const response = await axiosInstance.post("drive/upload", {
          fileId: file.id,
          fileName: file.name,
          mimeType: file.mimeType,
        });

        results.push(response.data.file);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error: error.response?.data?.message || "Upload failed",
        });
      }
    }

    setIsLoading(false);
    setUploadProgress(0);

    if (errors.length > 0) {
      toast.error(`${errors.length} file(s) failed to upload`);
    }

    if (results.length > 0) {
      toast.success(`${results.length} file(s) uploaded successfully`);
      onUploadComplete?.(multiple ? results : results[0]);
    }

    return { results, errors };
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Google Drive Upload Options */}
      <div className="flex flex-col gap-3">
        {/* Google Drive Button */}
        <button
          onClick={handleGoogleDriveClick}
          disabled={isLoading || isCheckingConnection}
          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isConnected
              ? "bg-blue-50 border-blue-300 hover:border-blue-500"
              : "bg-white border-gray-200 hover:border-blue-300"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : isCheckingConnection ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : isConnected ? (
            <Check className="w-5 h-5 text-blue-600" />
          ) : (
            <FolderOpen className="w-5 h-5 text-blue-600" />
          )}
          <span className="font-medium text-gray-700">
            {isConnected ? buttonLabel : "Connect Google Drive"}
          </span>
        </button>

        {/* Connection Status & Disconnect */}
        {isConnected && !isLoading && (
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Google Drive connected</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                disconnectGoogleDrive();
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-600">
                    {file.name?.split(".").pop()?.toUpperCase() || "FILE"}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size || 0)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GoogleDriveUpload;
