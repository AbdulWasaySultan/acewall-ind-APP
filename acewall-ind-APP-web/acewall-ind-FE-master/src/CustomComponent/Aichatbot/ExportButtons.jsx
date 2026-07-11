"use client";

import { FileText, File } from "lucide-react";

export default function ExportButtons({ onDownloadPDF, onDownloadWord }) {
  return (
    <div className="space-y-2">
      {/* Download PDF Button */}
      <button
        onClick={onDownloadPDF}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Download chat as PDF"
      >
        <File size={18} aria-hidden="true" />
        Download as PDF
      </button>

      {/* Download Word Button */}
      <button
        onClick={onDownloadWord}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Download chat as Word document"
      >
        <FileText size={18} aria-hidden="true" />
        Download as Word
      </button>
    </div>
  );
}
