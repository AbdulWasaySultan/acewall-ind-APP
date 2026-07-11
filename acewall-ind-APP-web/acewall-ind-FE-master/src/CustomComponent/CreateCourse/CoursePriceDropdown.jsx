import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

const CoursePriceDropdown = ({ register, errors }) => {
  return (
    <div>
      <Label htmlFor="price" className="block mb-2">
        Course Price (USD)
      </Label>
      <Input
        id="price"
        type="number"
        step="0.01"
        min="0"
        max="9999"
        placeholder="Enter course price"
        aria-invalid={!!errors.price}
        aria-describedby={errors.price ? "price-error" : undefined}
        className={`bg-gray-50 ${errors.price ? "border border-red-500" : ""}`}
        onInput={(e) => {
          const value = parseFloat(e.currentTarget.value);
          if (value > 9999) e.currentTarget.value = "9999";
        }}
        {...register("price")}
      />
      {errors.price && (
        <p id="price-error" role="alert" className="text-xs text-red-500 mt-1">
          {errors.price.message}
        </p>
      )}
    </div>
  );
};

export default CoursePriceDropdown;
