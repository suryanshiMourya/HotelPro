import API from "./api";

export const getCities = async (params = {}) => {
  const response = await API.get("/locations/cities", { params });
  return response.data.cities || [];
};

export const getStates = async () => {
  const response = await API.get("/locations/states");
  return response.data.states || [];
};
