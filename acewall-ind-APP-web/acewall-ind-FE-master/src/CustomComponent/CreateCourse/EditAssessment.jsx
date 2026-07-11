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

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import CategoryDropdown from "@/CustomComponent/Assessment/Assessment-category-dropdown";
import StrictDatePicker from "@/CustomComponent/Assessment/DueDatePicker";
import { Pen, Loader2, CalendarClock } from "lucide-react";
import EditDueDateForStudent from "./EditDueDateForStudent";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  category: z.string().min(1, "Please select a category"),
  dueDate: z.object({
    dateTime: z
      .preprocess(
        (val) =>
          typeof val === "string" || val instanceof Date ? new Date(val) : val,
        z.date({ required_error: "Due date is required" }),
      )
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: "Please select a valid due date",
      }),
  }),
  tempOverrideDate: z
    .object({
      dateTime: z
        .preprocess(
          (val) =>
            typeof val === "string" || val instanceof Date
              ? new Date(val)
              : val,
          z.date(),
        )
        .optional(),
    })
    .optional(),
  studentDueDateOverrides: z
    .array(
      z.object({
        studentId: z.string(),
        newDueDate: z.object({
          date: z.string(),
          time: z.string(),
        }),
      }),
    )
    .optional(),
});

export default function EditAssessmentDialog({ assessment, fetchAssessment }) {
  const { type, id } = useParams();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (!open) return;
    const fetchQuarterDate = async () => {
      try {
        const res = await axiosInstance.get(
          `quarter/getDatesofQuarter/${assessment.quarter}`,
        );
        setStartDate(new Date(res.data.startDate));
        setEndDate(new Date(res.data.endDate));
      } catch (err) {
        console.error("Error fetching dates:", err);
      }
    };
    fetchQuarterDate();
  }, [open, assessment.quarter]);

  const minDate = startDate < endDate ? startDate : endDate;
  const maxDate = endDate > startDate ? endDate : startDate;

  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const combinedStr = `${dateStr.split("T")[0]}T${timeStr}`;
    const dateTime = new Date(combinedStr);
    return isNaN(dateTime.getTime()) ? null : dateTime;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: assessment.title || "",
      description: assessment.description || "",
      category: assessment.category?._id || "",
      dueDate: {
        dateTime: combineDateTime(
          assessment.dueDate?.date,
          assessment.dueDate?.time,
        ),
      },
      tempOverrideDate: z
        .object({
          dateTime: z
            .preprocess(
              (val) =>
                typeof val === "string" || val instanceof Date
                  ? new Date(val)
                  : val,
              z.date(),
            )
            .optional(),
        })
        .optional(),
      studentDueDateOverrides:
        assessment.studentDueDateOverrides?.map((override) => ({
          studentId: override.studentId,
          newDueDate: {
            dateTime: combineDateTime(
              override.newDueDate?.date,
              override.newDueDate?.time,
            ),
          },
        })) || [],
    },
  });

  const tempOverrideDate = form.watch("tempOverrideDate");

  useEffect(() => {
    if (selectedStudents.length > 0 && tempOverrideDate?.dateTime) {
      const dateObj = new Date(tempOverrideDate.dateTime);

      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const timeStr = `${hours}:${minutes}`;

        const formattedOverrides = selectedStudents.map((student) => ({
          studentId: student._id,
          newDueDate: {
            date: dateStr,
            time: timeStr,
          },
        }));

        form.setValue("studentDueDateOverrides", formattedOverrides, {
          shouldValidate: true,
        });
      }
    } else {
      form.setValue("studentDueDateOverrides", []);
    }
  }, [selectedStudents, tempOverrideDate, form.setValue]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Updating assessment...");

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append(type, id);

      const dueDate = new Date(data.dueDate.dateTime);
      if (dueDate >= minDate && dueDate <= maxDate) {
        formData.append("dueDate", dueDate.toISOString());
      } else {
        toast.error("Due date must be within the quarter range", {
          id: toastId,
        });
        setIsSubmitting(false);
        return;
      }

      await axiosInstance.put(
        `assessment/editAssessment/${assessment._id}`,
        formData,
      );

      if (
        data.studentDueDateOverrides &&
        data.studentDueDateOverrides.length > 0
      ) {
        const overridePromises = data.studentDueDateOverrides.map(
          (override) => {
            return axiosInstance.put(
              `assessment/setDueDateForStudent/${assessment._id}`,
              {
                studentId: override.studentId,
                newDueDate: override.newDueDate,
              },
            );
          },
        );
        await Promise.all(overridePromises);
      }

      toast.success("Assessment updated successfully", {
        id: toastId,
      });
      fetchAssessment();
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          aria-label="Edit Assessment"
        >
          <Pen size={16} />
        </Button>
      </DialogTrigger>
      
      {/* Increased max-width to 3xl and added a slight larger width for mobile via w-[95vw] */}
      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto !gap-0 !p-0">
        
        {/* Separated Header for sticky feeling if wanted, or just cleaner layout */}
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
               Edit Assessment
            </DialogTitle>
            <DialogDescription className="text-base">
              Update the assessment details and ensure the due date falls within
              the quarter.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pt-4"
            >
              
              {/* Grid layout for Title and Category to utilize wider modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="edit-assessment-title" className="font-semibold text-foreground">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="edit-assessment-title"
                          {...field}
                          placeholder="Enter Assessment Title"
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground">Assessment Category</FormLabel>
                      <FormControl>
                        <CategoryDropdown
                          assessmentId={assessment._id}
                          courseId={assessment.course}
                          value={field.value}
                          onValueChange={field.onChange}
                          error={form.formState.errors.category?.message}
                        />
                      </FormControl>
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
                    <FormLabel htmlFor="edit-assessment-desc" className="font-semibold text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="edit-assessment-desc"
                        {...field}
                        placeholder="Describe what students need to do..."
                        className="min-h-[120px] resize-y bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Standard Due date removed the ml-10 for perfect alignment */}
              <div className="space-y-3">
                <Label id="due-date-label" className="font-semibold text-foreground text-base">
                  Standard Due Date and Time
                </Label>
                <div className="bg-background">
                  <StrictDatePicker
                    name="dueDate"
                    minDate={minDate}
                    maxDate={maxDate}
                    aria-labelledby="due-date-label"
                  />
                </div>
                {form.formState.errors?.dueDate?.dateTime && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.dueDate.dateTime.message}
                  </p>
                )}
              </div>

              {/* Enhanced Override UI inside a highlighted card */}
              <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-5 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-5 h-5 text-muted-foreground" />
                  <Label id="override-date-label" className="font-semibold text-base m-0">
                    Extend Due Date for Specific Students
                  </Label>
                </div>
                
                <div className="grid gap-5">
                  <EditDueDateForStudent
                    assessment={assessment}
                    students={students}
                    setStudents={setStudents}
                    selectedStudents={selectedStudents}
                    setSelectedStudents={setSelectedStudents}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-medium">
                      Select New Override Date & Time
                    </Label>
                    <StrictDatePicker
                      name="tempOverrideDate"
                      minDate={minDate}
                      maxDate={maxDate}
                      aria-labelledby="override-date-label"
                    />
                    {form.formState.errors?.tempOverrideDate?.dateTime && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.tempOverrideDate.dateTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky footer with a clean top border */}
              <DialogFooter className="sticky -bottom-6 bg-background pt-4 pb-2 border-t mt-8 w-full z-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}