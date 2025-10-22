import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // each item: { id, name, price, quantity, img? }
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add a new action to set cart from DB
    setCart: (state, action) => {
      state.items = action.payload;
      state.totalQuantity = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = action.payload.reduce((sum, item) => sum + item.quantity * item.price, 0);
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.totalQuantity += 1;
      state.totalPrice += item.price;
    },
    increaseQuantity: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((i) => i.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
        state.totalQuantity += 1;
        state.totalPrice += existingItem.price;
      }
    },
    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((i) => i.id === id);
      if (existingItem) {
        existingItem.quantity -= 1;
        state.totalQuantity -= 1;
        state.totalPrice -= existingItem.price;

        if (existingItem.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((i) => i.id === id);
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((i) => i.id !== id);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  setCart,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
