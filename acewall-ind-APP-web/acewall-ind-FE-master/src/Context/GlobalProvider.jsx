import { Toaster } from "@/components/ui/sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { set } from "date-fns";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [Authloading, setAuthLoading] = useState(true);
  const [signUpdata, setSignupData] = useState({});
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [UpdatedUser, setUpdatedUser] = useState(null);
  const [taggedMessage, setTaggedMessage] = useState(null);

  const disconnectsocket = () => {
    if (socket && socket.connected) {
      socket.disconnect();
      console.log("Socket disconnected");
      setSocket(null);
    }
  };

  const login = async (formdata) => {
    setAuthLoading(true);
    await axiosInstance
      .post("auth/login", formdata)
      .then((res) => {
        console.log(res, "res");
        setUser(res.data.user);
        toast.success(res.data.message);
        setAuthLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setAuthLoading(false);
        toast.error(err.response.data.message);
      });
  };

  const checkAuth = async () => {
    try {
      console.log("Checking auth...");
      setAuthLoading(true); // Set loading at the start
      const res = await axiosInstance.get("auth/checkAuth", {
        withCredentials: true,
      });
      setUser(res.data.user);
      return res.data.user; // Return user for chaining
    } catch (error) {
      console.log("Auth check error:", error);
      setUser(null); // Important: Clear user on error
      // toast.error(error.response?.data?.message);
    } finally {
      setAuthLoading(false); // Always set loading to false
    }
  };

  const logout = async () => {
    try {
      const res = await axiosInstance.post("auth/logout");
      console.log(res);
      toast.success(res.data.message);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Logout failed");
    } finally {
      // Always clear local state regardless of API response
      setUser(null);
      setUpdatedUser(null);
      disconnectsocket();
      setAuthLoading(false);
    }
  };

  const fetchUser = () => {
    axiosInstance
      .get("auth/getUserInfo")
      .then((res) => {
        setUpdatedUser(res.data.user);
      })
      .catch(console.log);
  };

  return (
    <GlobalContext.Provider
      value={{
        signUpdata,
        setSignupData,
        checkAuth,
        login,
        logout,
        user,
        Authloading,
        setAuthLoading,
        socket,
        setSocket,
        setOnlineUser,
        currentConversation,
        setCurrentConversation,
        selectedSubcategoryId,
        setSelectedSubcategoryId,
        setUser,
        UpdatedUser,
        setUpdatedUser,
        taggedMessage,
        setTaggedMessage,
        fetchUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
