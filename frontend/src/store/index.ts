import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slice/gamesSlice';
import activitiesReducer from './slice/activitiesSlice';
import communityReducer from './slice/communitySlice';
import settingsReducer from './slice/settingsSlice';

const store = configureStore({
  reducer: {
    games: gamesReducer,
    activities: activitiesReducer,
    community: communityReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
