import { CourseContext } from "@/Context/CoursesProvider";
import BackButton from "@/CustomComponent/BackButton";
import { axiosInstance } from "@/lib/AxiosInstance";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { Link, useParams } from "react-router-dom";

const StudentSemesterDetailStdPre = () => {
  const { semesterId, courseId } = useParams();
  const { quarters } = useContext(CourseContext);
  const [allQuarter, setallQuarter] = useState([]);

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const res = await axiosInstance.get(`quarter/get/${semesterId}`);
        console.log(res)
        setallQuarter(res.data.quarters);
      } catch (err) {
        console.log(err);
      }
    };

    fetchQuarters();
  }, [semesterId, quarters]);

  return (
    <div className="space-y-4">
      <BackButton className="mb-10" />

      <div className="w-full ">
        <p className="text-lg font-semibold text-black">Quarters</p>
      </div>
      {allQuarter?.length > 0 ? (
        allQuarter?.map((quarter, index) => (
          <Link to={`/teacher/courses/${courseId}/quarterStdPre?quarterId=${quarter._id}&semesterbased=true`}>
            <div
              key={quarter._id}
              className="mb-4 border border-gray-200 p-5 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer"
            >
              <h3 className="font-semibold text-md">
                Quarter: {quarter.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(quarter.startDate), "MMMM do, yyyy")} -{" "}
                {format(new Date(quarter.endDate), "MMMM do, yyyy")}
              </p>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No quarters selected.</p>
      )}
    </div>
  );
};

export default StudentSemesterDetailStdPre;
