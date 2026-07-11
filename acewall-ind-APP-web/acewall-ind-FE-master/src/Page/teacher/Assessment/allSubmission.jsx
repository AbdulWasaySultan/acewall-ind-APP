import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { axiosInstance } from "@/lib/AxiosInstance";
import { BarChart2, ListCollapse, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import avatar from "@/assets/avatar.png";
import BackButton from "@/CustomComponent/BackButton";
import SubmissionPieChart from "@/CustomComponent/teacher/Assessment/SubmissionPieChart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AllSubmission = () => {
  const [submission, setSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradedFilter, setGradedFilter] = useState("all");
  const [stats, setStats] = useState(null); // New state for stats
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axiosInstance.get(
          `/assessmentSubmission/submission_for_Teacher/${id}`,
        );

        setSubmission(response.data.submissions);
      } catch (error) {
        console.error("Error fetching submission:", error);
        setSubmission([]);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(`/assessment/stats/${id}`);
        setStats(res.data);
      } catch (error) {
        console.error("Stats fetch error", error);
      }
    };

    fetchSubmission();
    fetchStats();
  }, [id]);
  if (!submission) {
    return (
      <div
        className="flex items-center justify-center w-full h-screen"
        role="status"
        aria-live="polite"
      >
        <Loader
          className="w-6 h-6 animate-spin text-muted-foreground"
          aria-label="Loading submissions"
        />
      </div>
    );
  }

  const filteredSubmissions = submission.filter((item) => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchGraded =
      gradedFilter === "all" ||
      (gradedFilter === "graded" && item.graded) ||
      (gradedFilter === "not_graded" && !item.graded);
    return matchStatus && matchGraded;
  });

  if (filteredSubmissions.length === 0) {
    return (
      <>
        <div>
          <BackButton />
        </div>

        <div className="p-6 flex items-center justify-between border-b">
          {/* NEW BUTTON TO ANALYTICS */}
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/assessments/analytics/${id}`)}
            className="flex gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/courses/assessment/${id}`)}
            className="flex gap-2"
          >
            <ListCollapse className="w-4 h-4" />
            More Details
          </Button>
        </div>
        <div className="flex flex-col items-center w-full h-screen space-y-6">
          <h1 className="mt-10 text-2xl font-bold text-gray-800">
            No submissions found
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center p-6">
        <BackButton />
        <div className="flex items-center gap-4">
          {/* NEW BUTTON TO ANALYTICS */}
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/assessments/analytics/${id}`)}
            className="flex gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/teacher/courses/assessment/${id}`)}
            className="flex gap-2"
          >
            <ListCollapse className="w-4 h-4" />
            More Details
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">All Submissions</h2>
          <p className="text-muted-foreground">
            View and manage all student submissions for this assessment.
          </p>
        </div>
        {/* Filters */}
        <div
          className="flex flex-col md:flex-row gap-4"
          role="region"
          aria-label="Submission filters"
        >
          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="sr-only">
              Filter submissions by status
            </label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              aria-label="Filter by status"
            >
              <SelectTrigger id="statusFilter" className="w-[180px]">
                {statusFilter === "all" ? "All Statuses" : statusFilter}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="before due date">Before Due Date</SelectItem>
                <SelectItem value="after due date">After Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Graded Filter */}
          <div>
            <label htmlFor="gradedFilter" className="sr-only">
              Filter submissions by grading status
            </label>
            <Select
              value={gradedFilter}
              onValueChange={setGradedFilter}
              aria-label="Filter by graded status"
            >
              <SelectTrigger id="gradedFilter" className="w-[180px]">
                {gradedFilter === "all"
                  ? "All Grading"
                  : gradedFilter === "graded"
                    ? "Graded"
                    : "Not Graded"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grading</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="not_graded">Not Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submissions */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
        >
          {filteredSubmissions.map((item) => (
            <Link
              key={item._id}
              to={`/teacher/assessments/${item._id}`}
              role="listitem"
              className="focus:outline-2 focus:outline-green-600 rounded-xl"
            >
              <Card
                className="p-4 space-y-4 hover:shadow-md transition-shadow"
                role="group"
                aria-label={`Submission from ${item?.studentId?.firstName} ${item?.studentId?.lastName}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={item?.studentId?.profileImg?.url || avatar}
                      alt={`${item?.studentId?.firstName} ${item?.studentId?.lastName} profile image`}
                    />
                    <AvatarFallback aria-hidden="true">
                      {item?.studentId?.firstName?.charAt(0)}
                      {item?.studentId?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-lg font-semibold">
                      {item?.studentId?.firstName} {item?.studentId?.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {item?.studentId?.email}
                    </p>
                  </div>
                </div>

                <CardContent className="space-y-3 px-0">
                  {/* Status */}
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Status:
                    </span>
                    <span
                      className={`block mt-1 ${
                        item?.status === "before due date"
                          ? "text-green-600"
                          : "text-red-600"
                      } text-sm font-medium`}
                    >
                      {item?.status}
                    </span>
                  </div>

                  {/* Graded */}
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Grading:
                    </span>
                    <span
                      className={`block mt-1 ${
                        item?.graded ? "text-green-600" : "text-yellow-600"
                      } text-sm font-medium`}
                    >
                      {item?.graded ? "Graded" : "Not Graded"}
                    </span>
                  </div>

                  {/* Submitted At */}
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Submitted At:
                    </span>
                    <span className="block mt-1 text-sm">
                      {new Date(item?.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllSubmission;
