import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '../../types/profile';

interface UserState {
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileLoadError: string | null;
}

const initialState: UserState = {
  profile: null,
  isProfileLoading: false,
  profileLoadError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfileLoading(state, action: PayloadAction<boolean>) {
      state.isProfileLoading = action.payload;
      if (action.payload) {
        state.profileLoadError = null;
      }
    },
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.isProfileLoading = false;
      state.profileLoadError = null;
    },
    setProfileLoadError(state, action: PayloadAction<string>) {
      state.profileLoadError = action.payload;
      state.isProfileLoading = false;
    },
    clearUserProfile(state) {
      state.profile = null;
      state.isProfileLoading = false;
      state.profileLoadError = null;
    },
  },
});

export const { setProfileLoading, setUserProfile, setProfileLoadError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;