import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectCmp = ({ data, title, className, onChange, value }) => {
  const handleChange = (value) => {
    onChange && onChange(value);
  };

  // Check if data is empty or not
  const hasData = data && data.length > 0;

  return (
    <div className={className}>
      <Select value={value} onValueChange={handleChange} aria-labelledby="select-course">
        <SelectTrigger className="w-full" id="select-course">
          <SelectValue placeholder={title} />
        </SelectTrigger>
        <SelectContent>
          {hasData ? (
            data.map((item, index) => (
              <SelectItem key={index} value={item}>
                {item}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled>No options available</SelectItem> // Handle case of no data
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectCmp;
