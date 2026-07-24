import { getApiInstance } from "./apiInstance"; // Your configured Axios instance

export interface ScheduleMeetingPayload {
  courseId: string;
  topic: string;
  scheduledAt: string; // ISO String
  duration: number; // in minutes
}

export interface ZoomMeeting {
  _id: string;
  courseId: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status?: "scheduled" | "active" | "ended";
  joinUrl?: string;
  startUrl?: string;
}

export const zoomService = {
  // GET /api/zoom/course/:courseId
  getCourseMeetings: async (courseId: string): Promise<ZoomMeeting[]> => {
    const api = await getApiInstance();
    const response = await api.get(`/api/zoom/course/${courseId}`);
    return response.data;
  },

  // POST /api/zoom/schedule
  scheduleMeeting: async (
    payload: ScheduleMeetingPayload
  ): Promise<ZoomMeeting> => {
    const api = await getApiInstance();
    const response = await api.post("/api/zoom/schedule", payload);
    return response.data;
  },

  // GET /api/zoom/join/:meetingId
  joinMeeting: async (meetingId: string): Promise<{ url: string }> => {
    const api = await getApiInstance();
    const response = await api.get(`/api/zoom/join/${meetingId}`);
    return response.data;
  },

  // PUT /api/zoom/end/:meetingId
  endMeeting: async (meetingId: string): Promise<void> => {
    const api = await getApiInstance();
    api.put(`/api/zoom/end/${meetingId}`);
  },

  // DELETE /api/zoom/:meetingId
  deleteMeeting: async (meetingId: string): Promise<void> => {
    const api = await getApiInstance();
    api.delete(`/api/zoom/${meetingId}`);
  },
};
