import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";

export function DiscussionGradeModel({
  studentName,
  onSubmitMarks,
  discussionMarks,
  discussionId,
  commentId,
  fetchComments,
  checkIsCommented,
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      marks: "",
    },
  });

  console.log(discussionId, "discussionId");

  const handleSubmit = async (data) => {
    console.log(data, "data");
    await axiosInstance
      .put(
        `discussionComment/gradeDiscussionofStd/${discussionId}/${commentId}`,
        {
          obtainedMarks: data.marks,
        }
      )
      .then((res) => {
        console.log(res, "res");
        fetchComments();
        checkIsCommented();
        setOpen(false);
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.log(err, "error in giving marks to the duscussion");
        toast.error(err.response?.data?.message || "Error giving marks");
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className="text-xs flex gap-6 text-blue-600 font-medium cursor-pointer">
          Give Marks
        </p>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Give Marks</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Marks {`(total: ${discussionMarks})`}
            </label>
            <Input
              type="number"
              placeholder="Enter marks"
              max={discussionMarks || 0}
              {...form.register("marks", {
                required: "Marks are required",
                min: { value: 0, message: "Marks cannot be negative" },
              })}
            />
            {form.formState.errors.marks && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.marks.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
