import { io } from 'socket.io-client';
import config from '../config';

let socket = null;

/**
 * Initialize socket connection
 */
export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(config.SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

/**
 * Join a poll room for real-time updates
 */
export const joinPollRoom = (pollId) => {
  const currentSocket = getSocket();
  currentSocket.emit('joinPoll', pollId);
};

/**
 * Leave a poll room
 */
export const leavePollRoom = (pollId) => {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.emit('leavePoll', pollId);
  }
};

/**
 * Listen for vote updates
 */
export const onVoteUpdate = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('voteUpdate', callback);
};

/**
 * Remove vote update listener
 */
export const offVoteUpdate = (callback) => {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.off('voteUpdate', callback);
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
