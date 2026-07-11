"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import CategoryDropdown from "@/CustomComponent/Assessment/Assessment-category-dropdown";
import StrictDatePicker from "@/CustomComponent/Assessment/DueDatePicker";
import { Pen, Loader2, CalendarClock } from "lucide-react";
import EditDueDateForStudent from "./EditDueDateForStudent";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Please select a category"),
  dueDate: z.object({
    dateTime: z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date({ required_error: "Due date is required" })),
  }),
  tempOverrideDate: z.object({
    dateTime: z.preprocess((arg) => {
      if (!arg) return undefined;
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date().optional()),
  }).optional(),
  studentDueDateOverrides: z.array(
    z.object({
      studentId: z.string(),
      newDueDate: z.object({
        date: z.string(),
        time: z.string(),
      }),
    })
  ).optional(),
});

export default function EditDiscussionDialog({ discussion, fetchDiscussion }) {
  const { type, id } = useParams();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const combinedStr = `${dateStr.split("T")[0]}T${timeStr}`;
    const dateTime = new Date(combinedStr);
    return isNaN(dateTime.getTime()) ? null : dateTime;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      description: "",
      category: "",
      dueDate: { dateTime: new Date() },
      tempOverrideDate: { dateTime: undefined },
      studentDueDateOverrides: [],
    },
  });

  // Sync Form with Discussion Data when dialog opens
  useEffect(() => {
    if (discussion && open) {
      form.reset({
        topic: discussion.topic || "",
        description: discussion.description || "",
        category: discussion.category?._id || discussion.category || "",
        dueDate: {
          dateTime: combineDateTime(discussion.dueDate?.date, discussion.dueDate?.time),
        },
        studentDueDateOverrides: discussion.studentDueDateOverrides?.map((o) => ({
          studentId: o.student?._id || o.student,
          newDueDate: { date: o.newDueDate?.date, time: o.newDueDate?.time },
        })) || [],
      });
    }
  }, [discussion, open]);

  // Fetch Quarter Dates
  useEffect(() => {
    if (!open) return;
    const fetchQuarterDate = async () => {
      try {
        const res = await axiosInstance.get(`quarter/getDatesofQuarter/${discussion.quarter}`);
        setStartDate(new Date(res.data.startDate));
        setEndDate(new Date(res.data.endDate));
      } catch (err) {
        console.error("Error fetching dates:", err);
      }
    };
    fetchQuarterDate();
  }, [open, discussion.quarter]);

  const tempOverrideDate = form.watch("tempOverrideDate.dateTime");

  // Sync logic for extensions: Merges selected students with the picked date into the form array
  useEffect(() => {
    if (selectedStudents.length > 0 && tempOverrideDate) {
      const dateObj = new Date(tempOverrideDate);
      if (!isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split("T")[0];
        const timeStr = dateObj.toTimeString().split(" ")[0].substring(0, 5);

        const newOverrides = selectedStudents.map((student) => ({
          studentId: student._id,
          newDueDate: { date: dateStr, time: timeStr },
        }));

        const currentArr = form.getValues("studentDueDateOverrides") || [];
        
        // Remove old entries for the students we are currently updating to avoid duplicates
        const filteredCurrent = currentArr.filter(
          (old) => !newOverrides.some((newO) => newO.studentId === old.studentId)
        );

        form.setValue("studentDueDateOverrides", [...filteredCurrent, ...newOverrides], {
          shouldValidate: true,
        });
      }
    }
    // Note: If you want to clear overrides when selection is empty, add an else case.
    // However, usually we keep existing ones.
  }, [selectedStudents, tempOverrideDate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating discussion...");

    try {
      // 1. Update Main Discussion
      const payload = {
        topic: data.topic,
        description: data.description,
        category: data.category,
        dueDate: data.dueDate.dateTime.toISOString(),
      };

      await axiosInstance.put(`discussion/editDiscussion/${discussion._id}`, payload);

      // 2. Handle Student Overrides
      if (data.studentDueDateOverrides && data.studentDueDateOverrides.length > 0) {
        const overridePromises = data.studentDueDateOverrides.map((override) =>
          axiosInstance.put(`discussion/setDueDateForStudent/${discussion._id}`, {
            studentId: override.studentId,
            newDueDate: override.newDueDate,
          })
        );
        await Promise.all(overridePromises);
      }

      toast.success("Discussion updated successfully", { id: toastId });
      fetchDiscussion();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = startDate < endDate ? startDate : endDate;
  const maxDate = endDate > startDate ? endDate : startDate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600">
          <Pen size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto !gap-0 !p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Discussion</DialogTitle>
            <DialogDescription>Update topic and individual extensions.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Topic</FormLabel>
                      <FormControl><Input {...field} placeholder="Discussion Topic" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Category</FormLabel>
                      <CategoryDropdown
                        assessmentId={discussion._id}
                        courseId={discussion.course?._id || discussion.course}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Description</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label className="font-semibold">Standard Due Date</Label>
                <StrictDatePicker name="dueDate" minDate={minDate} maxDate={maxDate} />
                <FormMessage>{form.formState.errors.dueDate?.dateTime?.message}</FormMessage>
              </div>

              <div className="space-y-4 rounded-xl border bg-muted/40 p-5 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-5 h-5 text-muted-foreground" />
                  <Label className="font-semibold text-base">Individual Extensions</Label>
                </div>

                <EditDueDateForStudent
                  editfor="discussion"
                  assessment={discussion}
                  students={students}
                  setStudents={setStudents}
                  selectedStudents={selectedStudents}
                  setSelectedStudents={setSelectedStudents}
                />

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground font-medium">New Override Date & Time</Label>
                  <StrictDatePicker name="tempOverrideDate" minDate={minDate} maxDate={maxDate} />
                  {form.formState.errors?.tempOverrideDate?.dateTime && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.tempOverrideDate.dateTime.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="sticky -bottom-6 bg-background pt-4 pb-2 border-t mt-8 w-full z-10">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}