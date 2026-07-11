"use client";

import { useState, useMemo } from "react";
import { Link as LinkIcon, Paperclip, Trash2, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementList({ title, announcements = [], onDelete }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isImageFile = (filename) =>
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);

  const handleRowClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // Filtered announcements based on search term
  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm) return announcements;
    const lowerTerm = searchTerm.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(lowerTerm) ||
        a.message.toLowerCase().includes(lowerTerm)
    );
  }, [announcements, searchTerm]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header - Now static without dropdown */}
      <div className="bg-gray-50/50 border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          {title} <span className="text-gray-400 font-normal ml-1">({filteredAnnouncements.length})</span>
        </h2>
      </div>

      <div className="p-6">
        {/* Search Input with Icon */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search within these announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            aria-label="Search announcements"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-gray-500" role="status">
              <FileText className="mx-auto text-gray-200 mb-3" size={48} />
              <p>No announcements found.</p>
            </div>
          ) : (
            <table className="w-full min-w-[900px] border-collapse" role="table">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  <th className="p-4 text-left w-[12%]">Date</th>
                  <th className="p-4 text-left w-[18%]">Title</th>
                  <th className="p-4 text-left w-[30%]">Message</th>
                  <th className="p-4 text-left w-[15%]">Links</th>
                  <th className="p-4 text-left w-[15%]">Attachments</th>
                  <th className="p-4 text-right w-[10%]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {[...filteredAnnouncements].reverse().map((announcement) => {
                  const links = Array.isArray(announcement.links) ? announcement.links : [];
                  const attachments = Array.isArray(announcement.attachments)
                    ? announcement.attachments
                    : [];

                  return (
                    <tr
                      key={announcement._id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(announcement)}
                    >
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {announcement.date}
                      </td>
                      <td className="p-4 text-sm font-semibold text-green-700 truncate max-w-[150px]">
                        {announcement.title}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <p className="line-clamp-2">{announcement.message}</p>
                      </td>
                      <td className="p-4">
                        {links.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {links.slice(0, 2).map((link, i) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{link}</span>
                              </a>
                            ))}
                            {links.length > 2 && <span className="text-[10px] text-gray-400">+{links.length - 2} more</span>}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="p-4">
                        {attachments.length > 0 ? (
                          <div className="flex -space-x-2">
                            {attachments.slice(0, 3).map((file, i) => (
                              <div 
                                key={i} 
                                className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm"
                                title={file.filename}
                              >
                                {isImageFile(file.filename) ? (
                                  <img src={file.url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Paperclip size={12} className="text-gray-500" />
                                )}
                              </div>
                            ))}
                            {attachments.length > 3 && (
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                    +{attachments.length - 3}
                                </div>
                            )}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(announcement._id);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Announcement Card Detail View */}
      {selectedAnnouncement && (
        <AnnouncementCard
          announcement={selectedAnnouncement}
          onDelete={onDelete}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}