"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Link as LinkIcon, Paperclip, Calendar, 
  User, ExternalLink, Loader2, ChevronDown, ChevronUp, Image as ImageIcon 
} from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

// --- Sub-Component for Long Messages ---
const ExpandableText = ({ text, limit = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = text.length > limit;

  return (
    <div className="text-gray-700 leading-relaxed text-md">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}${shouldShowButton ? "..." : ""}`}
      </p>
      {shouldShowButton && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="text-blue-600 font-semibold mt-2 hover:underline text-sm"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

const StudentCourseAnnouncements = () => {
  const { courseId } = useParams();
  const { user } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/announcements/getbystudent/${user._id}`);
        const filtered = res.data.announcements.filter(ann => ann.course._id === courseId);
        setAnnouncements(filtered);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [courseId, user?._id]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const isImage = (url) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url);

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {state?.courseTitle || "Course Updates"}
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Latest announcements and shared resources
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-400 font-medium">Loading updates...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <ImageIcon className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-medium">No announcements found for this course.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((ann) => {
            const isOpen = expandedId === ann._id;
            const images = ann.attachments?.filter(f => isImage(f.url)) || [];
            const files = ann.attachments?.filter(f => !isImage(f.url)) || [];

            return (
              <Card 
                key={ann._id} 
                className={`transition-all duration-300 border-none shadow-sm hover:shadow-md cursor-pointer overflow-hidden rounded-2xl ring-1 ${isOpen ? 'ring-blue-500 shadow-blue-50' : 'ring-gray-100'}`}
                onClick={() => toggleExpand(ann._id)}
              >
                <div className="p-5 md:p-6">
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {ann.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          <User size={14} /> {ann.teacher?.firstName}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Body Content */}
                  <ExpandableText text={ann.message} />

                  {/* Dropdown Content */}
                  <div className={`transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[2000px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <hr className="border-gray-100 mb-6" />

                    {/* Image Gallery */}
                    {images.length > 0 && (
                      <div className="mb-6">
                         <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                           <ImageIcon size={16} className="text-blue-500" /> Photos
                         </h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {images.map((img, i) => (
                              <a key={i} href={img.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                                <img 
                                  src={img.url} 
                                  alt="attachment" 
                                  className="w-full h-32 object-cover rounded-xl hover:opacity-90 transition-opacity border" 
                                />
                              </a>
                            ))}
                         </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Links Section */}
                      {ann.links?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <LinkIcon size={16} className="text-blue-500" /> Useful Links
                          </h4>
                          <div className="flex flex-col gap-2">
                            {ann.links.map((link, i) => (
                              <a 
                                key={i} href={link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                              >
                                <span className="truncate max-w-[200px]">{link}</span>
                                <ExternalLink size={14} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Files Section */}
                      {files.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Paperclip size={16} className="text-orange-500" /> Documents
                          </h4>
                          <div className="flex flex-col gap-2">
                            {files.map((file, i) => (
                              <a 
                                key={i} href={file.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="flex items-center p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-orange-50 transition-colors group border border-transparent hover:border-orange-100"
                              >
                                <Paperclip className="mr-2 h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                                <span className="truncate flex-1">{file.filename || "Download File"}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCourseAnnouncements;