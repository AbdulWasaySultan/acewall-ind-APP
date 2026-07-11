"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useState } from "react";
import { Loader } from "lucide-react";

export default function FeaturedContantCard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance
        .post("contact/sendSchoolcontactmail", data)
        .then((response) => {
          console.log(response);
          setLoading(false);
          setSuccessMessage("Form submitted successfully!");
        })
        .catch((error) => {
          console.error("There was an error!", error);
          setLoading(false);
          setErrorMessage("Error submitting form. Please try again.");
        });
    } catch (err) {
      console.error(err);
      alert("Error sending request.");
      setErrorMessage("Error submitting form. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-100 min-h-screen p-8 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Contact Information
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {/* Organization Name */}
          <div>
            <label className="block font-medium">Organization Name</label>
            <input
              {...register("organization", {
                required: "Organization name is required",
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter organization name"
            />
            {errors.organization && (
              <p className="text-red-500 text-sm">
                {errors.organization.message}
              </p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label className="block font-medium">Contact Person</label>
            <input
              {...register("contactPerson", {
                required: "Contact person is required",
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && (
              <p className="text-red-500 text-sm">
                {errors.contactPerson.message}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block font-medium">Contact Number</label>
            <input
              type="tel"
              {...register("contactNumber", {
                required: "Contact number is required",
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter contact number"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm">
                {errors.contactNumber.message}
              </p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block font-medium">Contact Email</label>
            <input
              type="email"
              {...register("contactEmail", { required: "Email is required" })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter contact email"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          {/* No of Teachers */}
          <div>
            <label className="block font-medium">No. of Teachers</label>
            <input
              type="number"
              {...register("teachers", {
                required: "Number of teachers is required",
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter number of teachers"
            />
            {errors.teachers && (
              <p className="text-red-500 text-sm">{errors.teachers.message}</p>
            )}
          </div>

          {/* No of Students */}
          <div>
            <label className="block font-medium">No. of Students</label>
            <input
              type="number"
              {...register("students", {
                required: "Number of students is required",
              })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter number of students"
            />
            {errors.students && (
              <p className="text-red-500 text-sm">{errors.students.message}</p>
            )}
          </div>

          {/* School Size */}
          <div>
            <label className="block font-medium">School Size</label>
            <select
              {...register("schoolSize", {
                required: "School size is required",
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select school size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            {errors.schoolSize && (
              <p className="text-red-500 text-sm">
                {errors.schoolSize.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block font-medium">Address</label>
            <textarea
              {...register("address", { required: "Address is required" })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter full address"
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader /> : "Submit"}
            </Button>
          </div>

          {successMessage && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-green-600 text-center">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-red-600 text-center">{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}