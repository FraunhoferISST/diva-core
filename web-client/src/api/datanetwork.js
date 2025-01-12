import http from "@/api/http";
const axios = http.axios;

export default {
  getEdges: (query = {}) => axios.get("/edges", { params: query }),
  createEdge: (data) => axios.post("/edges", data),
  deleteEdgeById: (id) => axios.delete(`/edges/${id}`),
};
