import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Archive, ArchiveRestore } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";

export default function ArchiveDialog({
  onConfirm,
  course,
  fetchCourseDetail,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`course/archive/${course._id}`);
      fetchCourseDetail();
      setOpen(false);
    } catch (error) {
      console.error("Archive error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={course.published ? "outline" : "default"}
          className={`gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${
            course.published
              ? "border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          aria-label={course.published ? "Archive this course" : "Restore this course"}
        >
          {course.published ? <Archive size={16} /> : <ArchiveRestore size={16} />}
          {course.published ? "Archive Course" : "Unarchive Course"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" aria-describedby="archive-dialog-description">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 text-xl ${
              course.published ? "text-red-700" : "text-green-700"
            }`}
          >
            {course.published ? (
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            ) : (
              <ArchiveRestore className="w-6 h-6" aria-hidden="true" />
            )}
            Confirm {course.published ? "Archive" : "Unarchive"}
          </DialogTitle>
          <DialogDescription id="archive-dialog-description" className="text-gray-600 pt-2">
            {course.published
              ? "Archiving this course will hide it from students. You can restore it later from your dashboard."
              : "Unarchiving this course will make it visible to students again."}
          </DialogDescription>
        </DialogHeader>

        

        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className={`w-full sm:w-auto font-bold ${
              course.published
                ? "bg-red-700 text-white hover:bg-red-800"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
            onClick={handleArchive}
            disabled={loading}
          >
            {loading ? "Processing..." : `Yes, ${course.published ? "Archive" : "Unarchive"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}