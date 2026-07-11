import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/CustomComponent/BackButton";
import { Layers, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"; 
import { axiosInstance } from "@/lib/AxiosInstance";

export default function AllWithdrawals() {
    const [allWithdrawals, setAllWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalWithdrawalsCount: 0,
    });

    const pageSize = 16;

    const fetchAllWithdrawals = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("teacher/teacher-payment-stats", {
                params: { page, pageSize },
            });

            if (res.data?.recentWithdrawals) {
                setAllWithdrawals(res.data.recentWithdrawals);
                setPagination({
                    currentPage: res.data.pagination.currentPage,
                    totalPages: res.data.pagination.totalPages,
                    totalWithdrawalsCount: res.data.pagination.totalWithdrawalsCount,
                });
            } else {
                setError("No withdrawals found.");
            }
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to fetch withdrawals. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllWithdrawals(pagination.currentPage);
    }, [pagination.currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: newPage });
        }
    };

    const calculateWithdrawalStats = () => {
        const stats = { approved: 0, pending: 0, rejected: 0 };
        allWithdrawals.forEach((w) => {
            if (w.status === "approved") stats.approved++;
            if (w.status === "pending") stats.pending++;
            if (w.status === "rejected") stats.rejected++;
        });
        return stats;
    };

    const withdrawalStats = calculateWithdrawalStats();

    return (
        <main className="container mx-auto p-3 md:p-0 max-w-7xl" id="main-content">
            <h1 className="text-xl py-4 mb-8 pl-6 font-semibold bg-green-600 text-white rounded-lg shadow-md">
                All Withdrawals
            </h1>
            
            <nav aria-label="Back navigation" className="mb-6">
                <BackButton />
            </nav>

            {/* Summary Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-label="Withdrawal Summary">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <CheckCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
                            <span className="text-2xl font-bold text-blue-900">{withdrawalStats.approved}</span>
                        </div>
                        <p className="text-sm font-medium text-blue-800 uppercase tracking-wide">Approved</p>
                    </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <Clock className="h-8 w-8 text-yellow-600" aria-hidden="true" />
                            <span className="text-2xl font-bold text-yellow-900">{withdrawalStats.pending}</span>
                        </div>
                        <p className="text-sm font-medium text-yellow-800 uppercase tracking-wide">Pending</p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <XCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
                            <span className="text-2xl font-bold text-red-900">{withdrawalStats.rejected}</span>
                        </div>
                        <p className="text-sm font-medium text-red-800 uppercase tracking-wide">Rejected</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <Layers className="h-8 w-8 text-gray-600" aria-hidden="true" />
                            <span className="text-2xl font-bold text-gray-900">{pagination.totalWithdrawalsCount}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">Total Requests</p>
                    </CardContent>
                </Card>
            </section>

            <div className="mt-6 mb-6 text-right">
                <Link to="/teacher/wallet/withdraw" className="inline-block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 rounded-md">
                    <Button className="bg-green-600 hover:bg-green-600 text-white font-bold px-6 py-2 shadow-sm">
                        Request New Withdrawal
                    </Button>
                </Link>
            </div>

            {/* Content Area */}
            <div aria-live="polite" className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                        <p className="text-lg">Fetching withdrawal history...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-700 bg-red-50 border border-red-200 p-8 rounded-lg" role="alert">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <section aria-labelledby="history-heading">
                        <Card>
                            <CardContent className="p-6">
                                <h2 id="history-heading" className="text-lg font-bold text-gray-900 mb-6">Withdrawal History</h2>

                                <div className="overflow-x-auto rounded-lg border border-gray-100">
                                    <table className="min-w-full text-sm" aria-describedby="history-heading">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th scope="col" className="p-4 text-left font-bold text-gray-700">Amount</th>
                                                <th scope="col" className="p-4 text-left font-bold text-gray-700">Method</th>
                                                <th scope="col" className="p-4 text-left font-bold text-gray-700">Date</th>
                                                <th scope="col" className="p-4 text-left font-bold text-gray-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {allWithdrawals.map((withdrawal, index) => (
                                                <tr key={withdrawal._id || index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-green-800 font-bold">
                                                        ${withdrawal?.amount?.toFixed(2) || "0.00"}
                                                    </td>
                                                    <td className="p-4 capitalize text-gray-600 font-medium">
                                                        {withdrawal?.method || "N/A"}
                                                    </td>
                                                    <td className="p-4 text-gray-500">
                                                        {new Date(withdrawal?.processedAt || withdrawal?.requestedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                                withdrawal?.status === "approved"
                                                                    ? "bg-green-100 text-green-900"
                                                                    : withdrawal?.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-900"
                                                                        : "bg-red-100 text-red-900"
                                                            }`}
                                                        >
                                                            {withdrawal?.status?.toUpperCase() || "N/A"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination controls */}
                                <nav className="mt-10 flex justify-center items-center gap-6" aria-label="Withdrawal history pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </section>
                )
            }
            </div>
        </main>
    );
}