import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";
import PrivacyPolicy from "../PrivacePolicy";
import TermsModal from "../Termsandcondition";

const PasswordInfo = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const agreeToTerms = watch("agreeToTerms");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordTyping, setIsPasswordTyping] = useState(false);
  const [isConfirmPasswordTyping, setIsConfirmPasswordTyping] = useState(false);

  useEffect(() => {
    setIsPasswordTyping(password.length > 0);
  }, [password]);

  useEffect(() => {
    setIsConfirmPasswordTyping(confirmPassword.length > 0);
  }, [confirmPassword]);

  const passwordRules = {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long",
    },
    pattern: {
      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-])(?=\S).*$/,
      message:
        "Password must contain at least one uppercase, one lowercase, one number, one special character and no spaces",
    },
  };

  const getClass = (condition) =>
    `text-xs font-medium ${condition ? "text-green-600" : "text-red-500"}`;

  return (
    <div>
      {/* Password Input */}
      <div className="relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password<span className="text-red-600"> *</span>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          {...register("password", passwordRules)}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {isPasswordTyping && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
          </button>
        )}
        {errors?.password?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="mt-4 relative">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirm Password<span className="text-red-600"> *</span>
        </label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          {...register("confirmPassword")}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {isConfirmPasswordTyping && (
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-300"
            tabIndex={-1}
          >
            {showConfirmPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
          </button>
        )}
        {errors?.confirmPassword?.message && (
          <p className="text-xs text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Password Validation Checklist */}
      <ol className="list-decimal pl-6 space-y-2 text-gray-700 mt-5 dark:text-gray-300">
        <li className={getClass(password.length >= 8)}>Minimum 8 characters</li>
        <li className={getClass(/[A-Z]/.test(password))}>
          At least one uppercase letter
        </li>
        <li className={getClass(/[a-z]/.test(password))}>
          At least one lowercase letter
        </li>
        <li className={getClass(/\d/.test(password))}>At least one digit</li>
        <li className={getClass(/[#?!@$%^&*-]/.test(password))}>
          At least one special character
        </li>
        <li className={getClass(!/\s/.test(password))}>No spaces allowed</li>
      </ol>

      {/* Terms & Privacy Agreement */}
      <div className="mt-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("agreeToTerms", {
              required: "You must agree before submitting",
            })}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <div className="text-sm text-gray-700 dark:text-gray-300 flex flex-wrap items-center gap-x-1">
            I agree to the
               <a
              className="text-blue-600 underline cursor-pointer"
              target="_blank"
              href="https://acewallscholarslearningonline.org/terms"
            >
              Terms
            </a>
            {/* <span className="text-blue-600 underline cursor-pointer"><TermsModal /></span> */}
            and
            <a
              className="text-blue-600 underline cursor-pointer"
              target="_blank"
              href="https://acewallscholarslearningonline.org/privacyPolicy"
            >
              Privacy Policy
            </a>
            {/* <span className="text-blue-600 underline cursor-pointer"><PrivacyPolicy /></span> */}
          </div>
        </label>
        {errors?.agreeToTerms && (
          <p className="text-xs text-red-600 mt-1">
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PasswordInfo;
