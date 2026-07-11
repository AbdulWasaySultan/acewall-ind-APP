import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { Pen } from "lucide-react";

// Helpers
const toLocalDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const fromLocalDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-");
  return new Date(year, month - 1, day);
};

const schema = z
  .object({
    title: z.string().min(1, "Title is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const start = fromLocalDateString(data.startDate);
      const end = fromLocalDateString(data.endDate);
      return start < end;
    },
    {
      message: "Start date must be before end date",
      path: ["endDate"],
    }
  );

export default function EditQuarterDialog({
  open,
  onOpenChange,
  quarter,
  fetchSemestersAndQuarters,
  courseId,
  semester,
  formatDate,
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", startDate: "", endDate: "" },
  });

  console.log(quarter, "quarter")

  useEffect(() => {
    if (quarter) {
      form.reset({
        title: quarter.title,
        startDate: toLocalDateString(quarter.startDate),
        endDate: toLocalDateString(quarter.endDate),
      });
    }
  }, [quarter]);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.put(`/quarter/editQuarter/${quarter._id}`, {
        ...data,
        startDate: fromLocalDateString(data.startDate).toISOString(),
        endDate: fromLocalDateString(data.endDate).toISOString(),
        semester: quarter.semester?._id || quarter.semester,
        course: courseId,
      });
      toast.success("Quarter updated successfully");
      fetchSemestersAndQuarters();
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || "Error updating quarter");
    }
  };

  return (
    <Dialog open={open}>
      <DialogTrigger>
        <Button>
          <Pen />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quarter</DialogTitle>
          {semester && (
            <p className="text-sm text-muted-foreground">
              {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Input placeholder="Quarter Title" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.title.message}
            </p>
          )}

          <Input type="date" {...form.register("startDate")} />
          {form.formState.errors.startDate && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.startDate.message}
            </p>
          )}

          <Input type="date" {...form.register("endDate")} />
          {form.formState.errors.endDate && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.endDate.message}
            </p>
          )}

          <Button type="submit" className="w-full">
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
