import * as React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import acewallscholarslogo from "../../assets/acewallscholarslogo.png";
import acewallshort from "../../assets/acewallshort.png";
import {
  Menu,
  MessageCircleDashed,
  Search,
  BadgePlus,
  DollarSign,
  GraduationCap,
  Wallet,
  MessagesSquare,
  NotepadText,
  Verified,
  MessagesSquareIcon,
  Coffee,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../../components/ui/button";
import { TeacherTopNavbarDropDown } from "@/CustomComponent/TeacherTopNavDropDown";
import { Input } from "../../components/ui/input";
import { DashboardCircleAddIcon } from "@/assets/Icons/deshboard";
import { Book02Icon } from "@/assets/Icons/mycoursesIcon";
import { AssessmentIcon } from "@/assets/Icons/AssignmentIcon";
import { Megaphone02Icon } from "@/assets/Icons/Announcement";
import Footer from "@/CustomComponent/Footer";
import { useContext } from "react";
import { GlobalContext } from "@/Context/GlobalProvider";
import { useState } from "react";
import avatar from "../../assets/avatar.png";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { axiosInstance } from "@/lib/AxiosInstance";
import { FaFileImport } from "react-icons/fa6";
import MeetingToast from "@/Page/StudentPortal/Meetings/MeetingToast";
import StripeOnboardingModal from "./Stripe/StripeOnboardingModal";

// Updated Sidebar Tabs with a "Courses" dropdown group
const sideBarTabs = [
  {
    id: 1,
    name: "Dashboard",
    icon: <DashboardCircleAddIcon />,
    path: "/teacher",
  },
  {
    name: "Courses",
    icon: <BookOpen className="w-5 h-5 " />,
    isDropdown: true,
    subItems: [
      {
        id: 2,
        name: "My Courses",
        icon: <Book02Icon />,
        path: "/teacher/courses",
      },
      {
        id: 6,
        name: "Create Course",
        icon: <BadgePlus />,
        path: "/teacher/courses/createCourses",
      },
      {
        id: 3,
        name: "Assessments",
        icon: <AssessmentIcon />,
        path: "/teacher/assessments",
      },
      {
        id: 5,
        name: "Announcements",
        icon: <Megaphone02Icon />,
        path: "/teacher/AnnouncementsCourses",
      },

      {
        id: 11,
        name: "Discussion Rooms",
        icon: <MessagesSquareIcon />,
        path: "/teacher/discussions/allCourses",
      },
      {
        id: 18,
        name: "Import course",
        icon: <FaFileImport aria-hidden="true" />,
        path: "/teacher/courses/import",
      },
    ],
  },
  {
    id: 12,
    name: "Messages",
    icon: <MessageCircleDashed />,
    path: "/teacher/conversation/courses",
  },
  {
    id: 13,
    name: "Students",
    icon: <GraduationCap />,
    path: "/teacher/coursesstd",
  },
  {
    id: 14,
    name: "Spill the Tea",
    icon: <Coffee />,
    path: "/teacher/social",
  },
  {
    id: 15,
    name: "Wallet",
    icon: <Wallet />,
    path: "/teacher/wallet",
  },
];

export default function TeacherLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false); // State to toggle dropdown

  const { checkAuth, user, Authloading, setAuthLoading, UpdatedUser } =
    useContext(GlobalContext);
  const location = useLocation().pathname;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [dropdownCourses, setDropdownCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [ispublished, setIspublished] = useState(true);
  const [upcomingMeeting, setUpcomingMeeting] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;
    setLoading(true);
    setOpenDropdown(false);
    try {
      const res = await axiosInstance.get(`/course/getindividualcourse`, {
        params: { search: searchQuery, isVerified: "approved" },
      });
      const courses = res.data.courses || [];
      setDropdownCourses(courses);
    } catch (error) {
      console.error("Search error:", error);
      setDropdownCourses([]);
    } finally {
      setLoading(false);
      setOpenDropdown(true);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part.toLowerCase() === query.toLowerCase() ? (
              <span className="text-acewall-green font-semibold">{part}</span>
            ) : (
              part
            )}
          </span>
        ))}
      </>
    );
  };

  React.useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await axiosInstance.get("/zoom/upcoming");
        const meeting = res.data.meeting || res.data.data || (res.data._id ? res.data : null);
        if (meeting) {
          setUpcomingMeeting(meeting);
          setToastVisible(true);
        }
      } catch (err) {
        console.error("Error fetching upcoming meeting for teacher:", err);
      }
    };

    if (user) {
      fetchUpcoming();
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      <MeetingToast
        meeting={upcomingMeeting}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      <StripeOnboardingModal />
      <header className="sticky top-0 z-10 bg-white">
        <div className="h-8 bg-acewall-blue flex justify-end items-center px-5 cursor-pointer">
          <TeacherTopNavbarDropDown />
        </div>
        <div className="flex h-20 items-center justify-between px-4 border">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <Link to="/teacher" className="block md:hidden">
            <img
              src={acewallshort}
              alt="Mobile Logo"
              className="w-8 rounded-full h-auto cursor-pointer"
            />
          </Link>
          <Link to="/teacher" className="hidden md:block">
            <img
              src={acewallshort}
              alt="Desktop Logo"
              className="w-20 h-auto cursor-pointer"
            />
          </Link>

          <div className="relative w-64 hidden md:flex flex-col">
            <DropdownMenu
              open={openDropdown}
              onOpenChange={setOpenDropdown}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <div className="relative flex gap-2 w-full">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value.trim()) {
                        setDropdownCourses([]);
                        setOpenDropdown(false);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search courses and lessons"
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-acewall-blue rounded-md transition-all"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-md rounded-md mt-2 max-h-60 overflow-y-auto z-50 w-64">
                {loading ? (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-gray-700">Searching...</span>
                  </DropdownMenuItem>
                ) : dropdownCourses.length > 0 ? (
                  dropdownCourses.map((course) => (
                    <DropdownMenuItem asChild key={course._id}>
                      <Link
                        to={`/teacher/courses/courseDetail/${course._id}`}
                        onClick={() => setOpenDropdown(false)}
                        className="w-full block text-sm text-gray-800 hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        {highlightMatch(
                          course.courseTitle || "Untitled Course",
                          searchQuery
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-gray-500">
                      No results found
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="text-center">
        {user?.role === "teacher" && user?.isVarified === false && (
          <div className="bg-yellow-200 text-black p-2 rounded text-center">
            <p className="text-xs">
              Your account is not verified yet. Your course will not be visible
              for students. Please upload your document from the{" "}
              <Link to="/teacher/account" className="text-blue-600 underline">
                account page
              </Link>{" "}
              for admin verification.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`relative bg-[#F3F4F6] ${isSidebarOpen ? "block" : "hidden"
            } w-screen md:w-64 flex-shrink-0 overflow-y-auto md:block`}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3 pb-4">
              <Link to="/teacher/account" className="w-10 h-10 block">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={UpdatedUser?.profileImg?.url || avatar}
                    alt={UpdatedUser?.firstName || "User Avatar"}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </Link>
              <div>
                <p className="font-medium">
                  {UpdatedUser?.firstName || "username"}
                </p>
                <p
                  className="text-sm text-gray-600 w-full max-w-[150px] break-words"
                  title={UpdatedUser?.email}
                >
                  {UpdatedUser?.email}
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {sideBarTabs.map((tab, idx) => {
                if (tab.isDropdown) {
                  return (
                    <div key={tab.name} className="flex flex-col">
                      <button
                        onClick={() =>
                          setIsCourseDropdownOpen(!isCourseDropdownOpen)
                        }
                        className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-black hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          {tab.icon}
                          <span className="text-acewall-blue">{tab.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isCourseDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {isCourseDropdownOpen && (
                        <div className="pl-6 space-y-1 mt-1 border-l ml-5 border-gray-100">
                          {tab.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm ${location === sub.path
                                ? "bg-acewall-blue text-white"
                                : "text-black hover:bg-gray-50"
                                }`}
                            >
                              <div className="scale-75">{sub.icon}</div>
                              <span
                                className={
                                  location === sub.path
                                    ? "text-white"
                                    : "text-acewall-blue"
                                }
                              >
                                {sub.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={tab.name}
                    to={tab.path ?? "#"}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 ${location === tab.path
                      ? "bg-acewall-blue text-white"
                      : "text-black hover:bg-gray-50"
                      }`}
                  >
                    {tab.icon}
                    <span
                      className={
                        location === tab.path ? "text-white" : "text-acewall-blue"
                      }
                    >
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-full flex flex-col items-center justify-between mt-10 w-full">
              <img src={acewallscholarslogo} alt="" className="w-full" />
              <Link
                to="https://www.acewallscholars.org/contact-Us"
                className="text-center font-semibold text-sm mt-4 text-acewall-main"
              >
                Need Tutoring? Contact us
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-2 md:p-4 hide-scrollbar overflow-y-scroll w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}