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

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup event listeners - use getState() to avoid stale closures
  const setupEventListeners = useCallback((socket: Socket) => {
    console.log('Setting up event listeners, socket connected:', socket.connected);
    
    // Remove all listeners and re-add them fresh
    socket.removeAllListeners();
    
    socket.on('connect', () => {
      console.log('Socket reconnected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    // Use onAny to handle all events since specific listeners aren't working
    socket.onAny((eventName: string, data: unknown) => {
      console.log('📨 Received event:', eventName, data);
      
      const store = useGameStore.getState();
      
      switch (eventName) {
        case SOCKET_EVENTS.CONNECTED:
          store.setPlayerId((data as { id: string }).id);
          break;
          
        case SOCKET_EVENTS.PLAYER_JOINED:
          console.log('Processing PLAYER_JOINED:', data);
          store.setRoom((data as PlayerJoinedEvent).room);
          break;
          
        case SOCKET_EVENTS.PLAYER_LEFT:
          store.setRoom((data as PlayerLeftEvent).room);
          break;
          
        case SOCKET_EVENTS.PLAYER_READY_CHANGED:
          store.setRoom((data as PlayerReadyChangedEvent).room);
          break;
          
        case SOCKET_EVENTS.GAME_STARTED:
          store.setRoom((data as GameStartedEvent).room);
          store.setGamePhase('playing');
          break;
          
        case SOCKET_EVENTS.GAME_ACTION_RECEIVED:
          store.handleGameAction(data as GameActionReceivedEvent);
          break;
          
        case SOCKET_EVENTS.GAME_STATE_UPDATED:
          store.setGameState((data as GameStateUpdatedEvent).gameState);
          break;
          
        case SOCKET_EVENTS.GAME_ENDED:
          store.setRoom((data as GameEndedEvent).room);
          store.setGamePhase('finished');
          break;
          
        case SOCKET_EVENTS.ROOM_RESET:
          store.setRoom((data as { room: RoomInfo }).room);
          store.setGamePhase('lobby');
          break;
          
        case SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED: {
          const chatData = data as ChatMessageReceivedEvent;
          store.addChatMessage({
            playerId: chatData.playerId,
            username: chatData.username,
            message: chatData.message,
            timestamp: chatData.timestamp,
          });
          break;
        }
          
        case SOCKET_EVENTS.KICKED:
          store.reset();
          setError((data as KickedEvent).message);
          break;
          
        case SOCKET_EVENTS.PLAYER_KICKED:
          store.setRoom((data as PlayerKickedEvent).room);
          break;
      }
    });
    
    console.log('All event listeners set up via onAny');
  }, []);

  // Connect to socket
  const connect = useCallback(async () => {
    console.log('connect() called, isConnecting:', isConnecting, 'isConnected:', isConnected);
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const socket = getSocket();
      console.log('Got socket instance, connected:', socket.connected);
      socketRef.current = socket;
      
      // Connect first
      console.log('Calling connectSocket()...');
      await connectSocket();
      console.log('connectSocket() resolved, socket connected:', socket.connected);
      
      // Setup listeners AFTER connection is established
      setupEventListeners(socket);
      
      setIsConnected(true);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, setupEventListeners]);

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
    console.log('data')
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

  const endGame = useCallback(async (winner?: string, results?: unknown) => {
    try {
      await emit(SOCKET_EVENTS.END_GAME, { winner, results });
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
    try {
      await emit(SOCKET_EVENTS.KICK_PLAYER, { playerId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kick player');
      throw err;
    }
  }, [emit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

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
    clearError: () => setError(null),
  };
};
