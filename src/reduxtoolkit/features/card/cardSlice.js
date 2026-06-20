import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggleRequestCard: false,
};

const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {
    setToogleRequestCard: (state, action) => {
      state.toggleRequestCard = action.payload;
    },
  },
});

export const { setToogleRequestCard } = cardSlice.actions;

export const cardReducer = cardSlice.reducer;
