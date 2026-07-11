import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Ensure this is the correct Label import
import React from "react";

const TrialPeriodDropdown = ({ register, watch, setValue }) => {
  // watch() will now return the string value
  const selectedValue = watch("freeTrialMonths");

  return (
    <div>
      <Label
        htmlFor="freeTrialMonths"
        className="block mb-2 text-sm font-medium"
      >
        Free Trial Period
      </Label>
      <Select
        // Pass the watched value directly to the Select component
        value={selectedValue}
        onValueChange={(value) => {
          // Using setValue is cleaner for custom Select components
          setValue("freeTrialMonths", value, { shouldValidate: true });
        }}
      >
        <SelectTrigger className="bg-gray-50">
          {/* SelectValue will now correctly find the label based on the string value */}
          <SelectValue placeholder="No Free Trial" />
        </SelectTrigger>
        <SelectContent>
          {/* Values MUST be strings to match the Select behavior */}
          <SelectItem value="0">No Free Trial</SelectItem>
          <SelectItem value="1">1 Month</SelectItem>
          <SelectItem value="2">2 Months</SelectItem>
          <SelectItem value="3">3 Months</SelectItem>
        </SelectContent>
      </Select>

      {/* Hidden input to keep react-hook-form in sync */}
      <input type="hidden" {...register("freeTrialMonths")} />
    </div>
  );
};

export default TrialPeriodDropdown;
