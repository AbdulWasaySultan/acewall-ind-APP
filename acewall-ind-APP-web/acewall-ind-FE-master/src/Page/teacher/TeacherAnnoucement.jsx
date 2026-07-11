"use client";

import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useParams and useNavigate
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AnnouncementList from "../../CustomComponent/teacher/Announcement/AnnouncementList";
import AnnouncementDialog from "../../CustomComponent/teacher/Announcement/AnnouncementDialog";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Loader, ArrowLeft, Megaphone } from "lucide-react";

export default function TeacherAnnouncement() {
  const { user } = useContext(GlobalContext);
  const { courseId } = useParams(); // ✅ Get the courseId from the URL
  const navigate = useNavigate();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [courseData, setCourseData] = useState(null); // Stores the specific course info
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  // Fetch announcements for this specific course
  const fetchAnnouncements = async () => {
    if (!user?._id || !courseId) return;

    setLoading(true);
    setStatusMessage("Loading announcements...");
    try {
      // Use your existing backend route
      const url = `/announcements/getbyteacher/${user._id}?course=${courseId}`;
      const res = await axiosInstance.get(url);
      const rawAnnouncements = res.data.announcements || [];

      // Since we are filtering by course in the query, the backend 
      // should ideally only return that course's data. 
      // We extract the course details from the first announcement found.
      if (rawAnnouncements.length > 0) {
        const first = rawAnnouncements[0];
        setCourseData({
          title: first.course?.courseTitle || "Course Announcements",
          thumbnail: first.course?.thumbnail?.url || "",
        });
      }

      // Map to the format AnnouncementList expects
      const formatted = rawAnnouncements.map((a) => ({
        _id: a._id,
        date: new Date(a.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        title: a.title,
        message: a.message,
        links: a.links || [],
        attachments: a.attachments || [],
      }));

      setAnnouncements(formatted);
      setStatusMessage(`${rawAnnouncements.length} announcements loaded`);
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user?._id, courseId]);

  const handleDeleteAnnouncement = (id) => {
    setAnnouncementToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAnnouncement = async () => {
    try {
      await axiosInstance.delete(`/announcements/${announcementToDelete}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== announcementToDelete));
      setStatusMessage("Deleted successfully");
    } catch (error) {
      setStatusMessage("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleAnnouncementCreated = () => {
    fetchAnnouncements();
    setShowNewDialog(false);
  };

  return (
    <>
      <div role="status" className="sr-only">{statusMessage}</div>

      <main className="mx-auto p-4 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              {courseData?.thumbnail.url && (
                <img src={courseData.thumbnail?.url} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {courseData?.title || "Course Announcements"}
                </h1>
                <p className="text-sm text-gray-500">Managing updates for this course</p>
              </div>
            </div>
          </div>

          <Button
            className="bg-[var(--color-acewall-green)] hover:bg-emerald-600 h-11 px-6 shadow-md"
            onClick={() => setShowNewDialog(true)}
          >
            <Megaphone className="mr-2" size={18} /> Add New
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader className="animate-spin text-blue-500 mb-2" size={32} />
            <p className="text-gray-500">Fetching course updates...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center bg-gray-50 border-2 border-dashed rounded-xl py-20">
            <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-medium">No announcements yet for this course.</p>
            <Button variant="link" onClick={() => setShowNewDialog(true)} className="text-blue-600">
              Create your first one now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnnouncementList
              title={courseData?.title}
              announcements={announcements}
              onDelete={handleDeleteAnnouncement}
            />
          </div>
        )}

        {/* Create Dialog - We pass the courseId so the teacher doesn't have to select it */}
        <AnnouncementDialog
          open={showNewDialog}
          onOpenChange={setShowNewDialog}
          onCreated={handleAnnouncementCreated}
          defaultCourseId={courseId} 
        />

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                This will permanently remove the announcement. Students will no longer see it in their portal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button className="bg-red-600" onClick={confirmDeleteAnnouncement}>Delete Permanently</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}