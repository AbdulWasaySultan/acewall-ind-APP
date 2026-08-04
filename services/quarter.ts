import { getApiInstance } from "./apiInstance";

export interface QuarterDates {
  startDate: string;
  endDate: string;
}

// Was duplicated inline via getApiInstance() in three places (DiscussionStudent.tsx
// x2, CourseDetailsPage.tsx x1). Callers there deliberately swallow failures
// (falling back to "no quarter restriction"), so this intentionally does not
// catch/rewrap — it just lets the caller's own try/catch decide.
export const getQuarterDates = async (quarterId: string): Promise<QuarterDates> => {
  const api = await getApiInstance();
  const response = await api.get(`/api/quarter/getDatesofQuarter/${quarterId}`);
  return {
    startDate: response.data.startDate,
    endDate: response.data.endDate,
  };
};
