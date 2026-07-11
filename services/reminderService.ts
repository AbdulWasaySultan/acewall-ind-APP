import { getApiInstance } from "./apiInstance";
import Toast from "react-native-simple-toast";

export const loadReminderSetting = async (assessmentId: string) => {
  const api = await getApiInstance();
  const res = await api.get(`/assessment/findReminderTime/${assessmentId}`);
  return res.data.reminderTime || "noReminder";
};

export const saveReminderSetting = async (
  assessmentId: string,
  reminder: string
) => {
  const api = await getApiInstance();
  await api.put(`/assessment/setReminder/${assessmentId}`, { reminder });
};

export const sendManualReminder = async (assessmentId: string) => {
  const api = await getApiInstance();
  const res = await api.post(`/assessment/${assessmentId}/send-reminder`);
  return res.data; // contains message, enrolledStudents, etc.
};
