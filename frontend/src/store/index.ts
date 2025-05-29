import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slice/userSlice';
import gamesReducer from './slice/gamesSlice';
import activitiesReducer from './slice/activitiesSlice';
import communityReducer from './slice/communitySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    games: gamesReducer,
    activities: activitiesReducer,
    community: communityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
