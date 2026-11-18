import API from "./api";

const bookingService = {
  create: async (payload) => (await API.post("/bookings", payload)).data,
  mine: async () => (await API.get("/bookings/my")).data,
  all: async () => (await API.get("/bookings")).data,
  cancel: async (id) => (await API.patch(`/bookings/${id}/cancel`)).data
};

export default bookingService;