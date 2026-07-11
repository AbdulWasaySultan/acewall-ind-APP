import { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { GraduationCap, BookOpen, X } from "lucide-react";

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { setUser, checkAuth } = useContext(GlobalContext);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Handle Google Sign In Success
  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    
    if (!credential) {
      toast.error("Google authentication failed");
      return;
    }

    setIsLoading(true);

    try {
      // First, try to login without role (for existing users)
      const response = await axiosInstance.post("auth/google", {
        token: credential,
      });

      // If successful, user exists and is logged in
      setUser(response.data.user);
      toast.success(response.data.message);
      
      // Check auth to get full user details
      const user = await checkAuth();
      
      // Redirect based on role
      if (user?.role === "teacher") {
        navigate("/teacher");
      } else if (user?.role === "student") {
        navigate("/student/mycourses");
      }
    } catch (error) {
      // Check if error is because role is required (new user)
      if (error.response?.data?.message === "Role is required for new users") {
        // New user - show role selection modal
        setGoogleCredential(credential);
        setShowRoleModal(true);
      } else {
        // Other error
        const errorMessage = error.response?.data?.message || "Google authentication failed";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle Role Selection for New Users
  const handleRoleSelect = async (role) => {
    if (!googleCredential) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("auth/google", {
        token: googleCredential,
        role: role,
      });

      setUser(response.data.user);
      toast.success(response.data.message);
      setShowRoleModal(false);
      
      // Check auth to get full user details
      const user = await checkAuth();
      
      // Redirect based on role
      if (user?.role === "teacher") {
        navigate("/teacher");
      } else if (user?.role === "student") {
        navigate("/student/mycourses");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setGoogleCredential(null);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign In was unsuccessful. Please try again.");
  };

  return (
    <div className="w-full">
      {/* Google Login Button */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full">
          
          <div className="relative flex justify-center text-xs uppercase">
            <span className="text-white font-bold p-2">Or continue with</span>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>
      </div>

      {/* Role Selection Modal for New Users */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowRoleModal(false);
                setGoogleCredential(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Welcome to Acewall Scholars!
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Select your role to complete registration
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-6 text-center">
                You&apos;re signing in with Google for the first time. 
                Please select your role to create your account.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Student Option */}
                <button
                  onClick={() => handleRoleSelect("student")}
                  disabled={isLoading}
                  className="group flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                    <GraduationCap size={28} className="text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Student</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Learn and grow
                  </span>
                </button>

                {/* Teacher Option */}
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  disabled={isLoading}
                  className="group flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <BookOpen size={28} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Teacher</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Share knowledge
                  </span>
                </button>
              </div>

              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">Creating your account...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 text-center">
              <p className="text-xs text-gray-500">
                You can change your role later in account settings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
