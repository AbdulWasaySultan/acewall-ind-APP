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

// Detect issues in SBL scale
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

  return {
    isComplete: issues.length === 0,
    issues,
  };
};

export default function ManageSBLScale() {
  const [sblScale, setSblScale] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const courseId = useParams().courseId;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      points: "",
      remarks: "",
      minPercentage: 90,
      maxPercentage: 100,
    },
  });

  const watchMin = watch("minPercentage");
  const { isComplete, issues } = detectScaleIssues(sblScale);

  const onSubmit = (data) => {
    const newPoints = parseFloat(data.points);
    const minP = parseFloat(data.minPercentage);
    const maxP = parseFloat(data.maxPercentage);
    const remarks = data.remarks.trim();

    if (isNaN(newPoints)) {
      toast.error("Points must be a valid number");
      return;
    }

    if (!remarks) {
      toast.error("Remarks are required");
      return;
    }

    if (minP < 0 || maxP > 100 || minP >= maxP) {
      toast.error("Enter a valid percentage range (min < max, 0–100)");
      return;
    }

    const hasOverlap = sblScale.some(
      (item) =>
        (minP >= item.minPercentage && minP <= item.maxPercentage) ||
        (maxP >= item.minPercentage && maxP <= item.maxPercentage) ||
        (minP <= item.minPercentage && maxP >= item.maxPercentage)
    );

    if (hasOverlap) {
      toast.error("This percentage range overlaps with an existing scale.");
      return;
    }

    const exists = sblScale.some((item) => item.points === newPoints);
    if (exists) {
      toast.error("This points value already exists");
      return;
    }

    const newEntry = {
      points: newPoints,
      minPercentage: minP,
      maxPercentage: maxP,
      remarks,
    };

    const updated = [...sblScale, newEntry].sort(
      (a, b) => b.maxPercentage - a.maxPercentage
    );

    setSblScale(updated);
    setSuccessMessage(`Points ${newPoints}: ${minP}% - ${maxP}% added`);
    setTimeout(() => setSuccessMessage(""), 3000);

    const nextMin = minP - 10 >= 0 ? parseFloat((minP - 10).toFixed(2)) : 0;
    const nextMax = nextMin === 0 ? 0 : parseFloat((minP - 0.01).toFixed(2));

    reset({
      points: "",
      remarks: "",
      minPercentage: nextMin,
      maxPercentage: nextMax,
    });
  };

  const handleSaveSBLScale = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(`StandardGrading/set/${courseId}`, {
        scale: sblScale,
      });

      toast.success(res.data.message);
      navigate(`/teacher/courses/Sbl/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSblScale([]);
    reset({ points: "", remarks: "", minPercentage: 90, maxPercentage: 100 });
    setSuccessMessage("");
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-6">
        Create Standard-Based Learning Scale
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New SBL Range</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Points</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("points", { required: "Points are required" })}
                  className={errors.points ? "border-red-500" : ""}
                />
                {errors.points && (
                  <p className="text-red-500 text-xs">
                    {errors.points.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Remarks</label>
                <Input
                  type="text"
                  {...register("remarks", { required: "Remarks are required" })}
                  className={errors.remarks ? "border-red-500" : ""}
                />
                {errors.remarks && (
                  <p className="text-red-500 text-xs">
                    {errors.remarks.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium">
                    Min Percentage
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("minPercentage", {
                      required: "Min percentage is required",
                      min: { value: 0, message: "Min must be at least 0" },
                      max: { value: 99.99, message: "Min must be below 100" },
                    })}
                    className={errors.minPercentage ? "border-red-500" : ""}
                  />
                  {errors.minPercentage && (
                    <p className="text-red-500 text-xs">
                      {errors.minPercentage.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Max Percentage
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("maxPercentage", {
                      required: "Max percentage is required",
                      min: {
                        value: watchMin ? Number(watchMin) + 0.01 : 0.01,
                        message: "Max must be greater than min",
                      },
                      max: { value: 100, message: "Max cannot exceed 100" },
                    })}
                    className={errors.maxPercentage ? "border-red-500" : ""}
                  />
                  {errors.maxPercentage && (
                    <p className="text-red-500 text-xs">
                      {errors.maxPercentage.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add SBL Range
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>

            {successMessage && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standard-Based Learning Scale</CardTitle>
          </CardHeader>
          <CardContent>
            {sblScale.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 font-medium text-sm text-gray-500 mb-2">
                  <div>Points</div>
                  <div>Percentage Range</div>
                  <div>Remarks</div>
                  <div>Bar</div>
                </div>

                {sblScale.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 items-center border-b border-gray-100 pb-2"
                  >
                    <Badge className="font-bold text-sm px-3 py-1 bg-green-500 text-white">
                      {item.points}
                    </Badge>

                    <div className="text-sm">
                      {item.minPercentage}% - {item.maxPercentage}%
                    </div>

                    <div className="text-sm">{item.remarks}</div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${item.maxPercentage - item.minPercentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                {issues.length > 0 && (
                  <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-600 space-y-1">
                      <p>SBL scale has issues:</p>
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

                {isComplete && (
                  <>
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        SBL scale completed (0% to 100%)!
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleSaveSBLScale}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Scale"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>No SBL scale added yet</p>
                <p className="text-sm">Add SBL ranges using the form</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
