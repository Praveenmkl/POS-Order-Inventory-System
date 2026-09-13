import API from "./api";

export const paymentService = {
  makePayment: (data) => API.post("/payments", data),
};

export default paymentService;
