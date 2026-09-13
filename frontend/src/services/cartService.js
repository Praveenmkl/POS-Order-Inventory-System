import API from "./api";

export const cartService = {
  getCart: () => API.get("/cart"),
  addToCart: (productId, quantity = 1) => API.post("/cart", { productId, quantity }),
  updateCartItem: (productId, quantity) => API.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => API.delete(`/cart/${productId}`),
};

export default cartService;
