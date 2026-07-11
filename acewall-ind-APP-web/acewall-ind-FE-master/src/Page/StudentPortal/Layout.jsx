import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import acewallscholarslogo from "../../assets/acewallscholarslogo.png";
import acewallshort from "../../assets/acewallshort.png";
import avatar from "../../assets/avatar.png";

import {
  Bot,
  Coffee,
  Menu,
  MessageCircleDashed,
  MessagesSquareIcon,
  Search,
  Loader,
  ChevronDown,
  BookOpen,
  X,
  Video,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { TopNavbarDropDown } from "../../CustomComponent/TopNavDropDown";
import { Input } from "../../components/ui/input";

import { DashboardCircleAddIcon } from "@/assets/Icons/deshboard";
import { Book02Icon } from "@/assets/Icons/mycoursesIcon";
import { AssessmentIcon } from "@/assets/Icons/AssignmentIcon";
import { Megaphone02Icon } from "@/assets/Icons/Announcement";
import { Target02Icon } from "@/assets/Icons/grades";

import Footer from "@/CustomComponent/Footer";
import MoreCoursesDropdown from "@/CustomComponent/MoreCoursesDropdown";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import MeetingToast from "@/Page/StudentPortal/Meetings/MeetingToast";
import { useEffect } from "react";

// Sidebar tabs configuration with Dropdown grouping
const sideBarTabs = [
  {
    id: 1,
    name: "Dashboard",
    icon: <DashboardCircleAddIcon />,
    path: "/student",
    allowedAsPreview: true,
  },
  {
    name: "Courses",
    icon: <BookOpen className="w-5 h-5 text-black" />,
    isDropdown: true,
    subItems: [
      {
        id: 2,
        name: "My Courses",
        icon: <Book02Icon />,
        path: "/student/mycourses",
        allowedAsPreview: true,
      },
      {
        id: 3,
        name: "My Assessment",
        icon: <AssessmentIcon />,
        path: "/student/assessment",
        allowedAsPreview: true,
      },
      {
        id: 4,
        name: "Gradebook",
        icon: <Target02Icon />,
        path: "/student/gradebook",
        allowedAsPreview: true,
      },
      {
        id: 6,
        name: "Announcements",
        icon: <Megaphone02Icon />,
        path: "/student/AnnouncementsCoursesStd",
        allowedAsPreview: true,
      },
      {
        id: 11,
        name: "Live Classes",
        icon: <Video className="w-5 h-5" />,
        path: "/student/meetings",
        allowedAsPreview: true,
      },
      {
        id: 7,
        name: "Discussion Rooms",
        icon: <MessagesSquareIcon />,
        path: "/student/discussions/allCourses",
        allowedAsPreview: true,
      },

    ],
  },
  {
    id: 5,
    name: "Spill the Tea",
    icon: <Coffee aria-hidden="true" />,
    path: "/student/social",
  },
  {
    id: 8,
    name: "Messages",
    icon: <MessageCircleDashed aria-hidden="true" />,
    path: "/student/messages",
    allowedAsPreview: false,
  },
  {
    id: 9,
    name: "AI Assistant",
    icon: <Bot aria-hidden="true" />,
    path: "/student/ai",
    allowedAsPreview: false,
  },
];

export default function Layout() {
  const { user, checkAuth, UpdatedUser } = React.useContext(GlobalContext);
  const location = useLocation().pathname;

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = React.useState(false); // Controls the "Courses" sub-menu
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dropdownCourses, setDropdownCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [upcomingMeeting, setUpcomingMeeting] = React.useState(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;
    setLoading(true);
    setOpenDropdown(false);
    try {
      const res = await axiosInstance.get("/enrollment/studentCourses", {
        params: { search: searchQuery },
      });
      setDropdownCourses(res.data.enrolledCourses || []);
    } catch (error) {
      console.error("Search error:", error);
      setDropdownCourses([]);
    } finally {
      setLoading(false);
      setOpenDropdown(true);
    }
  };

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await axiosInstance.get("/zoom/upcoming");
        const meeting = res.data.meeting || res.data.data || (res.data._id ? res.data : null);
        if (meeting) {
          setUpcomingMeeting(meeting);
          setToastVisible(true);
        }
      } catch (err) {
        console.error("Error fetching upcoming meeting:", err);
      }
    };

    if (user) {
      fetchUpcoming();
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <MeetingToast
        meeting={upcomingMeeting}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      <header className="sticky top-0 z-10 bg-white" role="banner">
        <div className="h-8 bg-acewall-blue flex justify-end items-center px-5">
          {user && user.role === "teacherAsStudent" ? (
            <div className="flex items-center justify-between space-x-4 w-full text-white">
              <p className="text-sm">{`Viewing as Student - ${user.firstName} ${user.lastName}`}</p>
              <Button
                variant="outline"
                size="xs"
                className="px-3 text-xs bg-white text-acewall-blue"
                onClick={async () => {
                  await axiosInstance.post("auth/previewSignOut").then(() => {
                    checkAuth();
                    navigate("/teacher");
                  });
                }}
              >
                Switch to Teacher
              </Button>
            </div>
          ) : (
            <TopNavbarDropDown />
          )}
        </div>

        <div className="flex h-16 items-center justify-between px-4 border">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link to="/student" className="block md:hidden">
            <img src={acewallshort} alt="Logo" className="w-8 h-auto rounded-full" />
          </Link>
          <Link to="/student" className="hidden md:block">
            <img
              src={acewallshort}
              alt="Desktop Logo"
              className="w-20 mt-2 h-auto cursor-pointer"
            />          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <MoreCoursesDropdown />
            <Link to="/student/support" className="text-sm font-medium text-gray-700">SUPPORT</Link>
            <Link to="/student/ContactUs" className="text-sm font-medium text-gray-700">CONTACT US</Link>
          </nav>

          <div className="relative w-64 hidden md:flex flex-col">
            <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown} modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="relative flex gap-2 w-full">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search courses..."
                    className="w-full"
                  />
                  <button onClick={handleSearch} className="bg-[var(--color-acewall-green)] hover:bg-emerald-600 text-white rounded-full p-2">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border mt-2 max-h-60 overflow-y-auto z-50 w-64">
                {loading ? (
                  <DropdownMenuItem disabled><Loader className="mr-2 h-4 w-4 animate-spin" />Searching...</DropdownMenuItem>
                ) : dropdownCourses.length > 0 ? (
                  dropdownCourses.map((enrollment) => (
                    <DropdownMenuItem key={enrollment._id} asChild>
                      <Link to={`/student/mycourses/${enrollment._id}`} onClick={() => setOpenDropdown(false)} className="w-full text-sm text-gray-800 hover:bg-gray-100 px-2 py-1 block">
                        {enrollment.course.courseTitle || "Untitled Course"}
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No results found</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside id="student-sidebar" className={`bg-[#F3F4F6] ${isSidebarOpen ? "fixed inset-0 z-20 md:static" : "hidden"} w-screen md:w-64 flex-shrink-0 overflow-y-auto md:block border-r`}>
          <div className="p-4">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <Link to="/student/account" className="block">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img src={UpdatedUser?.profileImg?.url || avatar} alt="Profile" className="h-full w-full object-cover" />
                </div>
              </Link>
              <div>
                <p className="font-medium">{UpdatedUser?.firstName || "username"}</p>
                <p className="text-sm text-gray-600 w-full max-w-[150px] break-words">{UpdatedUser?.email}</p>
              </div>
            </div>

            <nav className="space-y-2 pt-4">
              {sideBarTabs.map((tab) => {
                if (tab.isDropdown) {
                  return (
                    <div key={tab.name}>
                      <button
                        onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-black hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {tab.icon}
                          <span className="text-blue-600 font-medium">{tab.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCoursesOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isCoursesOpen && (
                        <div className="pl-6 mt-1 space-y-1 border-l-2 ml-5 border-gray-100">
                          {tab.subItems.map((sub) => {
                            const isSubDisabled = user.role === "teacherAsStudent" && sub.allowedAsPreview === false;
                            return (
                              <Link
                                key={sub.path}
                                to={isSubDisabled ? "#" : sub.path}
                                onClick={() => !isSubDisabled && setIsSidebarOpen(false)}
                                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${location === sub.path ? "bg-acewall-blue text-white" : isSubDisabled ? "opacity-50 cursor-not-allowed" : "text-black hover:bg-gray-50"
                                  }`}
                              >
                                <div className="scale-75">{sub.icon}</div>
                                <span className={location === sub.path ? "text-white" : "text-acewall-blue"}>{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isDisabled = user.role === "teacherAsStudent" && tab.allowedAsPreview === false;
                return (
                  <Link
                    key={tab.path}
                    to={isDisabled ? "#" : tab.path}
                    onClick={() => !isDisabled && setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${location === tab.path ? "bg-acewall-blue text-white" : isDisabled ? "opacity-50 cursor-not-allowed" : "text-black hover:bg-gray-100"
                      }`}
                  >
                    {tab.icon}
                    <span className={location === tab.path ? "text-white" : "text-acewall-blue"}>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-2 md:p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}