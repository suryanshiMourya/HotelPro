import API from "./api";

const roomService = {
  list: async (params = {}) => (await API.get("/rooms", { params })).data,
  get: async (id) => (await API.get(`/rooms/${id}`)).data,
  create: async (payload) => (await API.post("/rooms", payload)).data,
  update: async (id, payload) => (await API.put(`/rooms/${id}`, payload)).data,
  remove: async (id) => (await API.delete(`/rooms/${id}`)).data
};

export default roomService;