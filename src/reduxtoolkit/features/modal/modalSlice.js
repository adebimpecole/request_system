import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggleRequestModal: false,
  toggleInviteModal: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setToogleRequestModal: (state, action) => {
      state.toggleRequestModal = action.payload;
    },
    setToogleInviteModal: (state, action) => {
      state.toggleInviteModal = action.payload;
    },
  },
});

export const {
  setToogleRequestModal,
  setToogleInviteModal,
} = modalSlice.actions;

export const modalReducer = modalSlice.reducer;
