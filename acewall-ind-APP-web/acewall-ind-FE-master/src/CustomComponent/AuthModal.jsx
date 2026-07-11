import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";

// --- Login Schema ---
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

// --- Signup Step 1 Schema (Email + Role) ---
const signupStep1Schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  role: z.enum(["student", "teacher"], { required_error: "Please select a role" }),
});

// --- Signup Step 2 Schema (Full Form) ---
const signupStep2Schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Requires one uppercase")
      .regex(/[a-z]/, "Requires one lowercase")
      .regex(/\d/, "Requires one number")
      .regex(/[#?!@$%^&*-]/, "Requires one special character")
      .regex(/^\S*$/, "No spaces allowed"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Agreement is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthModal({ open, onOpenChange, redirectUrl }) {
  const navigate = useNavigate();
  const { login, checkAuth, setAuthLoading, Authloading } = useContext(GlobalContext);

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [signupStep, setSignupStep] = useState(1);
  const [signupEmailData, setSignupEmailData] = useState(null);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // --- Login Form ---
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  });

  // --- Signup Step 1 Form ---
  const step1Form = useForm({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: { email: "", role: "student" },
  });

  // --- Signup Step 2 Form ---
  const step2Form = useForm({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const signupPasswordVal = step2Form.watch("password", "");

  // --- Login Submit ---
  const onLoginSubmit = async (formData) => {
    try {
      setLoginError("");
      await login(formData);
      const user = await checkAuth();
      if (!user) {
        setLoginError("Login failed. Please try again.");
        return;
      }
      onOpenChange(false);
      // Reload page so student stays on the same course detail page
      window.location.reload();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Login failed. Please try again.";
      setLoginError(errorMessage);
    }
  };

  // --- Signup Step 1 Submit ---
  const onStep1Submit = async (data) => {
    try {
      await axiosInstance.post("auth/check-existence", { email: data.email });
      setSignupEmailData(data);
      setSignupStep(2);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("User with this email already exists.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  };

  // --- Signup Step 2 Submit ---
  // Helper to generate a random referral code
  function generateReferralCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0, O, 1, I for clarity
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  const onStep2Submit = async (data) => {
    setAuthLoading(true);
    try {
      let payload = { ...signupEmailData, ...data };
      if (signupEmailData?.role === "student") {
        payload = { ...payload, referralCode: generateReferralCode() };
      }
      const res = await axiosInstance.post("auth/register", payload);
      toast.success(res.data.message);
      onOpenChange(false);
      // Store redirect URL so VerifyOTP can redirect back to this course
      if (redirectUrl) {
        localStorage.setItem("auth_redirect_url", redirectUrl);
      }
      navigate(`/verifyOTP/${signupEmailData.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const getRuleClass = (regex) =>
    `text-xs font-medium ${regex.test(signupPasswordVal) ? "text-green-600" : "text-red-500"}`;

  const handleTabChange = (val) => {
    setActiveTab(val);
    setLoginError("");
    setSignupStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Welcome to Acewall
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ==================== LOGIN TAB ==================== */}
          <TabsContent value="login" className="mt-4">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors?.email && (
                  <p className="text-xs text-red-600 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="mt-1 pr-10"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors?.password && (
                  <p className="text-xs text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {loginError && <p className="text-sm text-red-500">{loginError}</p>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Login
              </Button>

              <p className="text-center text-xs text-gray-500">
                <a href="/forgetPassword" className="text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </p>
            </form>
          </TabsContent>

          {/* ==================== SIGNUP TAB ==================== */}
          <TabsContent value="signup" className="mt-4">
            {signupStep === 1 ? (
              /* --- Step 1: Email & Role --- */
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1"
                    {...step1Form.register("email")}
                  />
                  {step1Form.formState.errors?.email && (
                    <p className="text-xs text-red-600 mt-1">{step1Form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Role is always "student" when signing up from a course page */}
                <input type="hidden" value="student" {...step1Form.register("role")} />

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Continue
                </Button>
              </form>
            ) : (
              /* --- Step 2: Full registration form --- */
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className="text-sm text-blue-600 hover:underline mb-2"
                >
                  &larr; Back
                </button>

                <p className="text-sm text-gray-500 mb-2">
                  Signing up as <strong>{signupEmailData?.email}</strong>
                </p>

                {/* Name Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>First Name <span className="text-red-600">*</span></Label>
                    <Input {...step2Form.register("firstName")} placeholder="John" className="mt-1" />
                    {step2Form.formState.errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{step2Form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Middle</Label>
                    <Input {...step2Form.register("middleName")} placeholder="M." className="mt-1" />
                  </div>
                  <div>
                    <Label>Last Name <span className="text-red-600">*</span></Label>
                    <Input {...step2Form.register("lastName")} placeholder="Doe" className="mt-1" />
                    {step2Form.formState.errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{step2Form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Label>Password *</Label>
                    <Input
                      type={showSignupPass ? "text" : "password"}
                      {...step2Form.register("password")}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3 top-9 text-gray-400"
                    >
                      {showSignupPass ? <Eye size={16} /> : <EyeClosed size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Label>Confirm *</Label>
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      {...step2Form.register("confirmPassword")}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-9 text-gray-400"
                    >
                      {showConfirmPass ? <Eye size={16} /> : <EyeClosed size={16} />}
                    </button>
                  </div>
                </div>
                {step2Form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-600">{step2Form.formState.errors.confirmPassword.message}</p>
                )}

                {/* Password Rules */}
                <div className="grid grid-cols-2 gap-1.5 p-2.5 border rounded-lg bg-gray-50 text-xs">
                  <p className={getRuleClass(/.{8,}/)}>• 8+ Characters</p>
                  <p className={getRuleClass(/[A-Z]/)}>• Uppercase</p>
                  <p className={getRuleClass(/[a-z]/)}>• Lowercase</p>
                  <p className={getRuleClass(/\d/)}>• One Number</p>
                  <p className={getRuleClass(/[#?!@$%^&*-]/)}>• Special Char</p>
                  <p className={getRuleClass(/^\S*$/)}>• No Spaces</p>
                </div>

                {/* Terms */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="modal-terms"
                    {...step2Form.register("agreeToTerms")}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="modal-terms" className="text-xs">
                    I agree to the <a href="#" className="text-blue-600 underline">Terms</a> and{" "}
                    <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                  </Label>
                </div>
                {step2Form.formState.errors.agreeToTerms && (
                  <p className="text-xs text-red-600">{step2Form.formState.errors.agreeToTerms.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={Authloading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {Authloading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
