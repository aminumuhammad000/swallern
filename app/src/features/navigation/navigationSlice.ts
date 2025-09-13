// src/features/navigation/navigationSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthPage =
  | "welcome"
  | "purpose"
  | "interest"
  | "experience"
  | "register"
  | "forget"
  | "login"
  | "otp";

interface NavigationState {
  currentPage: AuthPage;
}

const initialState: NavigationState = {
  currentPage: "welcome", // default entry point
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    goToPage(state, action: PayloadAction<AuthPage>) {
      state.currentPage = action.payload;
    },
    resetNavigation(state) {
      state.currentPage = "welcome";
    },
  },
});

export const { goToPage, resetNavigation } = navigationSlice.actions;

export default navigationSlice.reducer;
