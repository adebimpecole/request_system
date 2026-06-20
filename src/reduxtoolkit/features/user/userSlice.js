import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: null,
  email: null,
  role: null,
  company: null,
  department: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUserDetails } = userSlice.actions;

export const userReducer = userSlice.reducer;
