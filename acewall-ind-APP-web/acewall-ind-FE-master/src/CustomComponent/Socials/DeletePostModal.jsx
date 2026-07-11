import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmDialog({ onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(); // Support async deletion
    setOpen(false); // Close dialog after delete
  };

  return (
    <div>
      {/* Trash icon button, now keyboard accessible */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Delete post"
        className="text-red-400 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
      >
        <Trash2 />
      </button>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle id="delete-dialog-title">
              Are you sure you want to delete?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            This action cannot be undone. It will permanently delete this post.
          </p>

          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              autoFocus
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
