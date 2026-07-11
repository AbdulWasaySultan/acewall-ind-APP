import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Check, AlertCircle } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

// Detect issues in GPA scale logic (Logic unchanged)
const detectScaleIssues = (scale) => {
  const sorted = [...scale].sort((a, b) => a.minPercentage - b.minPercentage);
  const EPSILON = 0.001;
  const issues = [];
  let expectedMin = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { minPercentage, maxPercentage } = sorted[i];
    if (minPercentage - expectedMin > EPSILON) {
      issues.push({ type: "gap", from: expectedMin, to: minPercentage });
    }
    if (minPercentage < expectedMin - EPSILON) {
      issues.push({ type: "overlap", from: minPercentage, to: expectedMin });
    }
    expectedMin = parseFloat((maxPercentage + 0.01).toFixed(2));
  }
  if (expectedMin - 100 < -EPSILON) {
    issues.push({ type: "gap", from: expectedMin, to: 100 });
  }
  return { isComplete: issues.length === 0, issues };
};

export default function ManageGpaScale() {
  const [gpaScale, setGpaScale] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gpa: "",
      minPercentage: 90,
      maxPercentage: 100,
    },
  });

  const watchMin = watch("minPercentage");
  const { isComplete, issues } = detectScaleIssues(gpaScale);

  const onSubmit = (data) => {
    const newGpa = parseFloat(data.gpa);
    const minP = parseFloat(data.minPercentage);
    const maxP = parseFloat(data.maxPercentage);

    if (newGpa < 0 || newGpa > 4) {
      toast.error("GPA must be between 0.0 and 4.0");
      return;
    }
    if (minP < 0 || maxP > 100 || minP >= maxP) {
      toast.error("Enter a valid percentage range (min < max, 0–100)");
      return;
    }

    const hasOverlap = gpaScale.some(
      (item) =>
        (minP >= item.minPercentage && minP <= item.maxPercentage) ||
        (maxP >= item.minPercentage && maxP <= item.maxPercentage) ||
        (minP <= item.minPercentage && maxP >= item.maxPercentage)
    );

    if (hasOverlap) {
      toast.error("This percentage range overlaps with an existing GPA scale.");
      return;
    }

    const exists = gpaScale.some((item) => item.gpa === newGpa);
    if (exists) {
      toast.error("This GPA value already exists");
      return;
    }

    const newEntry = { gpa: newGpa, minPercentage: minP, maxPercentage: maxP };
    const updated = [...gpaScale, newEntry].sort(
      (a, b) => b.maxPercentage - a.maxPercentage
    );
    setGpaScale(updated);

    setSuccessMessage(`GPA ${newGpa} = ${minP}% - ${maxP}%`);
    setTimeout(() => setSuccessMessage(""), 3000);

    const nextMin = minP - 10 >= 0 ? parseFloat((minP - 10).toFixed(2)) : 0;
    const nextMax = nextMin === 0 ? 0 : parseFloat((minP - 0.01).toFixed(2));

    reset({ gpa: "", minPercentage: nextMin, maxPercentage: nextMax });
  };

  const handleSaveGpaScale = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(`gpa/setGPAscale/${courseId}`, {
        gpaScale,
      });
      toast.success(res.data.message);
      navigate(`/teacher/courses/gpa/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGpaScale([]);
    reset({ gpa: "", minPercentage: 90, maxPercentage: 100 });
    setSuccessMessage("");
  };

  return (
    <main className="p-4 md:p-6 max-w-6xl mx-auto" id="main-content">
      <nav aria-label="Breadcrumb" className="mb-4">
        <BackButton />
      </nav>
      
      <h1 className="text-2xl font-bold text-center mb-6">Create GPA Scale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <section aria-labelledby="form-card-title">
          <Card>
            <CardHeader>
              <CardTitle id="form-card-title">Add New GPA Range</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="gpa-input" className="block text-sm font-medium mb-1">GPA (0.0 - 4.0)</label>
                  <Input
                    id="gpa-input"
                    type="number"
                    step="0.01"
                    {...register("gpa", { required: "GPA is required" })}
                    aria-invalid={errors.gpa ? "true" : "false"}
                    aria-describedby={errors.gpa ? "gpa-error" : undefined}
                    className={errors.gpa ? "border-red-500" : ""}
                  />
                  {errors.gpa && (
                    <p id="gpa-error" className="text-red-500 text-xs mt-1" role="alert">{errors.gpa.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-percent" className="block text-sm font-medium mb-1">Min Percentage</label>
                    <Input
                      id="min-percent"
                      type="number"
                      step="0.01"
                      {...register("minPercentage", {
                        required: "Min percentage is required",
                        min: { value: 0, message: "Min must be at least 0" },
                        max: { value: 99.99, message: "Min must be below 100" },
                      })}
                      aria-invalid={errors.minPercentage ? "true" : "false"}
                      aria-describedby={errors.minPercentage ? "min-error" : undefined}
                    />
                    {errors.minPercentage && (
                      <p id="min-error" className="text-red-500 text-xs mt-1" role="alert">{errors.minPercentage.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="max-percent" className="block text-sm font-medium mb-1">Max Percentage</label>
                    <Input
                      id="max-percent"
                      type="number"
                      step="0.01"
                      {...register("maxPercentage", {
                        required: "Max percentage is required",
                        max: { value: 100, message: "Max cannot exceed 100" },
                      })}
                      aria-invalid={errors.maxPercentage ? "true" : "false"}
                      aria-describedby={errors.maxPercentage ? "max-error" : undefined}
                    />
                    {errors.maxPercentage && (
                      <p id="max-error" className="text-red-500 text-xs mt-1" role="alert">{errors.maxPercentage.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-600 text-white shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add GPA Range
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} aria-label="Reset all entries">
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Reset
                  </Button>
                </div>
              </form>

              <div aria-live="polite" className="mt-4">
                {successMessage && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Check className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600">{successMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* GPA Scale List Section */}
        <section aria-labelledby="list-card-title">
          <Card>
            <CardHeader>
              <CardTitle id="list-card-title">GPA Scale Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {gpaScale.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 font-bold text-xs uppercase text-gray-500 border-b pb-2" role="row">
                    <span role="columnheader">GPA</span>
                    <span role="columnheader">Percentage Range</span>
                    <span role="columnheader">Visualization</span>
                  </div>

                  

                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2" role="table" aria-label="GPA Scale Entries">
                    {gpaScale.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 gap-2 items-center border-b border-gray-100 pb-2"
                        role="row"
                      >
                        <div role="cell">
                          <Badge className="font-bold text-sm px-3 py-1 bg-blue-600 text-white">
                            {item.gpa}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-700" role="cell">
                          {item.minPercentage}% - {item.maxPercentage}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5" role="cell">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            role="progressbar"
                            aria-valuenow={item.maxPercentage - item.minPercentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label={`Visual range for GPA ${item.gpa}`}
                            style={{
                              width: `${item.maxPercentage - item.minPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div aria-live="assertive" className="mt-4">
                    {issues.length > 0 && (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-600 space-y-1">
                          <p className="font-bold">Scale issues detected:</p>
                          {issues.map((issue, i) => (
                            <p key={i}>
                              {issue.type === "gap"
                                ? `🟡 Gap from ${issue.from}% to ${issue.to}%`
                                : `🔴 Overlap from ${issue.from}% to ${issue.to}%`}
                            </p>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {isComplete && (
                    <div aria-live="polite" className="pt-4">
                      <Alert className="mb-4 bg-blue-50 border-blue-200">
                        <Check className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-600 font-medium">
                          GPA scale is complete (0% to 100%)!
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={handleSaveGpaScale}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-md"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving Scale..." : "Save GPA Scale"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-gray-400">
                  <AlertCircle className="h-10 w-10 mb-2 opacity-30" aria-hidden="true" />
                  <p className="text-lg">No GPA scale entries yet</p>
                  <p className="text-sm">Use the form to build your scale</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}