import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader, BarChart3, Target, HelpCircle, Users } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";
import SubmissionPieChart from "@/CustomComponent/teacher/Assessment/SubmissionPieChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuestionTypeChart from "./QuestionTypeChart";
import StudentPerformanceChart from "./StudentPerformanceChart";

const AssessmentAnalytics = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both Stats (for Pie) and Submissions (for Bar Charts)
        const [statsRes, subRes] = await Promise.all([
          axiosInstance.get(`/assessment/stats/${id}`),
          axiosInstance.get(`/assessmentSubmission/submission_for_Teacher/${id}`)
        ]);
        
        setStats(statsRes.data);
        setSubmissions(subRes.data.submissions);
      } catch (error) {
        console.error("Data fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Logic for Performance by Question Type
  const processTypeData = () => {
    const typeMap = {};
    submissions.forEach((sub) => {
      sub.answers.forEach((ans) => {
        const type = ans.questionDetails?.type || "Other";
        const earned = ans.pointsAwarded || 0;
        const total = ans.questionDetails?.points || 0;

        if (!typeMap[type]) {
          typeMap[type] = { name: type, earned: 0, possible: 0 };
        }
        typeMap[type].earned += earned;
        typeMap[type].possible += total;
      });
    });

    return Object.values(typeMap).map((item) => ({
      name: item.name === "mcq" ? "MCQ" : item.name === "truefalse" ? "T/F" : item.name.toUpperCase(),
      percentage: item.possible > 0 ? Math.round((item.earned / item.possible) * 100) : 0,
    }));
  };

  // Logic for Individual Student Performance (The vertical "candles")
  const processStudentData = () => {
    return submissions.map(sub => {
      const earned = sub.totalScore || 0;
      // Calculate max possible points by summing points of all questions in this submission
      const totalPossible = sub.answers.reduce((acc, ans) => acc + (ans.questionDetails?.points || 0), 0);
      const percentage = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;

      return {
        name: sub.studentId?.firstName || "Student", 
        fullName: `${sub.studentId?.firstName} ${sub.studentId?.lastName}`, 
        score: percentage,
        earned: earned,
        total: totalPossible
      };
    }).sort((a, b) => b.score - a.score); // Sort highest to lowest
  };

  const typeData = processTypeData();
  const studentPerformanceData = processStudentData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Assessment Insights
        </h1>
      </div>

      {/* Top Row: General Stats & Type Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase text-gray-500 tracking-wider">Submission Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {stats && <SubmissionPieChart data={stats} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" /> 
              Performance by Question Type (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <QuestionTypeChart data={typeData} />
            ) : (
              <p className="text-center text-muted-foreground py-10">No question data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Individual Student Performance (The new Vertical Graph) */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Individual Student Overall Performance (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentPerformanceData.length > 0 ? (
            <StudentPerformanceChart data={studentPerformanceData} />
          ) : (
            <p className="text-center text-muted-foreground py-10">No student submissions available</p>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row: Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-bold uppercase">Total Submissions</p>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.submittedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 font-bold uppercase">Average Class Score</p>
            <p className="text-3xl font-bold text-gray-800">
              {submissions.length > 0 
                ? (submissions.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / submissions.length).toFixed(1)
                : 0} 
              <span className="text-sm font-normal text-gray-400 ml-1">pts</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 font-bold uppercase">Pending Grading</p>
            <p className="text-3xl font-bold text-gray-800">
              {submissions.filter(s => !s.graded).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentAnalytics;