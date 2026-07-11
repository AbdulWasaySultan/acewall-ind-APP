import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const PaymenttypeDropdown = ({ register, errors }) => {
  return (
    <div>
      <Label htmlFor="paymentType" className="block mb-2">
        Payment Type *
      </Label>
      <Select
        onValueChange={(value) => {
          const event = { target: { name: "paymentType", value } };
          register("paymentType").onChange(event);
        }}
      >
        <SelectTrigger
          className={`bg-gray-50 ${errors.paymentType ? "border-red-500" : ""}`}
        >
          <SelectValue placeholder="Select Payment Type" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="ONETIME">One Time</SelectItem>
          <SelectItem value="SUBSCRIPTION">Monthly Subscription</SelectItem>
        </SelectContent>
      </Select>

      {/* Hidden input to sync the value with react-hook-form */}
      <input type="hidden" {...register("paymentType")} />

      {errors.paymentType && (
        <p role="alert" className="text-xs text-red-500 mt-1">
          {errors.paymentType.message}
        </p>
      )}
    </div>
  );
};

export default PaymenttypeDropdown;
