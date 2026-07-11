import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeClosed, EyeOff } from "lucide-react";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(
      /[#?!@$%^&*-]/,
      "Password must contain at least one special character (#?!@$%^&*-)"
    ),
});

const NewPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const { email } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const password = watch("password") || "";

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post("auth/resetPassword", {
        newPassword: data.password,
        email,
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong.");
    }
  };

  // Password condition checks
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[#?!@$%^&*-]/.test(password);

  const getClass = (condition) =>
    `text-xs font-medium ${condition ? "text-green-600" : "text-red-500"}`;

  return (
    <div className="min-h-[90%] flex items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Reset Your Password
              </h2>
            </div>

            <div className="text-left relative">
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your new password"
                className="mt-1 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />
                }
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Dynamic Password Rules */}
            <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
              <li className={getClass(isMinLength)}>Minimum 8 characters</li>
              <li className={getClass(hasUppercase)}>
                At least one uppercase letter
              </li>
              <li className={getClass(hasLowercase)}>
                At least one lowercase letter
              </li>
              <li className={getClass(hasDigit)}>At least one digit</li>
              <li className={getClass(hasSpecialChar)}>
                At least one special character (#?!@$%^&*-)
              </li>
            </ol>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPassword;
