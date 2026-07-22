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
  // GET /zoom/course/:courseId
  getCourseMeetings: async (courseId: string): Promise<ZoomMeeting[]> => {
    const api = await getApiInstance();
    const response = await api.get(`/zoom/course/${courseId}`);
    return response.data;
  },

  // POST /zoom/schedule
  scheduleMeeting: async (
    payload: ScheduleMeetingPayload
  ): Promise<ZoomMeeting> => {
    const api = await getApiInstance();
    const response = await api.post("/zoom/schedule", payload);
    return response.data;
  },

  // GET /zoom/join/:meetingId
  joinMeeting: async (meetingId: string): Promise<{ url: string }> => {
    const api = await getApiInstance();
    const response = await api.get(`/zoom/join/${meetingId}`);
    return response.data;
  },

  // PUT /zoom/end/:meetingId
  endMeeting: async (meetingId: string): Promise<void> => {
    const api = await getApiInstance();
    api.put(`/zoom/end/${meetingId}`);
  },

  // DELETE /zoom/:meetingId
  deleteMeeting: async (meetingId: string): Promise<void> => {
    const api = await getApiInstance();
    api.delete(`/zoom/${meetingId}`);
  },
};
