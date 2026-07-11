import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, PlusCircle } from "lucide-react";

const StripeIdModal = ({
  setInputValue,
  loading,
  handleUpdateId,
  open,
  setOpen,
  stripeId,
  inputValue,
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={stripeId ? "outline" : "default"} className="w-full">
            {stripeId ? (
              <>
                <Pencil className="w-4 h-4 mr-2" /> Edit Stripe ID
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Stripe ID
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Stripe Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stripe-id">Stripe Account ID (acct_...)</Label>
              <Input
                id="stripe-id"
                placeholder="acct_123456789"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateId} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StripeIdModal;
