import { createAsyncThunk } from '@reduxjs/toolkit';
import * as activityService from '../services/activityService';
import { Activity, ActivityFilters } from '../../types/activity';

// Fetch attività con filtri e paginazione
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params: {
    filters?: ActivityFilters;
    page?: number;
    pageSize?: number;
  } = {}) => {
    const { filters = {}, page = 1, pageSize = 100 } = params;
    return await activityService.getActivities(filters, page, pageSize);
  }
);

// Fetch singola attività
export const fetchActivityById = createAsyncThunk(
  'activities/fetchById',
  async (id: number) => {
    return await activityService.getActivityById(id);
  }
);

// Crea nuova attività
export const createActivity = createAsyncThunk(
  'activities/create',
  async (activity: activityService.CreateActivityDto) => {
    return await activityService.createActivity(activity);
  }
);

// Aggiorna attività esistente
export const updateActivity = createAsyncThunk(
  'activities/update',
  async ({ id, data }: { id: number; data: activityService.UpdateActivityDto }) => {
    return await activityService.updateActivity(id, data);
  }
);

// Elimina attività
export const deleteActivity = createAsyncThunk(
  'activities/delete',
  async (id: number) => {
    await activityService.deleteActivity(id);
    return id;
  }
);

// Fetch attività recenti
export const fetchRecentActivities = createAsyncThunk(
  'activities/fetchRecent',
  async (count: number = 5) => {
    return await activityService.getRecentActivities(count);
  }
);

// Fetch attività per gioco
export const fetchActivitiesByGame = createAsyncThunk(
  'activities/fetchByGame',
  async (GameId: number) => {
    return await activityService.getActivitiesByGame(GameId);
  }
);

// Fetch statistiche attività
export const fetchActivityStats = createAsyncThunk(
  'activities/fetchStats',
  async (year?: number) => {
    return await activityService.getActivityStats(year);
  }
);
