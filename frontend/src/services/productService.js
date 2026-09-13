import API from "./api";

export const productService = {
  getAll: (params = {}) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

export default productService;
