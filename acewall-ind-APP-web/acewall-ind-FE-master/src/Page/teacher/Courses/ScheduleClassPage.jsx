import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Calendar,
  Clock,
  Trash2,
  Video,
  PlayCircle,
  StopCircle,
  AlertCircle,
} from "lucide-react";
import { format, isValid } from "date-fns";

const ScheduleClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60); // Default duration 60 mins
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setFetching(true);
    try {
      const res = await axiosInstance.get(`/zoom/course/${id}`);
      setMeetings(res.data);
    } catch (err) {
      console.error("Error fetching course meetings", err);
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!topic || !scheduledAt || !duration) return;

    setLoading(true);
    try {
      const isoDate = new Date(scheduledAt).toISOString();
      await axiosInstance.post("/zoom/schedule", {
        courseId: id,
        topic,
        scheduledAt: isoDate,
        duration: parseInt(duration),
      });
      setTopic("");
      setScheduledAt("");
      setDuration(60);
      fetchMeetings();
      alert("Success: Zoom meeting scheduled!");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      alert(`Error: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this scheduled meeting?")) return;

    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/zoom/${meetingId}`);
      alert(res.data.message || "Meeting deleted successfully");
      fetchMeetings();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (meetingId) => {
    try {
      setLoading(true);
      // Teacher joins/starts the meeting
      const res = await axiosInstance.get(`/zoom/join/${meetingId}`);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        alert("Failed to get meeting URL");
      }
    } catch (err) {
      console.error("Error starting meeting", err);
      const errMsg = err.response?.data?.message || "Failed to start meeting via Zoom.";
      alert(errMsg);
      // Refresh meetings to get updated status
      if (err.response?.data?.status === "ended") {
        fetchMeetings();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async (meetingId) => {
    if (!window.confirm("Are you sure you want to end this meeting? Students will be disconnected.")) return;

    try {
      setLoading(true);
      const res = await axiosInstance.put(`/zoom/end/${meetingId}`);
      alert(res.data.message || "Meeting ended successfully");
      fetchMeetings();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to end meeting.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    if (!isValid(dateObj)) return <span className="text-red-500">Invalid Date</span>;
    return (
      <>
        <span className="flex items-center gap-1"><Calendar size={14} /> {format(dateObj, "PPP")}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {format(dateObj, "p")}</span>
      </>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <Card className="shadow-md border-t-4 border-blue-600">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="text-blue-600" /> Schedule Zoom Class
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Topic</label>
                <Input
                  placeholder="e.g. Introduction to Database"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Calendar className="mr-2" />}
              Schedule Zoom Meeting
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          Course Scheduled Meetings
        </h3>

        {fetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((m) => (
              <div
                key={m._id}
                className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg shadow-sm bg-white border-blue-100"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      {m.topic}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                    {renderDateTime(m.scheduledAt)}
                    <span className="flex items-center gap-1">Duration: {m.duration} mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* STATUS BADGE */}
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${m.status === "active" ? "bg-green-100 text-green-700" :
                      m.status === "ended" ? "bg-red-50 text-red-500 border border-red-100" :
                        "bg-blue-50 text-blue-600"
                    }`}>
                    {m.status || "Scheduled"}
                  </div>

                  {/* Show different buttons based on status */}
                  {m.status === "ended" ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <AlertCircle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500 font-medium">Meeting Ended</span>
                    </div>
                  ) : m.status === "active" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => handleStart(m._id)}
                        disabled={loading}
                      >
                        <PlayCircle className="mr-2" size={16} /> Rejoin Class
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                        onClick={() => handleEnd(m._id)}
                        disabled={loading}
                      >
                        <StopCircle className="mr-2" size={16} /> End Meeting
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => handleStart(m._id)}
                      disabled={loading}
                    >
                      <PlayCircle className="mr-2" size={16} /> Start Class
                    </Button>
                  )}

                  {/* Only show delete for scheduled or ended meetings */}
                  {(m.status === "scheduled" || m.status === "ended") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(m._id)}
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <p className="text-center text-gray-500 py-4">No meetings scheduled for this course.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleClassPage;