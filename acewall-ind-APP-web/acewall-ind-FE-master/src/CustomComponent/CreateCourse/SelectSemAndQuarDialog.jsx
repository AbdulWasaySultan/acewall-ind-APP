import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SelectSemester from "./SelectSemester";
import SelectQuarter from "./SelectQuarter";
import axios from "axios";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

const Schema = z.object({
  semester: z
    .array(z.string().nonempty({ message: "Please select a semester" }))
    .min(1, { message: "Please select a semester" }),
  quarter: z
    .array(z.string().nonempty({ message: "Please select a quarter" }))
    .min(1, { message: "Please select a quarter" }),
});
export function SelectSemAndQuarDialog({
  prevSelectedSemesters,
  prevSelectedQuarters,
  courseId,
  fetchCourseDetail,
}) {
  const [selectedSemester, setSelectedSemester] = useState({});
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(Schema),
    defaultValues: {
      semester: prevSelectedSemesters ? [...prevSelectedSemesters] : [],
      quarter: prevSelectedQuarters ? [...prevSelectedQuarters] : [],
    },
  });

  console.log(selectedSemester, "selectedSemester");

  console.log(errors, "errors");

  const onSubmit = async (data) => {
    console.log(data, "submitted data");

    await axiosInstance
      .post(`semester/selectingNewSemesterwithQuarter/${courseId}`, data)
      .then((res) => {
        setOpen(false);
        toast.success(res.data.message);
        fetchCourseDetail();
        reset();
      })
      .catch((err) => {
        console.log(err, "error");
        toast.error(
          err.response?.data?.message || "Error selecting semester and quarter"
        );
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={"bg-green-500 hover:bg-green-600"}>
          Add new semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <SelectSemester
                register={register}
                errors={errors}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                prevSelectedSemesters={prevSelectedSemesters}
              />
            </div>
            <div className="grid gap-3">
              <SelectQuarter  
                register={register}
                errors={errors}
                selectedSemester={selectedSemester}
                prevSelectedQuarters={prevSelectedQuarters}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button> 
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
