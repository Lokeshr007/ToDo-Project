import API from "./api";

export const getTasks = (boardId) =>
  API.get(`/todo?boardId=${boardId}`);

export const createTask = (boardId, title) =>
  API.post(`/todo`, { boardId, title });

export const toggleTask = (id) =>
  API.put(`/todo/status/${id}`);

export const deleteTask = (id) =>
  API.delete(`/todo/${id}`);