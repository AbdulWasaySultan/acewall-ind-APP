import React, { useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Info,
  CheckCircle2,
  Infinity,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { axiosInstance } from "@/lib/AxiosInstance";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

const EnrollmentStatusCard = ({
  enrollment,
  open,
  setOpen,
  getCourseDetails,
}) => {
  const { trial, status, subscriptionId, enrollmentType, enrolledAt } =
    enrollment;

  const [canceling, setCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const getDaysRemaining = (endDate) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isTrialActive = status === "TRIAL" && trial?.status;
  const daysLeft = isTrialActive ? getDaysRemaining(trial.endDate) : 0;

  const handleCancelSubscription = async (e) => {
    e.preventDefault();
    await axiosInstance
      .post("/stripe/cancelSubscriptionAtPeriodEnd", {
        subscriptionId,
        comment: cancelReason,
      })
      .then((res) => {
        toast.success(
          res.data.message || "Subscription cancelled successfully",
        );
        setOpen(false);
        setCancelReason("");
        setCanceling(false);
        getCourseDetails();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to cancel subscription",
        );
      });
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      {/* 1. PROMINENT TRIAL ALERT */}
      {isTrialActive && (
        <Alert className="border-slate-200 bg-slate-50 text-slate-800 shadow-sm w-full">
          <Clock className="h-4 w-4 text-indigo-500" />
          <AlertTitle className="font-semibold text-indigo-900">
            Trial Period Update
          </AlertTitle>
          <AlertDescription className="text-slate-600">
            <strong>{daysLeft} days remaining</strong>
          </AlertDescription>
        </Alert>
      )}

      {status === "APPLIEDFORCANCEL" && (
        <Alert className="border-slate-200 bg-slate-50 text-slate-800 shadow-sm w-full">
          <Clock className="h-4 w-4 text-indigo-500" />
          <AlertTitle className="font-semibold text-indigo-900">
            You have cancelled your subscription. Access will continue until the
            end of the billing period.
          </AlertTitle>
        </Alert>
      )}

      {enrollmentType && (
        <Card className="overflow-hidden border-2">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {enrollmentType} ACCESS
                </span>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {enrollmentType === "SUBSCRIPTION" && (
                    <CreditCard className="h-5 w-5" />
                  )}
                  {enrollmentType === "ONETIME" && (
                    <Infinity className="h-5 w-5 text-blue-500" />
                  )}
                  {enrollmentType === "FREE" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {enrollmentType.charAt(0) +
                    enrollmentType.slice(1).toLowerCase()}
                </h3>
              </div>

              {status === "CANCELLED" ? (
                <Badge variant="destructive">Cancelled</Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 hover:bg-green-100"
                >
                  Active
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Dialog open={open}>
                <DialogTrigger asChild>
                  <Button
                    variant=""
                    className="w-full justify-start"
                    onClick={() => setOpen(true)}
                  >
                    <Info className="mr-2 h-4 w-4" /> Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enrollment Management</DialogTitle>
                    <DialogDescription>
                      Manage your billing and view your access details.
                    </DialogDescription>
                    {status === "APPLIEDFORCANCEL" && (
                      <p className="mt-2 text-sm text-yellow-700">
                        You have cancelled your subscription. Access will
                        continue until the end of the billing period.
                      </p>
                    )}
                  </DialogHeader>

                  <div className="space-y-4 py-4 border-t border-b my-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled On</span>
                      <span className="font-medium">
                        {new Date(enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                    {subscriptionId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono text-xs">
                          {subscriptionId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline">{status}</Badge>
                    </div>
                  </div>

                  <DialogFooter className="sm:justify-between flex-row gap-2">
                    {/* 2. CANCEL SUBSCRIPTION OPTION */}

                    {enrollmentType === "SUBSCRIPTION" &&
                      status !== "CANCELLED" &&
                      status !== "APPLIEDFORCANCEL" &&
                      !canceling && (
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setCanceling(true);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </Button>
                      )}

                    {canceling && (
                      <form
                        onSubmit={handleCancelSubscription}
                        className="flex flex-col gap-2 w-full"
                      >
                        <Input
                          placeholder="Reason"
                          value={cancelReason}
                          required
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-black px-4 py-2 rounded"
                            onClick={() => setCanceling(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* {enrollmentType === "SUBSCRIPTION" &&
                    status !== "CANCELLED" &&
                    status !== "APPLIEDFORCANCEL" && (
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleCancelSubscription();
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </Button>
                    )} */}
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnrollmentStatusCard;
