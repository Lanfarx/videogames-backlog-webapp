import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity } from '../../types/activity';

interface ActivitiesState {
  activities: Activity[];
}

const initialState: ActivitiesState = {
  activities: [],
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivities(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload;
    },
    addActivity(state, action: PayloadAction<Activity>) {
      state.activities.push(action.payload);
    },
    updateActivity(state, action: PayloadAction<Activity>) {
      const idx = state.activities.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) {
        state.activities[idx] = action.payload;
      }
    },
    deleteActivity(state, action: PayloadAction<number | string>) {
      state.activities = state.activities.filter(a => a.id !== action.payload);
    },
    clearActivities(state) {
      state.activities = [];
    },
  },
});

export const {
  setActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  clearActivities,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
