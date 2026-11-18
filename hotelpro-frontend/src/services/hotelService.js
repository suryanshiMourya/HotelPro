import API from "./api";

const hotelService = {
  list: async (params = {}) => (await API.get("/hotels", { params })).data,
  get: async (id) => (await API.get(`/hotels/${id}`)).data,
  create: async (payload) => (await API.post("/hotels", payload)).data,
  update: async (id, payload) => (await API.put(`/hotels/${id}`, payload)).data,
  remove: async (id) => (await API.delete(`/hotels/${id}`)).data
};

export default hotelService;