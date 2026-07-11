import React, { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  BookOpen,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        // Using axiosInstance as requested
        const response = await axiosInstance.get(`stripe/getPurchases`);

        // Assuming your backend returns { success: true, data: [...] }
        setPurchases(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setError("Failed to load purchase history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 text-red-500 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Billing & Invoices
          </h1>
          <p className="text-gray-500 mt-1">
            View your transactions and manage receipts.
          </p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-2">
          <CreditCard className="text-indigo-600" size={18} />
          <span className="text-sm font-medium text-indigo-800">
            Default: Stripe
          </span>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Course & Reference
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Plan
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                // Skeleton Loader
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-6 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : purchases.length > 0 ? (
                purchases.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/30 transition-all duration-200"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-none mb-1">
                            {item.course?.courseTitle || "Course Material"}
                          </p>
                          <p className="text-xs text-gray-400 font-mono tracking-tighter">
                            ID:{" "}
                            {item.stripeInvoiceId?.slice(0, 12) ||
                              item.paymentIntentId?.slice(0, 12)}
                            ...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 italic">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-bold text-gray-900">
                        {item.currency.toUpperCase() === "USD" ? "$" : ""}
                        {item.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                          item.paymentType === "SUBSCRIPTION"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {item.invoicePdf && (
                          <a
                            href={item.invoicePdf}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Download PDF Invoice"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        {item.receiptUrl && (
                          <a
                            href={item.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Stripe Receipt"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CreditCard size={48} className="mb-2" />
                      <p className="text-lg font-medium">
                        No transactions found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
