import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Button } from "@/components/ui/button";

import acewallscholarslogo from "../assets/acewallscholarslogo.png";
import acewallshort from "../assets/acewallshort.png";

import Footer from "@/CustomComponent/Footer";
import ScrollToTop from "@/lib/scrolltop";
import { GlobalContext } from "@/Context/GlobalProvider";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext);
  const location = useLocation();

  const handleGoToAccount = () => {
    if (!user) {
      return navigate("/login");
    }

    if (user.role === "student" || user.role === "teacherAsStudent") {
      navigate("/student/mycourses");
    } else if (user.role === "teacher") {
      navigate("/teacher/");
    } else {
      navigate("/");
    }
  };


  return (
    <>
      <ScrollToTop />
      <div className="flex h-full flex-col w-screen">

        <header className="sticky top-0 z-10 bg-white w-full">
          <div className="h-10 bg-blue-600 flex justify-end items-end px-5 cursor-pointer" />
          <div className="flex h-16 items-center justify-between px-4">
            <Link className="block md:hidden" to={"/"}>
              <img src={acewallshort} alt="Mobile Logo" className="w-10 h-10 object-contain cursor-pointer" />
            </Link>
            <Link className="hidden md:block" to={"/"}>
              <img src={acewallshort} alt="Desktop Logo" className="h-12 w-auto object-contain cursor-pointer" />
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {/* Conditionally render the button based on whether user is logged in */}
              {user ? (
                <Button onClick={handleGoToAccount} className="bg-blue-600 text-white hover:bg-blue-700">
                  Go to your account
                </Button>
              ) : (
                <Link to="/login">
                  <button className="border border-blue-600 text-blue-600 bg-white font-semibold py-2 px-6 rounded-md shadow-md hover:bg-blue-50 transition text-sm sm:text-base">
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 hide-scrollbar overflow-y-scroll">
            <Outlet />
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
