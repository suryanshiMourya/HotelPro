import API from "./api";

const authService = {
  register: async (payload) => (await API.post("/auth/register", payload)).data,
  login: async (payload) => (await API.post("/auth/login", payload)).data,
  profile: async () => (await API.get("/auth/profile")).data
};

export default authService;