// components/ApplyReverificationDialog.jsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

export const ApplyReverificationDialog = ({ courseID, fetchCourseDetail }) => {
  const { register, handleSubmit, reset } = useForm();

  const handleApply = async (data) => {
    await axiosInstance
      .put(`course/reapply/${courseID}`, {
        request: data.request,
      })
      .then((res) => {
        toast.success(res.data.message);
        fetchCourseDetail();
        reset();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Apply for Re-verification</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(handleApply)}>
          <DialogHeader>
            <DialogTitle>Course Re-verification Request</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="request">Your Request</Label>
              <Textarea
                id="request"
                placeholder="State your reason for re-verification..."
                {...register("request", { required: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => reset()}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
