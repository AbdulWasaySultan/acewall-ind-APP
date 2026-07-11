"use client";
import * as React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { TransactionCard, EarningStateCard } from "@/CustomComponent/Card";
import { CustomDatePicker } from "@/CustomComponent/teacher/wallet/datepicker";
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";

export default function EarningDetail() {
  const [fromDate, setFromDate] = React.useState(null);
  const [toDate, setToDate] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [summary, setSummary] = React.useState({
    totalEarnings: 0,
    totalRevenue: 0,
    totalSales: 0,
  });

  const [transactions, setTransactions] = React.useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/teacher/earnings"); // assumes auth middleware sets req.user.id
      const { earnings, recentTransactions } = res.data;

      setSummary({
        totalEarnings: earnings.totalEarnings,
        totalRevenue: earnings.totalRevenue,
        totalSales: earnings.totalSales,
      });

      // Format for TransactionCard
      const formatted = recentTransactions.map((tx) => ({
        date: new Date(tx.createdAt).toLocaleDateString(),
        time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: tx.teacherEarning,
        type: "Earning",
        balance: "-", // Add if tracking balance
      }));

      setTransactions(formatted);
    } catch (err) {
      console.error("Failed to fetch earnings", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <p className="text-xl py-4 mb-4 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
        Transaction
      </p>

      {/* Filter UI - not wired yet */}
      {/* <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-blue-500 ml-2">From</p>
          <CustomDatePicker selectedDate={fromDate} onChange={setFromDate} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-blue-500 ml-2">To</p>
          <CustomDatePicker selectedDate={toDate} onChange={setToDate} />
        </div>
        <Button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white">
          Apply Filter
        </Button>
      </div> */}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <EarningStateCard
          data={{
            value: `$${summary.totalEarnings.toFixed(2)}`,
            description: "Total Earnings",
            icon: <DollarSign className="text-white" />,
            bgColor: "bg-green-500",
          }}
        />
        <EarningStateCard
          data={{
            value: `${summary.totalSales}`,
            description: "Total Sales",
            icon: <ShoppingCart className="text-white" />,
            bgColor: "bg-green-500",
          }}
        />
        <EarningStateCard
          data={{
            value: `$${summary.totalRevenue.toFixed(2)}`,
            description: "Total Revenue",
            icon: <TrendingUp className="text-white" />,
            bgColor: "bg-yellow-500",
          }}
        />
      </div>

      {/* Transaction Table */}
      <TransactionCard title="Earnings" data={transactions} />  
    </div>
  );
}
