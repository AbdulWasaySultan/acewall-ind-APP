import { getApiInstance } from "./apiInstance";

//json data here is the previewdata , it is the json data of the course to be imported
export const courseImport = async (jsonData: any) => {
      const api = await getApiInstance();
       const response = await api.post(
         `/api/course/import-full-course`,
         jsonData
       );
       return response;
};
