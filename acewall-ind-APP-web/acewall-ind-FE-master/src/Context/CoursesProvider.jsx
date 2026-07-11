import { axiosInstance } from "@/lib/AxiosInstance";
import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GlobalContext } from "./GlobalProvider";

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseLoading, setCourseLoading] = useState(false);
  const { user } = useContext(GlobalContext);
  const [quarters, setQuarters] = useState({});

  return (
    <CourseContext.Provider
      value={{
        quarters,
        setQuarters,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
