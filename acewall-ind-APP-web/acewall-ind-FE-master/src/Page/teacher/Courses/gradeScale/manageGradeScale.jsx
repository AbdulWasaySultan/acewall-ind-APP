import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, RefreshCw, Check } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";

const detectScaleIssues = (grades) => {
  const sorted = [...grades].sort((a, b) => a.min - b.min);
  const EPSILON = 0.001;
  const issues = [];
  let expectedMin = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { min, max } = sorted[i];
    if (min - expectedMin > EPSILON) {
      issues.push({ type: "gap", from: expectedMin, to: min });
    }
    if (min < expectedMin - EPSILON) {
      issues.push({ type: "overlap", from: min, to: expectedMin });
    }
    expectedMin = parseFloat((max + 0.01).toFixed(2));
  }
  if (expectedMin - 100 < -EPSILON) {
    issues.push({ type: "gap", from: expectedMin, to: 100 });
  }
  return { isComplete: issues.length === 0, issues };
};

export default function ManageGradeScale() {
  const { courseId } = useParams();
  const [grades, setGrades] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { grade: "", min: 90, max: 100 },
  });

  const watchMin = watch("min");
  const { isComplete, issues } = detectScaleIssues(grades);

  const handleCreateGradeScale = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(
        `gradebook/gradingScale/${courseId}`,
        { scale: grades }
      );
      toast.success(res.data.message);
      navigate(`/teacher/courses/gradescale/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    const newMin = parseFloat(data.min);
    const newMax = parseFloat(data.max);

    if (newMin >= newMax) {
      toast.error("Min must be less than Max.");
      return;
    }

    if (newMin < 0 || newMax > 100) {
      toast.error("Values must be within 0 to 100.");
      return;
    }

    const hasOverlap = grades.some(
      (g) =>
        (newMin >= g.min && newMin <= g.max) ||
        (newMax >= g.min && newMax <= g.max) ||
        (newMin <= g.min && newMax >= g.max)
    );

    if (hasOverlap) {
      toast.error("This range overlaps with an existing grade.");
      return;
    }

    const newEntry = {
      grade: data.grade.toUpperCase(),
      min: newMin,
      max: newMax,
    };

    const updatedGrades = [...grades, newEntry].sort((a, b) => b.max - a.max);
    setGrades(updatedGrades);
    setSuccessMessage(`Grade ${newEntry.grade} added: ${newMax}% to ${newMin}%`);

    setTimeout(() => { setSuccessMessage(""); }, 3000);

    const nextMin = newMin - 10 >= 0 ? parseFloat((newMin - 10).toFixed(2)) : 0;
    const nextMax = nextMin === 0 ? 0 : parseFloat((newMin - 0.01).toFixed(2));

    reset({ grade: "", min: nextMin, max: nextMax });
  };

  const handleReset = () => {
    setGrades([]);
    reset({ grade: "", min: 90, max: 100 });
    setSuccessMessage("");
  };

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto" id="main-content">
      <nav aria-label="Breadcrumb navigation">
        <BackButton />
      </nav>
      <h1 className="text-2xl font-bold text-center mb-6">Create Grade Scale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <section aria-labelledby="form-card-title">
          <Card>
            <CardHeader>
              <CardTitle id="form-card-title">Add New Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="letter-grade" className="block text-sm font-medium text-gray-700">
                    Letter Grade
                  </label>
                  <Input
                    id="letter-grade"
                    {...register("grade", {
                      required: "Grade is required",
                      pattern: {
                        value: /^[A-F+-]*$/i,
                        message: "Only letters A-F and +/- symbols allowed",
                      },
                    })}
                    placeholder="e.g., A, B+, C-"
                    aria-invalid={errors.grade ? "true" : "false"}
                    aria-describedby={errors.grade ? "grade-error" : undefined}
                    className={errors.grade ? "border-red-500" : ""}
                  />
                  {errors.grade && (
                    <p id="grade-error" className="text-red-500 text-xs mt-1" role="alert">
                      {errors.grade.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="min-percent" className="block text-sm font-medium text-gray-700">
                      Min %
                    </label>
                    <Input
                      id="min-percent"
                      type="number"
                      step="0.01"
                      {...register("min", {
                        required: "Min is required",
                        min: { value: 0, message: "Min must be at least 0" },
                        max: { value: 99.99, message: "Min must be below 100" },
                      })}
                      aria-invalid={errors.min ? "true" : "false"}
                      aria-describedby={errors.min ? "min-error" : undefined}
                      className={errors.min ? "border-red-500" : ""}
                    />
                    {errors.min && (
                      <p id="min-error" className="text-red-500 text-xs mt-1" role="alert">
                        {errors.min.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="max-percent" className="block text-sm font-medium text-gray-700">
                      Max %
                    </label>
                    <Input
                      id="max-percent"
                      type="number"
                      step="0.01"
                      {...register("max", {
                        required: "Max is required",
                        min: {
                          value: watchMin ? Number(watchMin) + 0.01 : 0.01,
                          message: "Max must be greater than Min",
                        },
                        max: { value: 100, message: "Max cannot exceed 100" },
                      })}
                      aria-invalid={errors.max ? "true" : "false"}
                      aria-describedby={errors.max ? "max-error" : undefined}
                      className={errors.max ? "border-red-500" : ""}
                    />
                    {errors.max && (
                      <p id="max-error" className="text-red-500 text-xs mt-1" role="alert">
                        {errors.max.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-600 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Grade
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Reset
                  </Button>
                </div>
              </form>

              <div aria-live="polite">
                {successMessage && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Grade Scale Display Section */}
        <section aria-labelledby="scale-card-title">
          <Card>
            <CardHeader>
              <CardTitle id="scale-card-title">Grade Scale Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 font-bold text-sm text-gray-600 mb-2 border-b pb-2">
                    <div>Grade</div>
                    <div>Range</div>
                    <div>Percentage</div>
                  </div>

                  {grades.map((grade, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-2 items-center border-b border-gray-100 pb-2"
                    >
                      <div>
                        <Badge className="font-bold text-sm px-3 py-1 bg-green-600 text-white">
                          {grade.grade}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        {grade.min}% - {grade.max}%
                      </div>
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2.5"
                        role="progressbar"
                        aria-valuenow={grade.max - grade.min}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Visual range for grade ${grade.grade}`}
                      >
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${grade.max - grade.min}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  <div aria-live="assertive">
                    {issues.length > 0 && (
                      <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-600 space-y-1">
                          <p className="font-bold">Scale issues detected:</p>
                          {issues.map((issue, i) => (
                            <p key={i}>
                              {issue.type === "gap"
                                ? `Gap from ${issue.from}% to ${issue.to}%`
                                : `Overlap from ${issue.from}% to ${issue.to}%`}
                            </p>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {isComplete && (
                    <div aria-live="polite">
                      <Alert className="mt-4 bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          Grade scale completed (0% to 100%)!
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={handleCreateGradeScale}
                        className="mt-4 w-full bg-green-600 hover:bg-green-600 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Save Grade Scale"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
                  <p>No grades added yet</p>
                  <p className="text-sm">Add grades using the form on the left</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}