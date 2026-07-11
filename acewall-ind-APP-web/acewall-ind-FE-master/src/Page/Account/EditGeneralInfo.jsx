"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";

// 1. Zod Schema remains the same, but we will add virtual fields for Hook Form handling
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  pronoun: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email("Invalid email address"),
  homeAddress: z.string().min(1, "Home address is required"),
  mailingAddress: z.string().optional(),
  // Virtual fields for Hook Form
  homeAddressLine1: z.string().optional(),
  homeAddressLine2: z.string().optional(),
  homeCity: z.string().optional(),
  homeState: z.string().optional(),
  homeZip: z.string().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingZip: z.string().optional(),
});

const EditGeneralInfo = () => {
  const { user } = useContext(GlobalContext);
  const navigate = useNavigate();
  const MAX_ADDRESS_LENGTH = 300; // Not used in current inputs but good practice

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch,
  }
  = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      pronoun: "",
      gender: "",
      email: "",
      homeAddress: "",
      mailingAddress: "",
      homeAddressLine1: "",
      homeAddressLine2: "",
      homeCity: "",
      homeState: "",
      homeZip: "",
      mailingAddressLine1: "",
      mailingAddressLine2: "",
      mailingCity: "",
      mailingState: "",
      mailingZip: "",
    },
    // The original code was relying on Zod to validate the concatenated 'homeAddress' field,
    // but the individual fields were not validated by Zod directly. 
    // We will rely on manual registration requirements and error handling.
  });
  
  // Watch all the address pieces
  const {
    homeAddressLine1,
    homeAddressLine2,
    homeCity,
    homeState,
    homeZip,
    mailingAddressLine1,
    mailingAddressLine2,
    mailingCity,
    mailingState,
    mailingZip,
  } = watch();

  // 2. Populate form with user data when available
  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("middleName", user.middleName || "");
      setValue("lastName", user.lastName || "");
      setValue("pronoun", user.pronoun || "");
      setValue("gender", user.gender || "");
      setValue("email", user.email || "");
      
      // Split homeAddress into parts
      if (user.homeAddress) {
        const parts = user.homeAddress.split(",").map((p) => p.trim());
        setValue("homeAddressLine1", parts[0] || "");
        setValue("homeAddressLine2", parts[1] || "");
        setValue("homeCity", parts[2] || "");
        const stateZip = parts[3]?.split(" ");
        setValue("homeState", stateZip?.[0] || "");
        setValue("homeZip", stateZip?.[1] || "");
      }

      // Split mailingAddress into parts
      if (user.mailingAddress) {
        const parts = user.mailingAddress.split(",").map((p) => p.trim());
        setValue("mailingAddressLine1", parts[0] || "");
        setValue("mailingAddressLine2", parts[1] || "");
        setValue("mailingCity", parts[2] || "");
        const stateZip = parts[3]?.split(" ");
        setValue("mailingState", stateZip?.[0] || "");
        setValue("mailingZip", stateZip?.[1] || "");
      }
    }
  }, [user, setValue]);

  // 3. Concatenate Home Address (for hidden field submission)
  useEffect(() => {
    const fullHomeAddress = `${homeAddressLine1 || ''}, ${homeAddressLine2 ? homeAddressLine2 + ", " : ""}${homeCity || ''}, ${homeState || ''} ${homeZip || ''}`;
    setValue("homeAddress", fullHomeAddress);
  }, [homeAddressLine1, homeAddressLine2, homeCity, homeState, homeZip, setValue]);

  // 4. Concatenate Mailing Address (for hidden field submission)
  useEffect(() => {
    const fullMailingAddress = `${mailingAddressLine1 || ''}, ${mailingAddressLine2 ? mailingAddressLine2 + " " : ""}${mailingCity || ''}, ${mailingState || ''} ${mailingZip || ''}`;
    setValue("mailingAddress", fullMailingAddress);
  },
    [
      mailingAddressLine1,
      mailingAddressLine2,
      mailingCity,
      mailingState,
      mailingZip,
      setValue
    ]
  );
  
  // 5. Form submission handler
  const onSubmit = async (data) => {
    // The Zod resolver has already run. Now handle API submission.
    
    // Create FormData object for submission
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    if (data.middleName.length > 0) {
      formData.append("middleName", data.middleName);
    }
    formData.append("lastName", data.lastName);
    formData.append("pronoun", data.pronoun);
    formData.append("gender", data.gender);
    formData.append("email", data.email);
    formData.append("homeAddress", data.homeAddress);
    formData.append("mailingAddress", data.mailingAddress);
    
    // Log final data being submitted
    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    
    try {
      const response = await axiosInstance.put(`/auth/updateuser`, formData);
      toast.success(response.data.message);
      navigate(`/${user.role}/account`);
      window.location.reload(); // Hard reload is typically avoided in React but kept for logic fidelity
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };


  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-8">
      <BackButton className="mb-10" />
      
      {/* Page Title */}
      <div>
        {/* H2 is appropriate here as it's a settings page under the main layout title */}
        <h2 className="text-2xl font-bold text-foreground" id="account-info-heading">
          Account Information
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-labelledby="account-info-heading">
        <div className="space-y-8">
          
          {/* Personal Information */}
          <section className="space-y-6" aria-labelledby="personal-info-heading">
            <h3 className="text-lg font-semibold" id="personal-info-heading">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  maxLength={15}
                  placeholder="John"
                  {...register("firstName")}
                  // Added aria-invalid for screen reader error feedback
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'error-firstName' : undefined}
                  onInput={(e) => {
                    // Restrict input to letters (original logic preserved)
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
                  }}
                />
                {errors.firstName && (
                  <p id="error-firstName" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm font-medium">
                  Middle Name
                </Label>
                <Input
                  type="text"
                  id="middleName"
                  maxLength={15}
                  placeholder="M."
                  {...register("middleName")}
                  onInput={(e) => {
                    // Restrict input to letters (original logic preserved)
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
                  }}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  maxLength={15}
                  placeholder="Doe"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'error-lastName' : undefined}
                  onInput={(e) => {
                    // Restrict input to letters (original logic preserved)
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
                  }}
                />
                {errors.lastName && (
                  <p id="error-lastName" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Email (Read-only/Disabled if it cannot be changed here) */}
             <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                </Label>
                <Input
                    type="email"
                    id="email"
                    placeholder="example@email.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    disabled // Assuming email cannot be changed here
                />
                {errors.email && (
                    <p id="error-email" className="text-red-500 text-xs mt-1" role="alert">
                        {errors.email.message}
                    </p>
                )}
            </div>
          </section>

          {/* Pronouns & Gender Selection */}
          <section className="space-y-6" aria-labelledby="identity-info-heading">
            <h3 className="text-lg font-semibold" id="identity-info-heading">Identity Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Pronouns Group */}
              <div className="space-y-2" role="radiogroup" aria-labelledby="pronoun-label">
                <Label id="pronoun-label" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Preferred Pronoun
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "He/Him",
                    "She/Her",
                    "They/Them",
                    "Others",
                    "prefer not to say",
                  ].map((pronoun) => (
                    <div key={pronoun} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`pronoun-${pronoun.toLowerCase().replace(/\s/g, '-')}`}
                        value={pronoun} // Use original value for simpler submission
                        {...register("pronoun")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label
                        htmlFor={`pronoun-${pronoun.toLowerCase().replace(/\s/g, '-')}`}
                        className="text-sm text-gray-900 dark:text-white"
                      >
                        {pronoun}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Group */}
              <div className="space-y-2" role="radiogroup" aria-labelledby="gender-label">
                <Label id="gender-label" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Gender Identity
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Male",
                    "Female",
                    "Non-binary",
                    "Other",
                    "prefer not to say",
                  ].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`gender-${gender.toLowerCase().replace(/\s/g, '-')}`}
                        value={gender} // Use original value for simpler submission
                        {...register("gender")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label
                        htmlFor={`gender-${gender.toLowerCase().replace(/\s/g, '-')}`}
                        className="text-sm text-gray-900 dark:text-white"
                      >
                        {gender}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section className="space-y-6" aria-labelledby="address-info-heading">
            <h3 className="text-lg font-semibold" id="address-info-heading">Address Information</h3>
            
            {/* Home Address */}
            <fieldset className="mb-6 space-y-2 border-none p-0" aria-label="Home Address Details">
              <Label htmlFor="homeAddressLine1">Home Address</Label>

              <Input
                id="homeAddressLine1"
                {...register("homeAddressLine1", {
                  required: "Address Line 1 is required",
                })}
                placeholder="Address Line 1"
                className="mt-2"
                aria-invalid={!!errors.homeAddressLine1}
                aria-describedby={errors.homeAddressLine1 ? 'error-homeAddressLine1' : undefined}
              />
              {errors.homeAddressLine1 && (
                <p id="error-homeAddressLine1" className="text-xs text-red-600" role="alert">
                  {errors.homeAddressLine1.message}
                </p>
              )}

              <Input
                id="homeAddressLine2"
                {...register("homeAddressLine2")}
                placeholder="Address Line 2 (Optional)"
                className="mt-2"
              />

              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <Input
                    id="homeCity"
                    {...register("homeCity", { required: "City is required" })}
                    placeholder="City / Town"
                    aria-invalid={!!errors.homeCity}
                    aria-describedby={errors.homeCity ? 'error-homeCity' : undefined}
                  />
                  {errors.homeCity && <p id="error-homeCity" className="text-xs text-red-600" role="alert">{errors.homeCity.message}</p>}
                </div>

                <div className="flex-1">
                  <Input
                    id="homeState"
                    {...register("homeState", { required: "State is required" })}
                    placeholder="State / Province"
                    aria-invalid={!!errors.homeState}
                    aria-describedby={errors.homeState ? 'error-homeState' : undefined}
                  />
                  {errors.homeState && <p id="error-homeState" className="text-xs text-red-600" role="alert">{errors.homeState.message}</p>}
                </div>

                <div className="flex-1">
                  <Input
                    id="homeZip"
                    {...register("homeZip", { required: "ZIP Code is required" })}
                    placeholder="ZIP / Postal"
                    aria-invalid={!!errors.homeZip}
                    aria-describedby={errors.homeZip ? 'error-homeZip' : undefined}
                  />
                  {errors.homeZip && <p id="error-homeZip" className="text-xs text-red-600" role="alert">{errors.homeZip.message}</p>}
                </div>
              </div>
            </fieldset>

            {/* Mailing Address */}
            <fieldset className="mb-6 space-y-2 border-none p-0" aria-label="Mailing Address Details">
              <Label htmlFor="mailingAddressLine1">Mailing Address (if different)</Label>

              <Input
                id="mailingAddressLine1"
                {...register("mailingAddressLine1")}
                placeholder="Address Line 1"
                className="mt-2"
                aria-invalid={!!errors.mailingAddressLine1}
                aria-describedby={errors.mailingAddressLine1 ? 'error-mailingAddressLine1' : undefined}
              />
              {errors.mailingAddressLine1 && (
                <p id="error-mailingAddressLine1" className="text-xs text-red-600" role="alert">
                  {errors.mailingAddressLine1.message}
                </p>
              )}

              <Input
                id="mailingAddressLine2"
                {...register("mailingAddressLine2")}
                placeholder="Address Line 2 (Optional)"
                className="mt-2"
              />

              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <Input
                    id="mailingCity"
                    {...register("mailingCity")}
                    placeholder="City / Town"
                    aria-invalid={!!errors.mailingCity}
                    aria-describedby={errors.mailingCity ? 'error-mailingCity' : undefined}
                  />
                  {errors.mailingCity && <p id="error-mailingCity" className="text-xs text-red-600" role="alert">{errors.mailingCity.message}</p>}
                </div>

                <div className="flex-1">
                  <Input
                    id="mailingState"
                    {...register("mailingState")}
                    placeholder="State / Province"
                    aria-invalid={!!errors.mailingState}
                    aria-describedby={errors.mailingState ? 'error-mailingState' : undefined}
                  />
                  {errors.mailingState && <p id="error-mailingState" className="text-xs text-red-600" role="alert">{errors.mailingState.message}</p>}
                </div>

                <div className="flex-1">
                  <Input
                    id="mailingZip"
                    {...register("mailingZip")}
                    placeholder="ZIP / Postal"
                    aria-invalid={!!errors.mailingZip}
                    aria-describedby={errors.mailingZip ? 'error-mailingZip' : undefined}
                  />
                  {errors.mailingZip && <p id="error-mailingZip" className="text-xs text-red-600" role="alert">{errors.mailingZip.message}</p>}
                </div>
              </div>
            </fieldset>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
              aria-live="polite" // Announce the saving status
              aria-label={isSubmitting ? "Saving profile changes" : "Save Changes"}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin h-4 w-4" aria-hidden="true" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditGeneralInfo;