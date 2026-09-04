import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // { id, type: "success"|"error"|"info", message }
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    pushAlert: {
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
      prepare: ({ type = "info", message }) => ({
        payload: { id: Date.now() + Math.random(), type, message },
      }),
    },
    dismissAlert: (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const { pushAlert, dismissAlert } = alertSlice.actions;
export const alertReducer = alertSlice.reducer;
