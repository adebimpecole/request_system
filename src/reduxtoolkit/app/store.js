// store.js
import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "../features/modal/modalSlice";
import { alertReducer } from "../features/alert/alertSlice";

const store = configureStore({
  reducer: {
    modal: modalReducer,
    alert: alertReducer,
  },
});

export default store;
