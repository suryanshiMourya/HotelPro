import API from "./api";

const paymentService = {
  createMock: async (payload) => (await API.post("/payments/mock/create", payload)).data,
  completeMock: async (payload) => (await API.post("/payments/mock/complete", payload)).data,
  mine: async () => (await API.get("/payments/my")).data,
  all: async () => (await API.get("/payments")).data,
  get: async (id) => (await API.get(`/payments/${id}`)).data
};

export default paymentService;