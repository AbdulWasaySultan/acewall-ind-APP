import { useContext, useState } from "react";
import { ArrowRight, Loader, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CourseContext } from "@/Context/CoursesProvider";

export default function CourseConfirmationModal({ submit, chapters }) {
  const [open, setOpen] = useState(false);
  const { courseLoading, setCourseLoading } = useContext(CourseContext);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={
            chapters.length === 0 ||
            !chapters[0].lessons ||
            !chapters[0].Assessment
          }
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
        >
          Create Course
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Please Confirm</DialogTitle>
          <DialogDescription>
            Are you sure you want to create this course? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={submit}
          >
            {courseLoading ? (
              <Loader className={"animate-spin"} />
            ) : (
              "Confirm & Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
