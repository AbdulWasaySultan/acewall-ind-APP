import React, { useState, useRef, useContext, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Key, Loader, XIcon } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { useNavigate } from "react-router-dom";

const VerifyOTPDialog = ({
  open,
  onOpenChange,
  onVerify,
  setOpen,
  type,
  sendingOTP,
}) => {
  console.log(type, "type");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { user, UpdatedUser, checkAuth } = useContext(GlobalContext);
  const navigate = useNavigate();

  // Reset OTP on dialog open
  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      const expiresAt = Date.now() + 10 * 60 * 1000;
      setOtpExpiresAt(expiresAt);
    }
  }, [open]);

  // Handle OTP expiry countdown
  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(otpExpiresAt - Date.now(), 0);
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  // Handle cooldown for resend OTP
  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
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

    if (timeLeft <= 0) {
      toast.error("OTP has expired. Please resend.");
      return;
    }

    setLoading(true);

    const endpoint =
      type === "password"
        ? "auth/updatePassword"
        : type === "phoneNumber"
        ? "auth/updatePhone"
        : "auth/updateEmail";

    const payload = {
      email: UpdatedUser.email,
      otp: enteredOtp,
    };

    try {
      const res = await axiosInstance.put(endpoint, payload);
      toast.success(res.data.message);
      setOpen(false);
      navigate(`/${user.role}/account`);
      checkAuth();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong.");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResendLoading(true);
    setCooldown(60);

    const endpoint =
      type === "password"
        ? "auth/resendOTP"
        : type === "phoneNumber"
        ? "auth/resendPhoneOTP"
        : "auth/resendOTP";

    try {
      const res = await axiosInstance.post(endpoint, {
        email: user.email,
      });
      toast.success(res.data.message);
      const expiresAt = Date.now() + 10 * 60 * 1000;
      setOtpExpiresAt(expiresAt);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={onVerify}
          type="submit"
          disabled={sendingOTP}
          className="bg-green-500 hover:bg-green-600"
        >
          {sendingOTP ? (
            <Loader className="mr-2 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="space-y-6">
        <DialogHeader>
          <div className="flex justify-between">
            <section>
              <div className="flex items-center gap-2">
                <Key />
                <DialogTitle>Verify OTP</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                We have sent a 6-digit OTP to your email.
              </p>
            </section>
            <XIcon
              onClick={() => setOpen(false)}
              size={15}
              className="cursor-pointer"
            />
          </div>
        </DialogHeader>

        {timeLeft > 0 && (
          <div className="text-center text-sm font-medium text-gray-600">
            OTP expires in{" "}
            <span className="font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}

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
              className="w-12 h-12 text-center text-lg font-bold"
            />
          ))}
        </div>

        <DialogFooter className="flex justify-between items-center w-full gap-2">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSubmit}
            disabled={loading || otp.join("").length < 6 || timeLeft <= 0}
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

          <Button
            onClick={handleResend}
            variant={"link"}
            className="text-sm text-blue-600 self-center cursor-pointer"
            disabled={resendLoading || cooldown > 0}
          >
            {resendLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" />
                Resending
              </span>
            ) : cooldown > 0 ? (
              `Resend OTP in ${cooldown}s`
            ) : (
              "Resend OTP"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOTPDialog;
