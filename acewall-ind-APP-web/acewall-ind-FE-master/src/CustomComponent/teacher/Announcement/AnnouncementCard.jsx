import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Paperclip, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnnouncementCard({ announcement, onDelete, onClose }) {
  const formattedDate = announcement?.date || "-";
  const courseTitle =
    announcement?.course?.courseTitle || announcement?.courseTitle || "-";
  const teacherName = announcement?.teacher
    ? `${announcement.teacher.firstName} ${announcement.teacher.lastName}`
    : "-";

  const isImageFile = (filename) =>
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);

  return (
    <Dialog open={!!announcement} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {announcement?.title || "-"}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 mt-4 text-gray-700 text-sm">
            {/* Message */}
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line shadow-sm">
              {announcement?.message || "-"}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong>Date:</strong> {formattedDate}
              </div>
              <div>
                <strong>Course:</strong> {courseTitle}
              </div>
              <div>
                <strong>Teacher:</strong> {teacherName}
              </div>
            </div>

            {/* Links */}
            {announcement?.links?.length > 0 && (
              <div>
                <strong className="block mb-1">Links:</strong>
                <ul className="list-disc ml-5 space-y-1">
                  {announcement.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="h-4 w-4" /> {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attachments */}
            {announcement?.attachments?.length > 0 && (
              <div>
                <strong className="block mb-1">Attachments:</strong>
                <div className="flex flex-wrap gap-3 overflow-x-auto py-1">
                  {announcement.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 min-w-[150px] bg-gray-50 p-2 rounded-md shadow-sm"
                    >
                      {isImageFile(file.filename) ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <Paperclip className="h-4 w-4 text-gray-600" />
                      )}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[100px]"
                      >
                        {file.filename}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogDescription>

      
      </DialogContent>
    </Dialog>
  );
}
