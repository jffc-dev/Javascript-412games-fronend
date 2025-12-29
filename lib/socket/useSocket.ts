'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from './socket';
import { SOCKET_EVENTS } from './constants';
import { useGameStore } from '@/lib/store/game.store';
import {
  CreateRoomPayload,
  JoinRoomPayload,
  GameActionPayload,
  SocketResponse,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  PlayerReadyChangedEvent,
  GameStartedEvent,
  GameActionReceivedEvent,
  GameStateUpdatedEvent,
  GameEndedEvent,
  ChatMessageReceivedEvent,
  KickedEvent,
  PlayerKickedEvent,
  RoomInfo,
} from '@/lib/types';

// Track if game listeners are setup on the singleton
let gameListenersSetup = false;

// Setup game event listeners on socket singleton (only once globally)
function setupGameListeners(socket: Socket) {
  if (gameListenersSetup) {
    console.log('[Socket] Game listeners already setup');
    return;
  }
  gameListenersSetup = true;
  
  console.log('[Socket] Setting up game event listeners');

  // Debug: log ALL events to see what's coming in
  socket.onAny((eventName, ...args) => {
    console.log(`[Socket DEBUG] Event received: "${eventName}"`, args);
  });

  socket.on(SOCKET_EVENTS.CONNECTED, (data: { id: string }) => {
    console.log('[Socket] CONNECTED event:', data.id);
    useGameStore.getState().setPlayerId(data.id);
  });

  socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data: PlayerJoinedEvent) => {
    console.log('[Socket] PLAYER_JOINED event:', data);
    useGameStore.getState().setRoom(data.room);
  });

  socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data: PlayerLeftEvent) => {
    console.log('[Socket] PLAYER_LEFT event:', data);
    useGameStore.getState().setRoom(data.room);
  });

  socket.on(SOCKET_EVENTS.PLAYER_READY_CHANGED, (data: PlayerReadyChangedEvent) => {
    console.log('[Socket] PLAYER_READY_CHANGED event:', data);
    useGameStore.getState().setRoom(data.room);
  });

  socket.on(SOCKET_EVENTS.GAME_STARTED, (data: GameStartedEvent) => {
    console.log('[Socket] GAME_STARTED event:', data);
    useGameStore.getState().setRoom(data.room);
    useGameStore.getState().setGamePhase('playing');
  });

  socket.on(SOCKET_EVENTS.GAME_ACTION_RECEIVED, (data: GameActionReceivedEvent) => {
    console.log('[Socket] GAME_ACTION_RECEIVED event:', data);
    useGameStore.getState().handleGameAction(data);
  });

  socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, (data: GameStateUpdatedEvent) => {
    console.log('[Socket] GAME_STATE_UPDATED event:', data);
    useGameStore.getState().setGameState(data.gameState);
  });

  socket.on(SOCKET_EVENTS.GAME_ENDED, (data: GameEndedEvent) => {
    console.log('[Socket] GAME_ENDED event:', data);
    useGameStore.getState().setRoom(data.room);
    useGameStore.getState().setGamePhase('finished');
  });

  socket.on(SOCKET_EVENTS.ROOM_RESET, (data: { room: RoomInfo }) => {
    console.log('[Socket] ROOM_RESET event:', data);
    useGameStore.getState().setRoom(data.room);
    useGameStore.getState().setGamePhase('lobby');
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, (data: ChatMessageReceivedEvent) => {
    console.log('[Socket] CHAT_MESSAGE_RECEIVED event:', data);
    useGameStore.getState().addChatMessage({
      playerId: data.playerId,
      username: data.username,
      message: data.message,
      timestamp: data.timestamp,
    });
  });

  socket.on(SOCKET_EVENTS.KICKED, (data: KickedEvent) => {
    console.log('[Socket] KICKED event:', data);
    useGameStore.getState().reset();
  });

  socket.on(SOCKET_EVENTS.PLAYER_KICKED, (data: PlayerKickedEvent) => {
    console.log('[Socket] PLAYER_KICKED event:', data);
    useGameStore.getState().setRoom(data.room);
  });

  console.log('[Socket] All game event listeners setup complete');
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup component-specific connection state listeners
  useEffect(() => {
    const socket = getSocket();
    
    // Initialize state from current socket status
    setIsConnected(socket.connected);
    
    const onConnect = () => {
      console.log('[useSocket] Component: socket connected');
      setIsConnected(true);
      setError(null);
    };
    
    const onDisconnect = () => {
      console.log('[useSocket] Component: socket disconnected');
      setIsConnected(false);
    };
    
    const onConnectError = (err: Error) => {
      console.error('[useSocket] Component: socket connect error:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  // Connect to socket
  const connect = useCallback(async () => {
    if (isConnecting) {
      console.log('[useSocket] Already connecting...');
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;
    
    // Setup game listeners (idempotent - only runs once)
    setupGameListeners(socket);
    
    // If already connected, just update state
    if (socket.connected) {
      console.log('[useSocket] Socket already connected');
      setIsConnected(true);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('[useSocket] Connecting...');
      await connectSocket();
      console.log('[useSocket] Connected successfully');
      setIsConnected(true);
    } catch (err) {
      console.error('[useSocket] Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    disconnectSocket();
    socketRef.current = null;
    setIsConnected(false);
    useGameStore.getState().reset();
  }, []);

  // Emit with acknowledgment helper
  const emit = useCallback(<T = unknown>(
    event: string,
    data?: unknown
  ): Promise<SocketResponse<T>> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit(event, data, (response: SocketResponse<T>) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
    });
  }, []);

  // Room actions
  const createRoom = useCallback(async (payload: CreateRoomPayload) => {
    try {
      const response = await emit<{ room: RoomInfo }>(SOCKET_EVENTS.CREATE_ROOM, payload);
      if (response.room) {
        useGameStore.getState().setRoom(response.room);
        useGameStore.getState().setGamePhase('lobby');
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      throw err;
    }
  }, [emit]);

  const joinRoom = useCallback(async (payload: JoinRoomPayload) => {
    try {
      const response = await emit<{ room: RoomInfo }>(SOCKET_EVENTS.JOIN_ROOM, payload);
      if (response.room) {
        useGameStore.getState().setRoom(response.room);
        useGameStore.getState().setGamePhase('lobby');
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      throw err;
    }
  }, [emit]);

  const leaveRoom = useCallback(async () => {
    try {
      await emit(SOCKET_EVENTS.LEAVE_ROOM);
      useGameStore.getState().reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room');
      throw err;
    }
  }, [emit]);

  const setReady = useCallback(async (isReady: boolean) => {
    const room = useGameStore.getState().room;
    if (!room) return;

    try {
      await emit(SOCKET_EVENTS.PLAYER_READY, { roomCode: room.code, isReady });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ready status');
      throw err;
    }
  }, [emit]);

  const startGame = useCallback(async () => {
    try {
      await emit(SOCKET_EVENTS.START_GAME);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      throw err;
    }
  }, [emit]);

  const sendGameAction = useCallback(async (action: string, payload?: unknown) => {
    const room = useGameStore.getState().room;
    if (!room) return;

    try {
      await emit(SOCKET_EVENTS.GAME_ACTION, {
        roomCode: room.code,
        action,
        payload,
      } as GameActionPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send game action');
      throw err;
    }
  }, [emit]);

  const updateGameState = useCallback(async (gameState: unknown) => {
    try {
      await emit(SOCKET_EVENTS.UPDATE_GAME_STATE, { gameState });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game state');
      throw err;
    }
  }, [emit]);

  const endGame = useCallback(async () => {
    try {
      await emit(SOCKET_EVENTS.END_GAME);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game');
      throw err;
    }
  }, [emit]);

  const resetRoom = useCallback(async () => {
    try {
      await emit(SOCKET_EVENTS.RESET_ROOM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset room');
      throw err;
    }
  }, [emit]);

  const sendChatMessage = useCallback(async (message: string) => {
    const room = useGameStore.getState().room;
    if (!room) return;

    try {
      await emit(SOCKET_EVENTS.CHAT_MESSAGE, { roomCode: room.code, message });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [emit]);

  const kickPlayer = useCallback(async (playerId: string) => {
    const room = useGameStore.getState().room;
    if (!room) return;

    try {
      await emit(SOCKET_EVENTS.KICK_PLAYER, { roomCode: room.code, playerId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kick player');
      throw err;
    }
  }, [emit]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    sendGameAction,
    updateGameState,
    endGame,
    resetRoom,
    sendChatMessage,
    kickPlayer,
  };
};
