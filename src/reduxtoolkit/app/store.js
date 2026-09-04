// store.js
import { configureStore } from "@reduxjs/toolkit";
import { modalReducer } from "../features/modal/modalSlice";
import { userReducer } from "../features/user/userSlice";
import { pageReducer } from "../features/page/pageSlice";
import { cardReducer } from "../features/card/cardSlice";
import { alertReducer } from "../features/alert/alertSlice";

const store = configureStore({
  reducer: {
    modal: modalReducer,
    user: userReducer,
    page: pageReducer,
    card: cardReducer,
    alert: alertReducer,
  },
});

export default store;


// cardSlice.js
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

export const cardReducer1 = cardSlice.reducer;

