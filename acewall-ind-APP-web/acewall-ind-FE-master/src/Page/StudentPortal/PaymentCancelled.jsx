import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Optionally, confirm the payment on your backend or display a success message
      toast.error("Payment not successful!");
    }
  }, [sessionId]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Payment Cancelled</h1>
        <p>Your payment has been cancelled. Please try again or contact support if you need assistance.</p>
      </div>
    </div>
  );
}
