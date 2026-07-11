import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const LanguageDropdown = ({ errors, setValue, watchedLanguage }) => {
  return (
    <div className="w-[50%]">
      <Label className="block mb-2">Language *</Label>
      <Select
        aria-required="true"
        aria-invalid={!!errors.language}
        onValueChange={(value) =>
          setValue("language", value, { shouldValidate: true })
        }
        value={watchedLanguage}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="spanish">Spanish</SelectItem>
          <SelectItem value="french">French</SelectItem>
          <SelectItem value="german">German</SelectItem>
        </SelectContent>
      </Select>
      {errors.language && (
        <p role="alert" className="text-xs text-red-500 mt-1">
          {errors.language.message}
        </p>
      )}
    </div>
  );
};

export default LanguageDropdown;
