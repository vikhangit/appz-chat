import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

export const authSlice = createSlice({
  name: 'AUTH',
  initialState: {
    isInit: false,
    isLoggedIn: false
  },
  reducers: {
    initIMKitSDK: (state, action: PayloadAction<any>) => {
      state.isInit = action.payload;
    },
    login: (state, action: PayloadAction<any>) => {
      state.isLoggedIn = true;
    },
    logout: (state, action: PayloadAction<any>) => {
      state.isLoggedIn = false;
    }
  }
});

export const { initIMKitSDK, login, logout } = authSlice.actions;

export const selectIsLoggedIn = (state: RootState) => ({
  isInit: state.isInit,
  isLoggedIn: state.isLoggedIn
});

export default authSlice.reducer;
