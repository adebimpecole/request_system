import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: "Home",
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { setPage } = pageSlice.actions;

export const pageReducer = pageSlice.reducer;
