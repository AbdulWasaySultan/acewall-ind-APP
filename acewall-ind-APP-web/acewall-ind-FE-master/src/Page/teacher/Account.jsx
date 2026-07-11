"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import avatar from "@/assets/avatar.png";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  Bio: z.string().min(1, "write your bio").max(300, "write your bio"),
  pronouns: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  homeAddress: z.string().min(1, "Home address is required"),
  mailingAddress: z.string().optional(),
  documents: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.type === "application/pdf",
          "Only PDF files are allowed"
        )
    )
    .max(10, "You can upload up to 10 PDF files")
    .optional(),
});

const Account = () => {
  const { user } = useContext(GlobalContext);
  console.log(user, "user");

  const [previewImage, setPreviewImage] = useState(
    user?.profileImg.url || avatar
  );
  const [selectedImage, setSelectedImage] = useState(null);

  console.log(selectedImage, "selectedImg");

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      pronouns: "",
      gender: "",
      email: "",
      phone: "",
      Bio: "",
      homeAddress: "",
      mailingAddress: "",
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const documents = watch("documents");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    // ✅ Validate file size (limit to 1MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };




  const handleDocumentChange = (e, index) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    setValue(`documents.${index}`, files[0]); // Set the specific file in the documents array
  };

  // Populate form with user data when available
  useEffect(() => {
    setValue("firstName", user.firstName || "");
    setValue("middleName", user.middleName || "");
    setValue("lastName", user.lastName || "");
    setValue("Bio", user.Bio || "");
    setValue("pronouns", user.pronouns || "");
    setValue("gender", user.gender || "");
    setValue("email", user.email || "");
    setValue("phone", user.phone || "");
    setValue("homeAddress", user.homeAddress || "");
    setValue("mailingAddress", user.mailingAddress || "");
  }, [user, setValue]);

  // Form submission handler
  const onSubmit = async (data) => {
    console.log(data, "data");

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("middleName", data.middleName);
    formData.append("lastName", data.lastName);
    formData.append("Bio", data.Bio);
    formData.append("pronouns", data.pronouns);
    formData.append("gender", data.gender);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("homeAddress", data.homeAddress);
    formData.append("mailingAddress", data.mailingAddress);

    if (selectedImage) {
      formData.append("profileImg.url", selectedImage);
    }

    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });
    }

    try {
      const response = await axiosInstance.put(`/auth/updateuser`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Server response:", response.data);

      // ✅ Refresh the page after successful update
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };


  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-8">
      {/* Page Title */}
      <div>
        <p className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
          Account Settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-6">
          <h3 className="text-lg font-semibold">Profile Image *</h3>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 rounded-full">
            <img
              src={previewImage}
              alt="Profile Preview"
              className="w-32 h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 rounded-full object-cover"
            />
            <div className="text-center md:text-right"> {/* Center text on smaller screens */}
              <Label htmlFor="profileImg" className="block">
                Upload New Image
              </Label>
              <Input
                id="profileImg.url"
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => handleImageChange(e)}
              />
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {/* Personal Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { id: "firstName", label: "First Name", error: errors.firstName },
                { id: "middleName", label: "Middle Name" },
                { id: "lastName", label: "Last Name", error: errors.lastName },
              ].map(({ id, label, error }) => (
                <div key={id} className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={id}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      className="pl-10"
                      {...register(id)}
                    />
                    <Pencil className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error.message}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
          {/* Bio Field */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Bio</h3>
            <div className="space-y-2">
              <Label htmlFor="Bio" className="text-sm font-medium">
                Tell us about yourself
              </Label>
              <div className="relative">
                <Textarea
                  id="Bio"
                  rows={5}
                  placeholder="Write a short Bio..."
                  maxLength={500}
                  className="pl-10 pt-2"
                  {...register("Bio")}
                />
                <Pencil className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{watch("Bio")?.length || 0}/500 characters</span>
                {errors.Bio && (
                  <span className="text-red-500">{errors.Bio.message}</span>
                )}
              </div>
            </div>
          </section>

          {/* Pronouns & Gender Selection */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Identity Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Pronouns */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Preferred Pronouns *
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {["He/Him", "She/Her", "They/Them", "Others","prefer not to say"].map((pronouns) => (
                    <div key={pronouns} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`pronouns-${pronouns.toLowerCase()}`}
                        value={pronouns.toLowerCase()}
                        {...register("pronouns")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label
                        htmlFor={`pronouns-${pronouns.toLowerCase()}`}
                        className="text-sm text-gray-900 dark:text-white"
                      >
                        {pronouns}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Gender Identity
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {["Male", "Female", "Non-binary", "Other","prefer not to say"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`gender-${gender.toLowerCase()}`}
                        value={gender.toLowerCase()}
                        {...register("gender")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label
                        htmlFor={`gender-${gender.toLowerCase()}`}
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

          {/* Contact Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { id: "email", label: "Email Address", type: "email", error: errors.email },
                { id: "phone", label: "Phone Number", type: "tel", error: errors.phone },
              ].map(({ id, label, type, error }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={id}
                      type={type}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      className="pl-10"
                      {...register(id)}
                    />
                    <Pencil className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />              </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error.message}</p>
                  )}
                </div>))}
            </div>
          </section>

          {/* Address Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { id: "homeAddress", label: "Home Address", error: errors.homeAddress },
                { id: "mailingAddress", label: "Mailing Address (Optional)" },
              ].map(({ id, label, error }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id={id}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      className="pl-10 pt-2"
                      {...register(id)}
                    />
                    <Pencil className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error.message}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="text-white bg-green-600 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Account;
