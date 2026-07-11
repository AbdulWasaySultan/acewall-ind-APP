import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const SemesterbasedDropdown = ({ errors, setValue, watchedSemesterbased }) => {
  return (
    <div>
      <Label className="block mb-2">Is this a semester-based course *</Label>
      <Select
        aria-required="true"
        aria-invalid={!!errors.semesterbased}
        onValueChange={(value) =>
          setValue("semesterbased", value === "true", {
            shouldValidate: true,
          })
        }
        value={
          watchedSemesterbased !== undefined
            ? watchedSemesterbased
              ? "true"
              : "false"
            : undefined
        }
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
      {errors.semesterbased && (
        <p role="alert" className="text-xs text-red-500 mt-1">
          {errors.semesterbased.message}
        </p>
      )}
    </div>
  );
};

export default SemesterbasedDropdown;
