import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PrivacyOptions {
  showDiary: boolean;
}

interface SettingsState {
  isProfilePublic: boolean;
  privacyOptions: PrivacyOptions;
  // Qui puoi aggiungere altre opzioni globali in futuro
}

const initialState: SettingsState = {
  isProfilePublic: true,
  privacyOptions: {
    showDiary: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setProfilePublic(state, action: PayloadAction<boolean>) {
      state.isProfilePublic = action.payload;
    },
    setPrivacyOptions(state, action: PayloadAction<PrivacyOptions>) {
      state.privacyOptions = action.payload;
    },
    // Qui puoi aggiungere altri reducers per nuove opzioni
  },
});

export const { setProfilePublic, setPrivacyOptions } = settingsSlice.actions;
export default settingsSlice.reducer;

// Selectors
export const selectIsProfilePrivate = (state: { settings: SettingsState }) => !state.settings.isProfilePublic;
export const selectIsDiaryPrivate = (state: { settings: SettingsState }) => !state.settings.privacyOptions.showDiary;
// Selettore per forzare la privacy delle recensioni a privata se diario privato
export const selectForcePrivate = (state: { settings: SettingsState }) => !state.settings.privacyOptions.showDiary;
