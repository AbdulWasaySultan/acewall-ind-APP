import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnboardingSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: auto redirect after some time
    // const timer = setTimeout(() => navigate("/teacher"), 5000);
    // return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Onboarding Successful!</h1>
          <p className="text-slate-500 text-lg">
            Your Stripe account has been successfully connected and payouts are enabled.
          </p>
        </div>

        <Button
          onClick={() => navigate("/teacher")}
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold flex gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-xs text-slate-400">
          You can now start receiving payments for your courses.
        </p>
      </div>
    </div>
  );
};

export default OnboardingSuccessPage;
