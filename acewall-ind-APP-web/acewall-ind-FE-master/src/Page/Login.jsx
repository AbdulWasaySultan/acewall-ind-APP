import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import acewallshort from "../assets/acewallshort.png";
import Footer from "@/CustomComponent/Footer";
import ReviewsSlider from "@/CustomComponent/LoginComponent/ReviewsSlider";
import { useContext, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Eye, EyeClosed } from "lucide-react";
import GoogleAuthButton from "@/CustomComponent/GoogleAuthButton";

const Login = () => {
  const { login, checkAuth } = useContext(GlobalContext);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation schema using zod
  const schema = z.object({
    email: z
      .string()
      .min(1, "This field is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(1, "This field is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const watchedPassword = watch("password");

  const onSubmit = async (formData) => {
    try {
      await login(formData);
      setLoginError("");
      const user = await checkAuth();
      // Redirect based on user role
      if (user?.role === "teacher") {
        navigate("/teacher");
      } else if (user?.role === "student") {
        navigate("/student/mycourses");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again.";
      console.error(errorMessage);
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to={"/"} className="text-sm md:text-base">
            Return to Home
          </Link>
          <Link to={"/home"} className="text-sm md:text-base">
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-center text-2xl md:text-3xl text-gray-800 font-normal mb-8">
            Student Login Page
          </h1>

          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* Login Form */}
            <div className="w-full md:w-1/2 bg-white p-6 rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-600 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded"
                    {...register("email")}
                  />
                  {errors?.email && (
                    <p className="text-xs text-red-600 inline-block">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-8">
                  <label
                    htmlFor="password"
                    className="block text-gray-600 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full p-2 border border-gray-300 rounded pr-10"
                      {...register("password")}
                    />
                    {watchedPassword && (
                      <div
                        className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <Eye size={20} />
                        ) : (
                          <EyeClosed size={20} />
                        )}
                      </div>
                    )}
                  </div>
                  {errors?.password && (
                    <p className="text-xs text-red-600 inline-block">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Login Error */}
                {loginError && (
                  <p className="text-sm text-red-500 mb-4">{loginError}</p>
                )}

                {/* Submit Button and Links */}
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/TeacherLogin"
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Login as a Teacher
                      </Link>
                      <Link
                        to="/home"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Create an Account 
                      </Link>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2 rounded transition-colors duration-200"
                    >
                      Login
                    </button>
                  </div>

                  <div className="text-right">
                    <Link
                      to="/forgetPassword"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </form>

              {/* Google Sign In */}
              <div className="mt-6">
                <GoogleAuthButton />
              </div>
            </div>

            {/* Testimonials */}
            <ReviewsSlider />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
