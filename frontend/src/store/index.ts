import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slice/gamesSlice';

const store = configureStore({
  reducer: {
    games: gamesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
