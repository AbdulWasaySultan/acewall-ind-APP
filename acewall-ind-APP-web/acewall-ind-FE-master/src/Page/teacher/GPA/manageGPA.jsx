import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";

export default function GpaScaleForm() {
  const [gpaScale, setGpaScale] = useState([]);
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();

  useEffect(() => {
    const fetchGpaScale = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`gpa/get/${courseId}`);
        setGpaScale(res.data.grade || []);
      } catch (err) {
        console.error("Error fetching GPA scale:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGpaScale();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <BackButton className="mb-10" />

      <Card>
        <CardHeader>
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg font-bold">GPA Scale</CardTitle>
            </div>
            <Link to={`/teacher/courses/gpa/${courseId}/managegradescale`}>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Manage GPA Scale
              </Button>
            </Link>
          </section>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Loader2 className="animate-spin w-6 h-6 mb-2" />
              <p>Loading GPA scale...</p>
            </div>
          ) : gpaScale.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 font-medium text-sm text-gray-500 mb-2 border-b pb-1">
                <div>GPA</div>
                <div>Percentage Range</div>
                <div>Bar</div>
              </div>

              {gpaScale.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 items-center border-b border-gray-100 pb-2"
                >
                  <Badge className="font-bold text-sm px-3 py-1 bg-blue-500 text-white">
                    {item.gpa.toFixed(2)}
                  </Badge>
                  <div className="text-sm">
                    {item.minPercentage}% – {item.maxPercentage}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${item.maxPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>No GPA scale added yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
