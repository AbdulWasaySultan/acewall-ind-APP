import { Label } from "@/components/ui/label";
import StrictDatePicker from "@/CustomComponent/Assessment/DueDatePicker";
import EditDueDateForStudent from "@/CustomComponent/CreateCourse/EditDueDateForStudent";
import { axiosInstance } from "@/lib/AxiosInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, User } from "lucide-react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
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

const DueDateSetting = ({ discussion }) => {
  const [students, setStudents] = React.useState([]);
  const [selectedStudents, setSelectedStudents] = React.useState([]);

  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const combinedStr = `${dateStr.split("T")[0]}T${timeStr}`;
    const dateTime = new Date(combinedStr);
    return isNaN(dateTime.getTime()) ? null : dateTime;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        discussion.studentDueDateOverrides?.map((override) => ({
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

  console.log("formErrors:", form.formState.errors);
  const handleSubmit = async (data) => {
    const dt = new Date(data.tempOverrideDate.dateTime);

    const datePart = dt.toISOString().split("T")[0];
    const timePart = dt.toTimeString().split(" ")[0].substring(0, 5);

    try {
      const payload = {
        studentIds: selectedStudents.map((s) => s._id),
        newDueDate: {
          date: datePart, // "2026-04-09"
          time: timePart, // "02:30"
        },
      };

      const res = await axiosInstance.put(
        `discussion/setDueDateForStudent/${discussion._id}`,
        payload,
      );

      console.log("Response:", res.data.message);
      // Add success toast/notification here
    } catch (err) {
      console.error(
        "Error updating due dates:",
        err.response?.data || err.message,
      );
    }
  };

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-5 h-5 text-muted-foreground" />
              <Label
                id="override-date-label"
                className="font-semibold text-base m-0"
              >
                Extend Due Date for Specific Students
              </Label>
            </div>

            <div className="grid gap-5">
              <EditDueDateForStudent
                assessment={discussion}
                students={students}
                setStudents={setStudents}
                selectedStudents={selectedStudents}
                setSelectedStudents={setSelectedStudents}
                editfor="discussion"
              />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground font-medium">
                  Select New Override Date & Time
                </Label>
                <StrictDatePicker
                  name="tempOverrideDate"
                  // minDate={minDate}
                  // maxDate={maxDate}
                  aria-labelledby="override-date-label"
                />
                {form.formState.errors?.tempOverrideDate?.dateTime && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.tempOverrideDate.dateTime.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </FormProvider>

      {/* Existing Student Due Date Overrides Section */}
      {discussion.studentDueDateOverrides && discussion.studentDueDateOverrides.length > 0 && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-5 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-muted-foreground" />
            <Label className="font-semibold text-base m-0">
              Existing Student Due Date Overrides
            </Label>
          </div>
          
          <div className="space-y-3">
            {discussion.studentDueDateOverrides.map((override) => (
              <div
                key={override._id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {override.student?.firstName} {override.student?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {override.student?.email}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(override.newDueDate.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {override.newDueDate.time || '00:00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DueDateSetting;
