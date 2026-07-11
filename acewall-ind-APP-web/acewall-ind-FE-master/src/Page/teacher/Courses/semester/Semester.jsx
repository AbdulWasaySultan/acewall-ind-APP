import React, { useEffect, useState } from "react";
import { Calendar, Loader, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import EditQuarterDialog from "@/CustomComponent/SemesterCmp.jsx/editQuarter";
import EditSemesterDialog from "@/CustomComponent/SemesterCmp.jsx/editSemester";

// Helper function to format date consistently
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const toLocalDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`; // Change the order to MM-DD-YYYY
};


// Helper function to create date from local date string
const fromLocalDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-");
  return new Date(year, month - 1, day);
};

const today = toLocalDateString(new Date());

const Semester = () => {
  const [semesterModalOpen, setSemesterModalOpen] = useState(false);
  const [quarterModalOpen, setQuarterModalOpen] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [activeSemId, setActiveSemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingArchive, setLoadingArchive] = useState();

  const { courseId } = useParams();

  // Create dynamic schemas based on existing data
  const createSemesterSchema = () => {
    const lastSemester = semesters[semesters.length - 1];

    return z
      .object({
        title: z.string().min(1, "Title is required").trim(),
        startDate: z
          .string()
          .min(1, "Start date is required")
          .refine(
            (date) => {
              if (lastSemester) {
                const newStartDate = fromLocalDateString(date);
                const lastEndDate = new Date(lastSemester.endDate);
                return newStartDate > lastEndDate;
              }
              return true;
            },
            {
              message: lastSemester
                ? `New semester must start after ${formatDate(
                  lastSemester.endDate
                )}`
                : "Invalid start date",
            }
          ),
        endDate: z.string().min(1, "End date is required"),
      })
      .refine(
        (data) => {
          const startDate = fromLocalDateString(data.startDate);
          const endDate = fromLocalDateString(data.endDate);
          return startDate < endDate;
        },
        {
          message: "Start date must be before end date",
          path: ["endDate"],
        }
      );
  };

  const createQuarterSchema = () => {
    const currentSem = semesters.find((sem) => sem._id === activeSemId);

    return z
      .object({
        title: z.string().min(1, "Title is required").trim(),
        startDate: z
          .string()
          .min(1, "Start date is required")
          .refine((date) => {
            if (currentSem) {
              const quarterStart = fromLocalDateString(date);
              const semesterStart = new Date(currentSem.startDate);
              return quarterStart >= semesterStart;
            }
            return true;
          }, "Quarter must start within semester period"),
        endDate: z
          .string()
          .min(1, "End date is required")
          .refine((date) => {
            if (currentSem) {
              const quarterEnd = fromLocalDateString(date);
              const semesterEnd = new Date(currentSem.endDate);
              return quarterEnd <= semesterEnd;
            }
            return true;
          }, "Quarter must end within semester period"),
      })
      .refine(
        (data) => {
          const startDate = fromLocalDateString(data.startDate);
          const endDate = fromLocalDateString(data.endDate);
          return startDate < endDate;
        },
        {
          message: "Start date must be before end date",
          path: ["endDate"],
        }
      )
      .refine(
        (data) => {
          // Check for quarter overlaps
          const currentSem = semesters.find((sem) => sem._id === activeSemId);
          if (!currentSem) return true;

          const newStart = fromLocalDateString(data.startDate);
          const newEnd = fromLocalDateString(data.endDate);

          for (let quarter of currentSem.quarters) {
            const existingStart = new Date(quarter.startDate);
            const existingEnd = new Date(quarter.endDate);

            if (
              (newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd)
            ) {
              return false;
            }
          }
          return true;
        },
        {
          message: "Quarter dates overlap with existing quarter",
          path: ["startDate"],
        }
      );
  };

  // React Hook Form setup for semester
  const semesterForm = useForm({
    resolver: zodResolver(createSemesterSchema()),
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
    },
  });

  // React Hook Form setup for quarter
  const quarterForm = useForm({
    resolver: zodResolver(createQuarterSchema()),
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
    },
  });

  const fetchSemestersAndQuarters = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `semester/getSemesterOfCourse/${courseId}`
      );
      setSemesters(res.data.semesters);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching semesters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemestersAndQuarters();
  }, [courseId]);

  // Update form resolvers when semesters change
  useEffect(() => {
    semesterForm.clearErrors();
    quarterForm.clearErrors();
  }, [semesters, activeSemId]);

  const handleCreateSemester = async (data) => {
    try {
      // Convert local date strings to proper dates for API
      const semesterData = {
        ...data,
        startDate: fromLocalDateString(data.startDate).toISOString(),
        endDate: fromLocalDateString(data.endDate).toISOString(),
      };

      await axiosInstance.post(`/semester/create/${courseId}`, semesterData);
      toast.success("Semester created successfully");
      setSemesterModalOpen(false);
      semesterForm.reset();
      fetchSemestersAndQuarters();
    } catch (error) {
      console.error("Error creating semester:", error);
      toast.error("Error creating semester");
    }
  };

  const handleCreateQuarter = async (data) => {
    try {
      // Convert local date strings to proper dates for API
      const quarterData = {
        ...data,
        startDate: fromLocalDateString(data.startDate).toISOString(),
        endDate: fromLocalDateString(data.endDate).toISOString(),
        semester: activeSemId,
      };

      await axiosInstance.post("/quarter/create", quarterData);
      toast.success("Quarter created successfully");
      setQuarterModalOpen(false);
      quarterForm.reset();
      fetchSemestersAndQuarters();
    } catch (error) {
      console.error("Error creating quarter:", error);
      toast.error("Error creating quarter");
    }
  };

  const handleOpenQuarterModal = (semId) => {
    setActiveSemId(semId);
    const selectedSem = semesters.find((sem) => sem._id === semId);

    if (selectedSem && selectedSem.quarters.length > 0) {
      const sortedQuarters = [...selectedSem.quarters].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
      const lastQtr = sortedQuarters[sortedQuarters.length - 1];

      // Set start date to day after last quarter ends
      const nextStart = new Date(lastQtr.endDate);
      nextStart.setDate(nextStart.getDate() + 1);

      quarterForm.reset({
        title: "",
        startDate: toLocalDateString(nextStart),
        endDate: "",
      });
    } else {
      quarterForm.reset({
        title: "",
        startDate: selectedSem
          ? toLocalDateString(new Date(selectedSem.startDate))
          : "",
        endDate: "",
      });
    }

    setQuarterModalOpen(true);
  };

  const handleSemesterArchive = async (semId, isArchived) => {
    setLoadingArchive(semId);
    try {
      await axiosInstance.put(`admin/updateSemArchiveStatus/${semId}`, {
        isArchived: !isArchived,
      });
      toast.success(
        `Semester ${isArchived ? "unarchived" : "archived"} successfully`
      );
      fetchSemestersAndQuarters();
    } catch (error) {
      console.error("Error archiving Semester", error);
      toast.error("Error archiving Semester");
    } finally {
      setLoadingArchive(null);
    }
  };

  const handleQuarterArchive = async (qtrId, isArchived) => {
    setLoadingArchive(qtrId);
    try {
      await axiosInstance.put(`admin/updateQtrArchiveStatus/${qtrId}`, {
        isArchived: !isArchived,
      });
      toast.success(
        `Quarter ${isArchived ? "unarchived" : "archived"} successfully`
      );
      fetchSemestersAndQuarters();
    } catch (error) {
      console.error("Error archiving Quarter", error);
      toast.error("Error archiving Quarter");
    } finally {
      setLoadingArchive(null);
    }
  };

  const lastSemester = semesters[semesters.length - 1];
  const activeSemester = semesters.find((sem) => sem._id === activeSemId);

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <BackButton className="mb-10" />
      <header className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          Grading Periods        </h1>
        <Button
          onClick={() => {
            semesterForm.reset();
            setSemesterModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Semester
        </Button>
      </header>

      <section className="space-y-4">
        {loading ? (
          <p className="p-4 flex justify-center">
            <Loader className="animate-spin" />
          </p>
        ) : (
          semesters.map((sem) => (
            <div
              key={sem._id}
              className={`bg-white rounded-xl shadow-sm p-6 border space-y-4 ${sem.isArchived ? "opacity-50" : ""
                }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sem.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(sem.startDate)} - {formatDate(sem.endDate)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`archive-switch-${sem._id}`}
                      checked={sem.isArchived}
                      disabled={loadingArchive === sem._id}
                      onCheckedChange={() =>
                        handleSemesterArchive(sem._id, sem.isArchived)
                      }
                    />
                    <Label htmlFor={`archive-switch-${sem._id}`}>
                      {sem.isArchived ? "Archived" : "Unarchived"}
                    </Label>
                  </div>

                  <Button
                    disabled={sem.isArchived}
                    variant="outline"
                    onClick={() => handleOpenQuarterModal(sem._id)}
                    className="flex items-center gap-1 text-green-700"
                  >
                    <PlusCircle className="w-4 h-4" /> Quarter
                  </Button>

                  <EditSemesterDialog
                    semester={sem}
                    fetchSemestersAndQuarters={fetchSemestersAndQuarters}
                    courseId={courseId}
                    formatDate={formatDate}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                {sem.quarters.map((qtr) => (
                  <div
                    key={qtr._id}
                    className={`flex justify-between items-center bg-gray-50 rounded-md px-4 py-3 border ${qtr.isArchived ? "opacity-50" : ""
                      }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{qtr.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(qtr.startDate)} - {formatDate(qtr.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`qtr-archive-switch-${qtr._id}`}
                        checked={qtr.isArchived}
                        disabled={sem.isArchived || loadingArchive === qtr._id}
                        onCheckedChange={() =>
                          handleQuarterArchive(qtr._id, qtr.isArchived)
                        }
                      />
                      <Label htmlFor={`qtr-archive-switch-${qtr._id}`}>
                        {qtr.isArchived ? "Archived" : "Unarchived"}
                      </Label>
                      <EditQuarterDialog
                        quarter={qtr}
                        fetchSemestersAndQuarters={fetchSemestersAndQuarters}
                        semester={sem}
                        courseId={courseId}
                        formatDate={formatDate}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Semester Modal */}
      <Dialog open={semesterModalOpen} onOpenChange={setSemesterModalOpen}>
        <DialogContent className="max-w-md rounded-xl border p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              New Semester
            </DialogTitle>
          </DialogHeader>
          {lastSemester && (
            <p className="text-sm mb-3 text-gray-500">
              Last semester ends on:{" "}
              <strong>{formatDate(lastSemester.endDate)}</strong>
            </p>
          )}
          <form
            onSubmit={semesterForm.handleSubmit(handleCreateSemester)}
            className="space-y-3"
          >
            <div>
              <Input
                placeholder="Semester Title"
                {...semesterForm.register("title")}
              />
              {semesterForm.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {semesterForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="date"
                min={today}
                {...semesterForm.register("startDate")}
              />
              {semesterForm.formState.errors.startDate && (
                <p className="text-red-500 text-sm mt-1">
                  {semesterForm.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="date"
                min={today}
                {...semesterForm.register("endDate")}
              />
              {semesterForm.formState.errors.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {semesterForm.formState.errors.endDate.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={semesterForm.formState.isSubmitting}
            >
              {semesterForm.formState.isSubmitting
                ? "Creating..."
                : "Create Semester"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quarter Modal */}
      <Dialog open={quarterModalOpen} onOpenChange={setQuarterModalOpen}>
        <DialogContent className="max-w-md rounded-xl border p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Quarter</DialogTitle>
          </DialogHeader>

          {activeSemester && (
            <p className="text-sm mb-1 text-gray-500">
              Semester duration:{" "}
              <strong>
                {formatDate(activeSemester.startDate)} -{" "}
                {formatDate(activeSemester.endDate)}
              </strong>
            </p>
          )}

          <form
            onSubmit={quarterForm.handleSubmit(handleCreateQuarter)}
            className="space-y-3"
          >
            <div>
              <Input
                placeholder="Quarter Title"
                {...quarterForm.register("title")}
              />
              {quarterForm.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {quarterForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="date"
                min={today}
                {...quarterForm.register("startDate")}
              />
              {quarterForm.formState.errors.startDate && (
                <p className="text-red-500 text-sm mt-1">
                  {quarterForm.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="date"
                min={today}
                {...quarterForm.register("endDate")}
              />
              {quarterForm.formState.errors.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {quarterForm.formState.errors.endDate.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={quarterForm.formState.isSubmitting}
            >
              {quarterForm.formState.isSubmitting
                ? "Creating..."
                : "Create Quarter"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Semester;
