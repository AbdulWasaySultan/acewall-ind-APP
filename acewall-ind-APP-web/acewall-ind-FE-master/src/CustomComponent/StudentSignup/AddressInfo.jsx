import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import { useEffect } from "react";
import "react-phone-input-2/lib/style.css";

const AddressInfo = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const {
    homeAddressLine1 = "",
    homeAddressLine2 = "",
    homeCity = "",
    homeState = "",
    homeZip = "",
    mailingAddressLine1 = "",
    mailingAddressLine2 = "",
    mailingCity = "",
    mailingState = "",
    mailingZip = "",
  } = watch();

  // Concatenate Home Address
  useEffect(() => {
    const fullHomeAddress = `${homeAddressLine1}, ${
      homeAddressLine2 ? homeAddressLine2 + ", " : ""
    }${homeCity}, ${homeState} ${homeZip}`;
    setValue("homeAddress", fullHomeAddress);
  }, [homeAddressLine1, homeAddressLine2, homeCity, homeState, homeZip]);

  // Concatenate Mailing Address
  useEffect(() => {
    const fullMailingAddress = `${mailingAddressLine1}, ${
      mailingAddressLine2 ? mailingAddressLine2 + " " : ""
    }${mailingCity}, ${mailingState} ${mailingZip}`;
    setValue("mailingAddress", fullMailingAddress);
  }, [
    mailingAddressLine1,
    mailingAddressLine2,
    mailingCity,
    mailingState,
    mailingZip,
  ]);

  return (
    <>
      {/* Home Address Section */}
      <div className="mb-6">
        <Label>Home Address</Label>

        <Input
          {...register("homeAddressLine1", {
            required: "Address Line 1 is required",
          })}
          placeholder="Address Line 1"
          className="mt-2"
        />
        <p className="text-xs text-red-600">
          {errors?.homeAddressLine1?.message}
        </p>

        <Input
          {...register("homeAddressLine2")}
          placeholder="Address Line 2 (Optional)"
          className="mt-2"
        />

        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <Input
              {...register("homeCity", { required: "City is required" })}
              placeholder="City / Town"
            />
            <p className="text-xs text-red-600">{errors?.homeCity?.message}</p>
          </div>

          <div className="flex-1">
            <Input
              {...register("homeState", { required: "State is required" })}
              placeholder="State / Province"
            />
            <p className="text-xs text-red-600">{errors?.homeState?.message}</p>
          </div>

          <div className="flex-1">
            <Input
              {...register("homeZip", { required: "ZIP Code is required" })}
              placeholder="ZIP / Postal"
            />
            <p className="text-xs text-red-600">{errors?.homeZip?.message}</p>
          </div>
        </div>
      </div>

      {/* Mailing Address Section */}
      <div className="mb-6">
        <Label>Mailing Address (if different)</Label>

        <Input
          {...register("mailingAddressLine1", {
            required: "Address Line 1 is required",
          })}
          placeholder="Address Line 1"
          className="mt-2"
        />
        <p className="text-xs text-red-600">
          {errors?.mailingAddressLine1?.message}
        </p>

        <Input
          {...register("mailingAddressLine2")}
          placeholder="Address Line 2 (Optional)"
          className="mt-2"
        />

        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <Input
              {...register("mailingCity", { required: "City is required" })}
              placeholder="City / Town"
            />
            <p className="text-xs text-red-600">
              {errors?.mailingCity?.message}
            </p>
          </div>

          <div className="flex-1">
            <Input
              {...register("mailingState", { required: "State is required" })}
              placeholder="State / Province"
            />
            <p className="text-xs text-red-600">
              {errors?.mailingState?.message}
            </p>
          </div>

          <div className="flex-1">
            <Input
              {...register("mailingZip", { required: "ZIP Code is required" })}
              placeholder="ZIP / Postal"
            />
            <p className="text-xs text-red-600">
              {errors?.mailingZip?.message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressInfo;