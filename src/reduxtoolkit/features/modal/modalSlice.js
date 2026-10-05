import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggleInviteModal: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setToogleInviteModal: (state, action) => {
      state.toggleInviteModal = action.payload;
    },
  },
});

export const {
  setToogleInviteModal,
} = modalSlice.actions;

export const modalReducer = modalSlice.reducer;
