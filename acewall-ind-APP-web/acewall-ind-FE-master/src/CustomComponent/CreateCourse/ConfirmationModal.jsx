import { useState } from "react";
import { ArrowRight, School } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ConfirmationModal({ func }) {
  const [isRentable, setIsRentable] = useState(false);
  const [open, setOpen] = useState(false);

  console.log(func);

  const handleConfirm = () => {
    // Here you would handle the API call to update the course rental status
    console.log("Course rental status updated:", isRentable);
    setOpen(false);
    func();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white">
          Create Course
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Course Access Options</DialogTitle>
          <DialogDescription>
            Decide whether you want to make this course available for other
            schools.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <School className="h-4 w-4 text-green-500" />
                <Label htmlFor="rental-option" className="text-sm font-medium">
                  Make this course available for other schools
                </Label>
              </div>
              <Switch
                id="rental-option"
                checked={isRentable}
                onCheckedChange={setIsRentable}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isRentable
                ? "Other schools will be able use this course material."
                : "This course will only be available within your school."}
            </p>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleConfirm}
          >
            Confirm & Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
