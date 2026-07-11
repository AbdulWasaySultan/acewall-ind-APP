"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LabelList
} from "recharts";
import { 
  ArrowLeft, Loader, Target, TrendingUp, TrendingDown, 
  Award, BookOpen, Zap, AlertTriangle, Lightbulb, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { axiosInstance } from "@/lib/AxiosInstance";
import BackButton from "@/CustomComponent/BackButton";

export default function TeacherStudentAnalytics() {
  // Teacher needs both IDs from the URL
  const { courseId, studentId } = useParams();
  const navigate = useNavigate(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Updated API endpoint to the teacher version we created
        const res = await axiosInstance.get(`gradebook/getTeacherStudentAnalytics/${courseId}/${studentId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load student analytics.");
      } finally {
        setLoading(false);
      }
    };
    if (courseId && studentId) fetchAnalytics();
  }, [courseId, studentId]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );

  if (error || !data) return (
    <div className="p-10 text-center">
      <p className="text-red-500 mb-4">{error || "No data found"}</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const { insights, summary, charts } = data;
  const isImproving = insights?.trendStatus === "increasing";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Performance Report</h1>
            <p className="text-muted-foreground flex items-center gap-2">
               <User className="h-4 w-4" /> Student ID: {studentId} | Course: {data.courseName}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>Download Report</Button>
      </div>

      {/* TREND INSIGHT BANNER */}
      {insights && (
        <Card className={`${isImproving ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"} border-2`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${isImproving ? "bg-emerald-100" : "bg-red-100"}`}>
                {isImproving ? 
                  <TrendingUp className="h-6 w-6 text-[var(--color-acewall-green)]" /> : 
                  <TrendingDown className="h-6 w-6 text-red-600" />
                }
              </div>
              <div className="space-y-1">
                <h2 className={`text-lg font-bold ${isImproving ? "text-emerald-800" : "text-red-800"}`}>
                  Student Trend: {isImproving ? "Positive Momentum" : "Performance Decline"}
                </h2>
                <p className="text-sm text-gray-700">
                  In the last <strong>{insights.sampleSize} submissions</strong>, the student's average is <strong>{insights.recentAverage}%</strong>. 
                  This is a <strong>{insights.percentageChange}% {insights.trendStatus}</strong> compared to their overall average of {insights.overallAverage}%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Current Grade</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary.currentPercentage}%</div></CardContent>
        </Card>

        <Card className="bg-amber-100 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Projected Final</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.projectedFinalScore}%</div>
            <p className="text-[10px] opacity-70 uppercase">Estimated Result</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Points</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary.pointsEarned} / {summary.pointsPossible}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Work</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary.totalAssessments} items</div></CardContent>
        </Card>
      </div>

      {/* INTERVENTION ALERT */}
      {insights?.weakestCategory && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-bold text-red-900">
            Intervention Needed: {insights.weakestCategory.name}
          </AlertTitle>
          <AlertDescription className="text-red-800">
            The student is struggling most with <strong>{insights.weakestCategory.name}</strong>. 
            There is a <strong>{insights.weakestCategory.gap}% proficiency gap</strong> between this and their best category.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* CHARTS */}
        <Card>
          <CardHeader><CardTitle>Submission History</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.lineChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Competency Breakdown</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts.categoryPerformance} margin={{ left: 20, right: 40 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                  {charts.categoryPerformance.map((entry, index) => (
                    <Cell key={index} fill={entry.average >= 80 ? "#10b981" : "#3b82f6"} />
                  ))}
                  <LabelList dataKey="average" position="right" formatter={(v) => `${v.toFixed(0)}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}