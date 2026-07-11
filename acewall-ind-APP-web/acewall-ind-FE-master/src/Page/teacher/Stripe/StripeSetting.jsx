import React, { useContext, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Button } from "@/components/ui/button";

export default function StripeSettings() {
  const { UpdatedUser, fetchUser } = useContext(GlobalContext);
  const initialStripeId = UpdatedUser?.stripeAccountId || "";
  const [stripeId, setStripeId] = useState(initialStripeId);
  const [loading, setLoading] = useState(false);
  const [onBoadingLoading, setOnBoadingLoading] = useState(false);
  const [isOnboard, setIsonBoard] = useState(false);

  const handleRedirecting = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("stripe/onboarding");
      const { url } = response.data;
      if (url) {
        window.location.assign(url);
      }
    } catch (err) {
      toast.error("Failed to start onboarding");
      console.error("Onboarding Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("stripe/getStripeLoginLink");
      const { url } = response.data;
      if (url) {
        const newTab = window.open(url, "_blank");
        if (newTab) {
          newTab.opener = null;
        }
      }
    } catch (err) {
      toast.error("Failed to access Stripe dashboard");
      console.error("Login Link Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeAccCreation = async () => {
    try {
      setLoading(true); // Added loading state here
      const response = await axiosInstance.patch("stripe/createAccount", {
        email: UpdatedUser.email,
      });
      console.log(
        "Stripe Account Creation Response:",
        response.data.account.id,
      );

      fetchUser();
      // Update local state immediately
      setStripeId(response.data.account.id);

      // Check onboarding for the new ID
      checkOnboarding(response.data.account.id);
      window.location.reload();
      toast.success(
        response?.data?.message || "Stripe account created successfully",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to create Stripe account",
      );
      console.error("Stripe Account Creation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkOnboarding = async (idToCheck) => {
    // Use passed ID or fallback to current state/initial
    const currentId = idToCheck || stripeId || initialStripeId;

    if (!currentId) return; // Don't check if no ID exists

    try {
      setOnBoadingLoading(true);
      const response = await axiosInstance.post("stripe/checkOnboarding", {
        stripeAccountId: currentId,
      });

      setIsonBoard(response.data.onboarded);
      setStripeId(response.data.stripeId);
    } catch (error) {
      console.log(error, "error in the check onboarding");
    } finally {
      setOnBoadingLoading(false);
    }
  };

  useEffect(() => {
    if (initialStripeId) {
      checkOnboarding(initialStripeId);
    }
  }, [initialStripeId]);

  return (
    <section className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Stripe Integration</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Account ID Display */}
          <div>
            <Label className="text-muted-foreground">Current Account ID</Label>
            <div className="mt-1 p-3 bg-slate-50 border rounded-md font-mono text-sm break-all">
              {stripeId ? stripeId : "No Stripe ID connected"}
            </div>
          </div>

          {/* Conditional UI Status */}
          <div className="flex flex-col gap-4">
            {onBoadingLoading ? (
              // 1. Loading State
              <div className="flex justify-center items-center h-10 bg-slate-100 rounded-md">
                <Loader className="animate-spin text-slate-500" />
              </div>
            ) : isOnboard ? (
              // 2. Fully Onboarded (Payouts Enabled)
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Your payouts are enabled</span>
                </div>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full flex gap-2"
                  disabled={loading}
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Stripe Dashboard
                </Button>
              </div>
            ) : stripeId ? (
              // 3. Account Exists, but Payouts NOT Enabled
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Action Required: Enable Payouts
                  </span>
                </div>
                <Button
                  onClick={handleRedirecting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Complete Onboarding"}
                </Button>
              </div>
            ) : (
              // 4. No Account Exists
              <Button
                className="w-full"
                onClick={() => handleStripeAccCreation()}
                disabled={loading}
              >
                {loading ? <Loader className="animate-spin mr-2" /> : null}
                Create Stripe Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
