import API from "./api";

export const orderService = {
  checkout: (data) => API.post("/orders/checkout", data),
  getMyOrders: (params = {}) => API.get("/orders/my-orders", { params }),
  getAll: (params = {}) => API.get("/orders", { params }),
  getById: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, status) => API.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => API.patch(`/orders/${id}/cancel`),
  refund: (id) => API.post(`/orders/${id}/refund`),
};

export default orderService;
