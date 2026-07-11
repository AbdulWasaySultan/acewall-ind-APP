"use client";
import { useState } from "react";
import { axiosInstance } from "../../../lib/AxiosInstance";
import BackButton from "@/CustomComponent/BackButton";
import { Loader2 } from "lucide-react"; // Optional: for a better loading spinner

export default function WithdrawRequestForm() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("stripe");
  const [stripeAccountId, setStripeAccountId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'success' | 'error'
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Enter a valid amount.");
      setStatus("error");
      return;
    }

    if (method === "stripe" && !stripeAccountId.trim()) {
      setMessage("Please enter your Stripe Account ID.");
      setStatus("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setStatus("idle");

    try {
      const res = await axiosInstance.post("/teacher/withdraw", {
        amount: parseFloat(amount),
        method,
        stripeAccountId: method === "stripe" ? stripeAccountId.trim() : undefined,
      });

      setMessage(res.data.message);
      setStatus("success");
      setAmount("");
      setStripeAccountId("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to request withdrawal");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-3 md:p-0">
      <nav aria-label="Back navigation">
        <BackButton className="mt-2 mb-6" />
      </nav>

      <div className="max-w-lg mx-auto p-8 bg-white shadow-xl rounded-lg space-y-6 border border-gray-100">
        {/* Heading Section */}
        <header className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Your Withdrawal</h1>
          <p className="text-sm text-gray-600">
            Enter the amount you'd like to withdraw. Make sure to provide your correct Stripe Account ID.
          </p>
        </header>

        

        {/* Withdrawal Form */}
        <div className="space-y-5">
          {/* Amount Input */}
          <div>
            <label htmlFor="withdraw-amount" className="block text-sm font-bold text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 50.00"
              aria-required="true"
            />
          </div>

          {/* Method Selection */}
          <div>
            <label htmlFor="payment-method" className="block text-sm font-bold text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="stripe">Stripe</option>
            </select>
          </div>

          {/* Stripe Account ID */}
          {method === "stripe" && (
            <div className="animate-in fade-in duration-300">
              <label htmlFor="stripe-id" className="block text-sm font-bold text-gray-700 mb-2">
                Stripe Account ID
              </label>
              <input
                id="stripe-id"
                type="text"
                value={stripeAccountId}
                onChange={(e) => setStripeAccountId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="acct_xxxxxxxxxxxx"
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-2">
                Find this in your Stripe Dashboard under Settings &gt; Account details.
              </p>
            </div>
          )}

          {/* Status Message - ARIA LIVE REGION */}
          <div 
            aria-live="polite" 
            className="min-h-[1.25rem]"
          >
            {message && (
              <p className={`text-sm font-medium p-3 rounded-md ${
                status === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Processing..." : "Submit Withdrawal Request"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}