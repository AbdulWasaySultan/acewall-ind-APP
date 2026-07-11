import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CartModal({ purchaseCourse }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={"bg-green-600 hover:bg-green-700 "}
        onClick={() => setOpen(true)}
      >
        Purchase Course
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this course? You will get
              instant access after payment.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className={"bg-green-600 hover:bg-green-700 "}
              onClick={() => {
                // Handle purchase logic here
                purchaseCourse();
                setOpen(false);
              }}
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
