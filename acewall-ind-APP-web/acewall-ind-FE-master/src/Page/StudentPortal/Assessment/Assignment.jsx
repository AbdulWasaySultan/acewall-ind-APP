"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  Calendar,
  Clock,
  Loader,
  GraduationCap,
  Layers,
  ArrowLeft,
  Search,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosInstance } from "@/lib/AxiosInstance";
import { format } from "date-fns";
import { useParams, Link, useNavigate } from "react-router-dom";
import AssessmentFilters from "@/CustomComponent/Student/AssessmentFilters";

// Custom Toast Component & Sonner
import MotivationToast from "@/CustomComponent/Toast/MotivationToast";
import { toast } from "sonner";
import BackButton from "@/CustomComponent/BackButton";

const tableHead = [
  "Assessment Name",
  "Course",
  "Location",
  "Due Date",
  "Status",
];

const Assessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    status: "all",
  });

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          "assessment/getAllassessmentforStudent",
        );

        // 1. Filter by Course ID if provided in URL
        let data = id ? res.data.filter((a) => a.course?._id === id) : res.data;

        setAssessments(data);

        // 2. Extract unique categories for filter dropdown
        const uniqueCategories = [];
        data.forEach((a) => {
          if (
            a.category?._id &&
            !uniqueCategories.some((c) => c._id === a.category._id)
          ) {
            uniqueCategories.push(a.category);
          }
        });
        setCategories(uniqueCategories);

        // 3. Extract unique types
        setTypes([...new Set(data.map((a) => a.type))]);

        // 4. 🔥 Motivation Toast Logic
        const pending = data.filter((a) => !a.isSubmitted);
        if (pending.length > 0) {
          const nearestDueDate = pending
            .filter((a) => a?.dueDate?.date)
            .map((a) => new Date(a.dueDate.date))
            .sort((a, b) => a - b)[0];

          toast.custom(
            (t) => (
              <MotivationToast
                pendingCount={pending.length}
                nearestDueDate={nearestDueDate}
                onClose={() => toast.dismiss(t.id)}
              />
            ),
            { position: "top-right", duration: 5000 },
          );
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch assessments");
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const getPenaltyMessage = (policy) => {
    const { policyType, deductionValue, deductionType } = policy;
    const unit = deductionType === "percentage" ? "%" : " points";
    const frequency =
      policyType === "daily" ? "per day" : "as a one-time penalty";

    return `Late submissions will incur a ${deductionValue}${unit} deduction ${frequency}.`;
  };

  const formatDueDate = (date, time) => {
    if (!date) return "No Deadline";
    try {
      const dateObj = new Date(date);
      return `${format(dateObj, "MMM dd, yyyy")} ${time ? `at ${time}` : ""}`;
    } catch {
      return "Invalid date";
    }
  };

  // ✅ Helper for Semester/Chapter Display
  const getLocationInfo = (item) => {
    if (item.course?.semesterbased) {
      return (
        <div className="flex flex-col text-[11px] text-blue-600 font-medium">
          <span className="flex items-center gap-1">
            <GraduationCap size={12} /> {item.semester?.name || "Sem"}
          </span>
          <span className="text-gray-400 pl-4">{item.quarter?.name}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col text-[11px] text-orange-600 font-medium">
        <span className="flex items-center gap-1">
          <Layers size={12} /> {item.chapter?.title || "Ch"}
        </span>
        <span className="text-gray-400 pl-4 truncate max-w-[100px]">
          {item.lesson?.title}
        </span>
      </div>
    );
  };

  // ✅ Search + Filter Logic
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesSearch = a.title
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        filters.category === "all" || a.category?.name === filters.category;
      const matchesType = filters.type === "all" || a.type === filters.type;
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "submitted" && a.isSubmitted) ||
        (filters.status === "pending" && !a.isSubmitted);

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [assessments, search, filters]);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader className="animate-spin text-acewall-main" size={40} />
      </div>
    );

  return (
    <div className="w-full   ">
      {/* Header */}
      <BackButton className="my-4 bg-[#10B981] text-white border-none hover:bg-[#10B981]" />
      <h1 className="text-xl py-4 pl-6 font-semibold bg-acewall-main text-white rounded-lg shadow-md flex-1 mb-4">
        {id ? "Course Assessment Details" : "All My Assessments"}
      </h1>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <AssessmentFilters
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          types={types}
        />
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                {tableHead.map((item, idx) => (
                  <TableHead
                    key={idx}
                    className="font-bold text-gray-700 uppercase text-[11px] tracking-wider"
                  >
                    {item}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((item) => {
                  const isExpanded = expandedAssessmentId === item._id;
                  return (
                    <React.Fragment key={item._id}>
                      <TableRow
                        className={`group cursor-pointer transition-colors ${
                          isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setExpandedAssessmentId(isExpanded ? null : item._id)
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown
                                size={16}
                                className="text-acewall-main"
                              />
                            ) : (
                              <ChevronRight
                                size={16}
                                className="text-gray-400"
                              />
                            )}
                            <span
                              className={
                                item.isSubmitted
                                  ? "text-gray-400 line-through"
                                  : "text-gray-900"
                              }
                            >
                              {item.title}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-gray-600">
                          {item.course?.courseTitle}
                        </TableCell>

                        <TableCell>{getLocationInfo(item)}</TableCell>

                        <TableCell className="text-xs">
                          <div
                            className={`${
                              item.isExtended
                                ? "bg-green-500/10 text-green-700 font-medium rounded-full w-max px-2 py-1"
                                : ""
                            }`}
                            title={
                              item.isExtended
                                ? "Due date extended by the teacher"
                                : ""
                            }
                          >
                            {formatDueDate(
                              item.dueDate?.date,
                              item.dueDate?.time,
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              item.isSubmitted
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.isSubmitted ? "Submitted" : "Pending"}
                          </span>
                        </TableCell>

                        {item?.lateSubmissionPolicy?.enabled && (
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info
                                    size={16}
                                    className="cursor-help text-slate-500"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {getPenaltyMessage(
                                      item.lateSubmissionPolicy,
                                    )}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <TableRow className="bg-gray-50/50">
                          <TableCell colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                  <FileText size={14} /> Description
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                  {item.description ||
                                    "No specific instructions provided."}
                                </p>
                              </div>

                              <div className="flex justify-end items-center gap-4">
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                                    Task Source
                                  </p>
                                  <p className="text-sm font-semibold capitalize text-acewall-main">
                                    {item.source}
                                  </p>
                                </div>
                                <Link
                                  to={
                                    item.source === "assessment"
                                      ? `/student/assessment/submission/${item._id}`
                                      : `/student/discussions/${item._id}`
                                  }
                                >
                                  <Button
                                    className={`shadow-lg h-10 px-6 bg-[#10B981] text-white hover:bg-[#10B981]`}
                                  >
                                    <Upload size={16} className="mr-2" />
                                    {item.isSubmitted
                                      ? "View Result"
                                      : "Submit Task"}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-gray-400"
                  >
                    No assessments match your current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Assessment;
