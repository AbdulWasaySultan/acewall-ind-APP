import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Link, useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";

export default function SBLScaleForm() {
  const [sblScale, setSblScale] = useState([]);
  const [loading, setLoading] = useState(false);
  const courseId = useParams().courseId;

  useEffect(() => {
    const fetchSBLScale = async () => {
      setLoading(true);
      try {
        // UPDATED ENDPOINT
        const res = await axiosInstance.get(`standardGrading/get/${courseId}`);

        // UPDATED DATA ACCESS
        setSblScale(res.data.scale || []);
      } catch (err) {
        console.error("Error fetching SBL scale:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSBLScale();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <BackButton className="mb-10" />

      <Card>
        <CardHeader>
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg font-bold">
                Standard-Based Learning Scale
              </CardTitle>
            </div>
            <Link to={`/teacher/courses/Sbl/${courseId}/managesblscale`}>
              <Button className="bg-green-500 hover:bg-green-600">
                Manage SBL Scale
              </Button>
            </Link>
          </section>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Loader2 className="animate-spin w-6 h-6 mb-2" />
              <p>Loading SBL scale...</p>
            </div>
          ) : sblScale.length > 0 ? (
            <div className="space-y-3">
              {/* Header Row */}
              <div className="grid grid-cols-4 gap-2 font-medium text-sm text-gray-500 mb-2 border-b pb-1">
                <div>Percentage Range</div>
                <div>Points</div>
                <div>Remarks</div>
                <div>Bar</div>
              </div>

              {/* Data Rows */}
              {sblScale.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center border-b border-gray-100 pb-2"
                >
                  <div className="text-sm">
                    {item.minPercentage}% – {item.maxPercentage}%
                  </div>

                  <Badge className="font-bold text-sm px-3 py-1 bg-green-500 text-white">
                    {item.points}
                  </Badge>

                  <div className="text-sm text-gray-700">{item.remarks}</div>

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
              <p>No Standard-Based Learning scale found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
