import { api } from "./api";

export const getCompanies = async () => {
  try {
    const res = await api.get("/companies/");
    return res.data;  
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};

export const updateCompany = async (companyId: string, updateData: any) => {
  try {
    console.log('🔧 Service: Calling API with:', { companyId, updateData });
    const res = await api.put(`/companies/${companyId}`, updateData);
    console.log('🔧 Service: Raw API response:', res);
    console.log('🔧 Service: Response data:', res.data);
    console.log('🔧 Service: Response data.data:', res.data.data);
    console.log('🔧 Service: Response data.data.company:', res.data.data?.company);
    
    // Extract the company data from the response structure
    const extractedData = res.data.data?.company || res.data;
    console.log('🔧 Service: Extracted data to return:', extractedData);
    return extractedData;
  } catch (err: any) {
    console.error("Error updating company:", err.response?.data || err.message);
    throw err;
  }
};