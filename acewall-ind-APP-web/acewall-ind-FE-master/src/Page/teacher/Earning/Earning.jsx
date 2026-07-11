"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { EarningStateCard } from "@/CustomComponent/Card";
import { axiosInstance } from "@/lib/AxiosInstance";
import {
  Layers,
  Wallet,
  Receipt,
  Download,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

export default function Earning() {
  const [paymentStats, setPaymentStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [ariaMessage, setAriaMessage] = useState("");

  // Fetch payment statistics and withdrawal data
  const fetchPaymentStats = async () => {
    try {
      const res = await axiosInstance.get("teacher/teacher-payment-stats");
      setPaymentStats(res.data.stats); 
      setChartData(res.data.revenueOverTime); 
      setRecentWithdrawals(res.data.recentWithdrawals); 
    } catch (error) {
      console.error("Failed to load payment stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  // ADA Compliant CSV Export Function
  const handleExportCSV = () => {
    if (recentWithdrawals.length === 0) return;
    
    setIsExporting(true);
    setAriaMessage("Preparing your CSV download...");

    // Create CSV content
    const headers = ["Amount", "Method", "Date", "Status"];
    const rows = recentWithdrawals.map(w => [
      `$${w.amount.toFixed(2)}`,
      w.method || 'N/A',
      new Date(w.processedAt || w.requestedAt).toLocaleDateString(),
      w.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `withdrawals_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      setAriaMessage("CSV file has been downloaded successfully.");
    }, 1000);
  };

  const cardDetails = paymentStats
    ? [
      {
        icon: <Layers className="h-6 w-6 text-orange-600" aria-hidden="true" />,
        bgColor: "bg-orange-50",
        value: `$${paymentStats.totalRevenue.toFixed(2)}`,
        description: "Total Revenue",
      },
      {
        icon: <Wallet className="h-6 w-6 text-indigo-600" aria-hidden="true" />,
        bgColor: "bg-indigo-50",
        value: `$${paymentStats.currentBalance.toFixed(2)}`,
        description: "Current Balance",
      },
      {
        icon: <Receipt className="h-6 w-6 text-red-600" aria-hidden="true" />,
        bgColor: "bg-red-50",
        value: `$${paymentStats.totalWithdrawals.toFixed(2)}`,
        description: "Total Withdrawals",
      },
      {
        icon: <Wallet className="h-6 w-6 text-blue-700" aria-hidden="true" />,
        bgColor: "bg-blue-50",
        value: `$${paymentStats.todayRevenue.toFixed(2)}`,
        description: "Today Revenue",
      },
    ]
    : [];

  return (
    <main className="container mx-auto p-3 md:p-0 max-w-7xl" id="main-content">
      {/* Hidden live region for status announcements */}
      <div className="sr-only" role="alert" aria-live="assertive">
        {ariaMessage}
      </div>

      <h1 className="text-xl py-4 mb-8 pl-6 font-semibold bg-blue-700 text-white rounded-lg">
        My Earnings
      </h1>

      <div aria-live="polite">
        {loading ? (
          <div className="text-center text-muted-foreground mb-8 py-10" role="status">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" aria-hidden="true" />
            Loading earning statistics...
          </div>
        ) : (
          <>
            {/* Earnings Summary Cards */}
            <section aria-label="Earnings Overview">
              {paymentStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {cardDetails.map((data, index) => (
                    <div key={index}>
                      <EarningStateCard data={data} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            

            {/* Revenue Chart Section */}
            <section aria-labelledby="revenue-chart-title">
              {chartData.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 id="revenue-chart-title" className="text-lg font-medium text-gray-900">Revenue Statistics</h2>
                      <Link 
                        to="/teacher/wallet/detail"
                        className="text-sm font-bold text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded outline-none"
                        aria-label="View more detailed earning reports"
                      >
                        More Details
                      </Link>
                    </div>

                    <div className="ml-5 h-80 w-full" role="region" aria-label="Revenue history line chart">
                      <ResponsiveContainer width="95%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                          <YAxis fontSize={12} tickMargin={10} />
                          <Tooltip 
                            formatter={(value) => `$${value}`} 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#15803d"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Withdrawal Table Section */}
            <section aria-labelledby="withdrawals-table-title">
              {recentWithdrawals.length >= 0 && (
                <Card className="mt-8">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between mb-6 gap-4">
                      <h2 id="withdrawals-table-title" className="text-lg font-medium text-gray-900">Recent Withdrawals</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button 
                          onClick={handleExportCSV}
                          disabled={isExporting || recentWithdrawals.length === 0}
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-500"
                        >
                          {isExporting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                          Export CSV
                        </Button>
                        <Link to="/teacher/wallet/withdraw">
                          <Button className="bg-blue-700 hover:bg-blue-800 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
                            Withdraw Funds
                          </Button>
                        </Link>
                        <Link to="/teacher/wallet/allwithdrawals">
                          <Button className="bg-gray-600 hover:bg-gray-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500">
                            View All
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="overflow-x-auto" role="region" aria-label="Withdrawal history table">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-gray-200">
                            <th scope="col" className="p-3 font-semibold text-gray-700">Amount</th>
                            <th scope="col" className="p-3 font-semibold text-gray-700">Method</th>
                            <th scope="col" className="p-3 font-semibold text-gray-700">Date</th>
                            <th scope="col" className="p-3 font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentWithdrawals.slice(0, 4).map((withdrawal, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 text-blue-800 font-bold">
                                ${withdrawal.amount.toFixed(2)}
                              </td>
                              <td className="p-3 capitalize text-gray-600">
                                {withdrawal.method || 'N/A'}
                              </td>
                              <td className="p-3 text-gray-600">
                                {new Date(withdrawal.processedAt || withdrawal.requestedAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    withdrawal.status === 'approved'
                                      ? 'bg-blue-100 text-blue-800'
                                      : withdrawal.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {withdrawal.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {recentWithdrawals.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No recent withdrawal history found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}