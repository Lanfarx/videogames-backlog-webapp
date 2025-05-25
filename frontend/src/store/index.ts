import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slice/gamesSlice';
import activitiesReducer from './slice/activitiesSlice';

const store = configureStore({
  reducer: {
    games: gamesReducer,
    activities: activitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
