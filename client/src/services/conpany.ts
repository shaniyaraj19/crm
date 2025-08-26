import { api } from "./api";

export const getCompanies = async () => {
  try {
    const res = await api.get("http://localhost:3001/api/v1/companies/");
    return res.data;  
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};