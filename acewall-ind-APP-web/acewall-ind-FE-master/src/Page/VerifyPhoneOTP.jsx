import React, { useState, useRef, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Loader } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";

const VerifyPhoneOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const { email } = useParams();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { setUser, checkAuth } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus
      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/verifyPhoneOTP", { email, otp: enteredOtp });
      setUser(res.data.user);
      toast.success(res.data.message);
      
      // Navigate based on user role after successful phone verification
      const redirectUrl = localStorage.getItem("auth_redirect_url");
      if (redirectUrl) {
        localStorage.removeItem("auth_redirect_url");
        window.location.href = redirectUrl;
      } else {
        const role = res.data.user?.role;
        if (role === "teacher") {
          window.location.href = "/teacher";
        } else if (role === "student") {
          window.location.href = "/student/mycourses";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await axiosInstance
      .post("auth/resendPhoneOTP", { email })
      .then((res) => {
        setResendLoading(false);
        toast.success(res.data.message);
      })
      .catch((err) => {
        setResendLoading(false);
        toast.error(err.response.data.message || "Something went wrong.");
      });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8 text-center space-y-6">
        <div className="">
          <div className="flex justify-center item-center gap-2">
            <Key />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verify OTP
            </h1>
          </div>
          <p className="text-gray-600">
            We have sent a 6-digit OTP to your phone number.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputsRef.current[idx] = el)}
              className="w-12 h-12 text-center text-lg font-bold border-gray-300 focus:ring-2 focus:ring-[var(--color-acewall-green)]"
            />
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Didn’t receive an OTP? Please check your email address.
        </p>

        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              Verifying
            </span>
          ) : (
            "Verify"
          )}
        </Button>
        <button
          onClick={handleResend}
          className="text-sm text-blue-600"
          disabled={resendLoading}
        >
          {resendLoading ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              Resending
            </span>
          ) : (
            "Resend OTP"
          )}
        </button>
      </div>
    </div>
  );
};

export default VerifyPhoneOTP;
