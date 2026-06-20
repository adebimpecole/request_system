import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toggleRequestModal: false,
  toggleInviteModal: false,
  toggleDropdown: false,
  toggleNotification: false,
  toggleAlert: false
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
    setToogleDropdown: (state, action) => {
      state.toggleDropdown = action.payload;
    },
    setToogleNotification: (state, action) => {
      state.toggleNotification = action.payload;
    },
    setToogleAlert: (state, action) => {
      state.toggleAlert = action.payload;
    },
  },
});

export const {
  setToogleRequestModal,
  setToogleInviteModal,
  setToogleDropdown,
  setToogleNotification,
  setToogleAlert,
} = modalSlice.actions;

export const modalReducer = modalSlice.reducer;
