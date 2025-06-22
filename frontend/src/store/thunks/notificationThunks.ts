
import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../services/notificationService';
import { 
  setNotifications,
  setUnreadCount,
  setLoading,
  setError,
  markAsRead as markAsReadAction,
  removeNotification as removeNotificationAction,
  clearAllNotifications as clearAllNotificationsAction,
  markAllAsRead as markAllAsReadAction
} from '../slice/notificationSlice';

// Thunk per ottenere tutte le notifiche
export const fetchNotificationsThunk = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const notifications = await notificationService.getNotifications();
      dispatch(setNotifications(notifications));
      return notifications;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nel caricamento delle notifiche';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Thunk per ottenere il conteggio delle notifiche non lette
export const fetchUnreadCountThunk = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      dispatch(setUnreadCount(count));
      return count;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nel caricamento del conteggio';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk per segnare una notifica come letta
export const markNotificationAsReadThunk = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: number, { dispatch, rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsReadAction(notificationId));
      return notificationId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nella marcatura della notifica';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk per segnare tutte le notifiche come lette
export const markAllNotificationsAsReadThunk = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      dispatch(markAllAsReadAction());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nella marcatura delle notifiche';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk per eliminare una notifica
export const deleteNotificationThunk = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: number, { dispatch, rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch(removeNotificationAction(notificationId));
      return notificationId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nell\'eliminazione della notifica';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk per eliminare tutte le notifiche
export const deleteAllNotificationsThunk = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await notificationService.deleteAllNotifications();
      dispatch(clearAllNotificationsAction());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Errore nell\'eliminazione delle notifiche';
      return rejectWithValue(errorMessage);
    }
  }
);
