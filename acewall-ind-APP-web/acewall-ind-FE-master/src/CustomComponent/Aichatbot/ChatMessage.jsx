import { GlobalContext } from "@/Context/GlobalProvider";
import { formatDistanceToNow } from "date-fns";
import { Forward, Download, File as FileIcon } from "lucide-react";
import { useContext } from "react";

export default function ChatMessage({ message, loading }) {
  const isUser = message.sender === "user";
  const { setTaggedMessage } = useContext(GlobalContext);

  const getFileIcon = (type) => {
    if (type === "pdf") return "📄";
    if (type === "word") return "📝";
    if (type === "excel") return "📊";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ✅ SAFE FLAGS
  const hasUserFile =
    isUser &&
    message.file &&
    message.file.url &&
    (message.file.name || message.fileUsed);

  const hasGeneratedFile = !isUser && message.generatedFile;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
          }`}
        >
          {/* Message text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>

          {/* ✅ User uploaded file */}
          {hasUserFile && (
            <div className="mt-2 p-2 bg-white/20 rounded-lg flex items-center gap-2">
              <FileIcon size={16} />
              <div className="text-xs">
                <p className="font-medium">
                  {message.fileUsed ?? message.file.name}
                </p>
                <p className="opacity-75">
                  {formatFileSize(message.file.size)}
                </p>
              </div>
            </div>
          )}

          {/* ✅ AI generated file */}
          {hasGeneratedFile && (
            <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
              <a
                href={message.generatedFile.url}
                download={message.generatedFile.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">
                  {getFileIcon(message.generatedFile.FileType)}
                </span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">
                    Download {message.generatedFile.FileType.toUpperCase()}
                  </p>
                  <p className="text-xs opacity-90">
                    {message.generatedFile.filename}
                  </p>
                </div>
                <Download size={20} />
              </a>
            </div>
          )}

          {/* ✅ AI used uploaded file */}
          {!isUser && message.fileUsed && (
            <div className="mt-2 text-xs opacity-75 italic">
              📎 Analyzed: {message.fileUsed}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-1">
          <Forward
            onClick={() => setTaggedMessage(message)}
            className="cursor-pointer text-slate-500 hover:text-blue-500 transition-colors"
            size={16}
          />
          {message.timestamp && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(message.timestamp), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
