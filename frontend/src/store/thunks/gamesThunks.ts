import { createAsyncThunk } from '@reduxjs/toolkit';
import * as gamesService from '../services/gamesService';
import { Game, GameInput, GameUpdateInput, GameComment } from '../../types/game';

export const fetchGames = createAsyncThunk('games/fetchAll', async () => {
  return await gamesService.getAllGames();
});

export const fetchGameById = createAsyncThunk('games/fetchById', async (id: number) => {
  return await gamesService.getGameById(id);
});

export const fetchGameByTitle = createAsyncThunk('games/fetchByTitle', async (title: string) => {
  return await gamesService.getGameByTitle(title);
});

export const addGame = createAsyncThunk('games/add', async (game: GameInput) => {
  return await gamesService.createGame(game);
});

export const updateGameThunk = createAsyncThunk('games/update', async ({ id, data }: { id: number, data: GameUpdateInput }) => {
  return await gamesService.updateGame(id, data);
});

export const updateGameStatusThunk = createAsyncThunk('games/updateStatus', async ({ id, status }: { id: number, status: string }) => {
  return await gamesService.updateGameStatus(id, status);
});

export const updateGamePlaytimeThunk = createAsyncThunk('games/updatePlaytime', async ({ id, hoursPlayed }: { id: number, hoursPlayed: number }) => {
  return await gamesService.updateGamePlaytime(id, hoursPlayed);
});

export const deleteGameThunk = createAsyncThunk('games/delete', async (id: number) => {
  await gamesService.deleteGame(id);
  return id;
});

export const deleteAllGamesThunk = createAsyncThunk('games/deleteAll', async () => {
  return await gamesService.deleteAllGames();
});

// Commenti
export const fetchComments = createAsyncThunk('games/fetchComments', async (GameId: number) => {
  return { GameId, Comments: await gamesService.getComments(GameId) };
});

export const addCommentThunk = createAsyncThunk('games/addComment', async ({ GameId, comment }: { GameId: number, comment: GameComment }) => {
  return { GameId, comment: await gamesService.addComment(GameId, comment) };
});

export const deleteCommentThunk = createAsyncThunk('games/deleteComment', async ({ GameId, commentId }: { GameId: number, commentId: number }) => {
  await gamesService.deleteComment(GameId, commentId);
  return { GameId, commentId };
});

export const updateCommentThunk = createAsyncThunk('games/updateComment', async ({ GameId, commentId, comment }: { GameId: number, commentId: number, comment: GameComment }) => {
  return { GameId, comment: await gamesService.updateComment(GameId, commentId, comment) };
});

// Statistiche
export const fetchGameStats = createAsyncThunk('games/fetchStats', async () => {
  return await gamesService.getGameStats();
});
