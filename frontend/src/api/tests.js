import axios from "../lib/axios";

export const testsApi = {
  generate: (payload) => axios.post("/api/tests/generate", payload),
  run: (payload) => axios.post("/api/tests/run", payload),
};

