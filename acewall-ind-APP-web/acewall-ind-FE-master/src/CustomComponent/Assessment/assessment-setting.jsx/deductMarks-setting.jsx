import React, { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Save, Info } from "lucide-react";
import { toast } from "react-hot-toast";

// shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PaneltyDeductMarks = ({ assessment, assessmentid, fetchAssessment }) => {
  const [loading, setLoading] = useState(false);

  // Local state to manage form inputs
  const [policy, setPolicy] = useState({
    enabled: false,
    strategy: "one-time",
    deductionType: "points",
    deductionValue: 0,
  });

  // Sync local state when assessment data is fetched from parent
  useEffect(() => {
    if (assessment?.lateSubmissionPolicy) {
      setPolicy({
        enabled: assessment.lateSubmissionPolicy.enabled || false,
        strategy: assessment.lateSubmissionPolicy.policyType || "one-time",
        deductionType:
          assessment.lateSubmissionPolicy.deductionType || "points",
        deductionValue: assessment.lateSubmissionPolicy.deductionValue || 0,
      });
    }
  }, [assessment]);

  /**
   * handleUpdate
   * @param {Object} manualPolicy - Optional object to send specific data (used for immediate toggle)
   */
  const handleUpdate = async (manualPolicy = null) => {
    setLoading(true);
    const dataToSend = manualPolicy || policy;

    try {
      await axiosInstance.put(
        `/assessment/updateLatePolicy/${assessmentid}`,
        dataToSend,
      );
      toast.success("Late policy updated successfully");
      fetchAssessment();
    } catch (err) {
      toast.error("Failed to update policy");
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">Late Submission Penalty</CardTitle>
          <CardDescription>
            Automatically deduct marks when students submit after the deadline.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="late-enabled"
            checked={policy.enabled}
            onCheckedChange={(checked) => {
              const updatedPolicy = { ...policy, enabled: checked };
              setPolicy(updatedPolicy);
              handleUpdate(updatedPolicy);
            }}
          />
          <Label htmlFor="late-enabled" className="cursor-pointer">
            {policy.enabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </CardHeader>

      {/* Settings only visible if policy is enabled */}
      {policy.enabled && (
        <CardContent className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label>Deduction Frequency</Label>
              <Select
                value={policy.strategy}
                onValueChange={(value) =>
                  setPolicy({ ...policy, strategy: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Per day late)</SelectItem>
                  <SelectItem value="one-time">
                    One-Time (Flat penalty)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deduction Unit Selection */}
            <div className="space-y-2">
              <Label>Deduction Unit</Label>
              <Select
                value={policy.deductionType}
                onValueChange={(value) =>
                  setPolicy({ ...policy, deductionType: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Fixed Points</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="deduction-value">
                Penalty Amount{" "}
                {policy.strategy === "daily" ? "(Per Day)" : "(Flat)"}
              </Label>
              <div className="relative">
                <Input
                  id="deduction-value"
                  type="number"
                  placeholder="0"
                  value={policy.deductionValue}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      deductionValue: Number(e.target.value),
                    })
                  }
                  className="pr-12 bg-white"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm font-medium">
                  {policy.deductionType === "points" ? "pts" : "%"}
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleUpdate()}
              disabled={loading}
              className="w-full md:w-auto px-8 font-semibold"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Logic Preview Alert */}
          <Alert variant="secondary" className="bg-slate-50 border-slate-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-sm font-semibold text-slate-800">
              Policy Preview
            </AlertTitle>
            <AlertDescription className="text-xs text-slate-600 mt-1">
              A student submitting <strong>3 days late</strong> will lose{" "}
              <span className="font-bold text-red-600">
                {policy.strategy === "daily"
                  ? `${policy.deductionValue * 3}${policy.deductionType === "points" ? " marks" : "%"}`
                  : `${policy.deductionValue}${policy.deductionType === "points" ? " marks" : "%"}`}
              </span>{" "}
              from their raw earned score.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};

export default PaneltyDeductMarks;
