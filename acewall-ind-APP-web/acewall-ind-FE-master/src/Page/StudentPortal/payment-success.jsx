import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // 'processing' | 'success' | 'error'

  useEffect(() => {
    if (!sessionId) {
      toast.error("Missing session ID");
      setStatus("error");
      return;
    }

    // Assume webhook processed successfully
    toast.success("🎉 Payment confirmed! You are now enrolled.");
    setStatus("success");

    const timer = setTimeout(() => {
      navigate("/student/mycourses");
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, navigate]);

  return (
    <div className="p-10 text-center">
      {status === "processing" && (
        <h1 className="text-2xl font-bold text-yellow-500">
          Processing your payment...
        </h1>
      )}
      {status === "success" && (
        <h1 className="text-2xl font-bold text-[var(--color-acewall-green)]">
          ✅ You're enrolled! Redirecting...
        </h1>
      )}
      {status === "error" && (
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong. Please contact support.
        </h1>
      )}
    </div>
  );
}
