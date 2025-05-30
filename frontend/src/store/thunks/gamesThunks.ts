import { createAsyncThunk } from '@reduxjs/toolkit';
import * as gamesService from '../services/gamesService';
import { Game, GameInput, GameUpdateInput, GameComment } from '../../types/game';

export const fetchGames = createAsyncThunk('games/fetchAll', async () => {
  return await gamesService.getAllGames();
});

export const addGame = createAsyncThunk('games/add', async (game: GameInput) => {
  return await gamesService.createGame(game);
});

export const updateGameThunk = createAsyncThunk('games/update', async ({ id, data }: { id: number, data: GameUpdateInput }) => {
  return await gamesService.updateGame(id, data);
});

export const deleteGameThunk = createAsyncThunk('games/delete', async (id: number) => {
  await gamesService.deleteGame(id);
  return id;
});

// Commenti
export const fetchComments = createAsyncThunk('games/fetchComments', async (gameId: number) => {
  return { gameId, Comments: await gamesService.getComments(gameId) };
});

export const addCommentThunk = createAsyncThunk('games/addComment', async ({ gameId, comment }: { gameId: number, comment: GameComment }) => {
  return { gameId, comment: await gamesService.addComment(gameId, comment) };
});

export const deleteCommentThunk = createAsyncThunk('games/deleteComment', async ({ gameId, commentId }: { gameId: number, commentId: number }) => {
  await gamesService.deleteComment(gameId, commentId);
  return { gameId, commentId };
});
