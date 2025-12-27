// Socket configuration constants
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
export const SOCKET_NAMESPACE = '/game';

export const SOCKET_EVENTS = {
  // Client -> Server
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  PLAYER_READY: 'playerReady',
  START_GAME: 'startGame',
  GAME_ACTION: 'gameAction',
  UPDATE_GAME_STATE: 'updateGameState',
  END_GAME: 'endGame',
  RESET_ROOM: 'resetRoom',
  CHAT_MESSAGE: 'chatMessage',
  GET_ROOM_INFO: 'getRoomInfo',
  KICK_PLAYER: 'kickPlayer',

  // Server -> Client
  CONNECTED: 'connected',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_READY_CHANGED: 'playerReadyChanged',
  GAME_STARTED: 'gameStarted',
  GAME_ACTION_RECEIVED: 'gameActionReceived',
  GAME_STATE_UPDATED: 'gameStateUpdated',
  GAME_ENDED: 'gameEnded',
  ROOM_RESET: 'roomReset',
  CHAT_MESSAGE_RECEIVED: 'chatMessageReceived',
  KICKED: 'kicked',
  PLAYER_KICKED: 'playerKicked',
} as const;
