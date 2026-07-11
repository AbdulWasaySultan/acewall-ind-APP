import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

export default function AssessmentReminderDialog({ assessmentId }) {
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    const fetchReminderSetting = async () => {
      try {
        const res = await axiosInstance.get(
          `assessment/findReminderTime/${assessmentId}`
        );
        setReminder(res.data.reminderTime || "noReminder");
      } catch (err) {
        console.error("Error fetching reminder setting:", err);
      }
    };

    fetchReminderSetting();
  }, [assessmentId]);

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put(
        `assessment/setReminder/${assessmentId}`,
        {
          reminder,
        }
      );
      toast.success("Reminder setting saved successfully.", {
        ariaLive: "polite",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save reminder setting.",
        { ariaLive: "polite" }
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Set Reminder</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm"
        aria-label="Set Assessment Reminder"
      >
        <DialogHeader>
          <DialogTitle>Assessment Reminder</DialogTitle>
          <DialogDescription>
            Select when students should be reminded about this assessment.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={reminder}
          onValueChange={setReminder}
          className="flex flex-col space-y-2 mt-4"
          aria-label="Reminder options"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="12hours"
              id="12hours"
              aria-label="12 Hours Before"
            />
            <label htmlFor="12hours">12 Hours Before</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="24hours"
              id="24hours"
              aria-label="24 Hours Before"
            />
            <label htmlFor="24hours">24 Hours Before</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="48hours"
              id="48hours"
              aria-label="48 Hours Before"
            />
            <label htmlFor="48hours">48 Hours Before</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="noReminder"
              id="noReminder"
              aria-label="No Reminder"
            />
            <label htmlFor="noReminder">No Reminder</label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button
            variant="default"
            onClick={handleSave}
            aria-label="Save reminder setting"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
