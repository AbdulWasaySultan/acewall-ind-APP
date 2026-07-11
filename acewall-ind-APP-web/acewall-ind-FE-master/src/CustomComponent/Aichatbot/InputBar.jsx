import { File, Send, X } from "lucide-react";
import { toast } from "sonner";

export default function InputBar({
  onSendMessage,
  input,
  setInput,
  file,
  setFile,
  disabled,
}) {
  const handleSend = () => {
    if (input.trim() || file) {
      onSendMessage(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const allowedTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    // If no file selected
    if (!files || files.length === 0) {
      return;
    }

    const selectedFile = files[0];

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Only PDF, Word (.doc/.docx), and Excel (.xls/.xlsx) files are allowed."
      );
      e.target.value = "";
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 50MB.");
      e.target.value = "";
      return;
    }

    // If valid, save file
    setFile(selectedFile);
    toast.success(`File "${selectedFile.name}" selected successfully!`);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 shadow-lg">
      <section>
        {file && (
          <div className="mb-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <File size={20} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                toast.info("File removed");
              }}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </section>
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Ask any question or request to generate a file..."
          className="flex-1 px-4 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <File size={20} />
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
        <button
          onClick={handleSend}
          disabled={disabled || (!input.trim() && !file)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white transition-colors duration-200 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
