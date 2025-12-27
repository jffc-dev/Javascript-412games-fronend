import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  RoomInfo,
  PlayerInfo,
  StopGameState,
  GamePhase,
  GameActionReceivedEvent,
  StopGameAction,
  ALPHABET,
  DEFAULT_CATEGORIES,
} from '@/lib/types';

export interface ChatMessage {
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
}

type GameUIPhase = 'home' | 'lobby' | 'playing' | 'finished';

interface GameState {
  // Connection state
  playerId: string | null;
  
  // Room state
  room: RoomInfo | null;
  
  // Game state
  gamePhase: GameUIPhase;
  stopGameState: StopGameState | null;
  
  // Local game state
  currentAnswers: Record<string, string>;
  hasSubmitted: boolean;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // Actions
  setPlayerId: (id: string) => void;
  setRoom: (room: RoomInfo | null) => void;
  addPlayer: (player: PlayerInfo) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerInfo>) => void;
  setGamePhase: (phase: GameUIPhase) => void;
  setGameState: (state: unknown) => void;
  addChatMessage: (message: ChatMessage) => void;
  handleGameAction: (action: GameActionReceivedEvent) => void;
  
  // Local game actions
  setAnswer: (category: string, answer: string) => void;
  submitAnswers: () => void;
  resetAnswers: () => void;
  
  // Stop game specific
  initStopGame: (categories: string[], totalRounds: number) => StopGameState;
  startNewRound: () => StopGameState | null;
  stopRound: (stoppedBy: string) => void;
  
  // Reset
  reset: () => void;
}

const initialStopGameState: StopGameState = {
  currentLetter: '',
  currentRound: 0,
  totalRounds: 5,
  categories: DEFAULT_CATEGORIES.slice(0, 5),
  roundStartTime: 0,
  playerAnswers: new Map(),
  scores: new Map(),
  phase: GamePhase.IDLE,
};

const getRandomLetter = (usedLetters: string[] = []): string => {
  const availableLetters = ALPHABET.split('').filter(l => !usedLetters.includes(l));
  if (availableLetters.length === 0) return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return availableLetters[Math.floor(Math.random() * availableLetters.length)];
};

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      playerId: null,
      room: null,
      gamePhase: 'home',
      stopGameState: null,
      currentAnswers: {},
      hasSubmitted: false,
      chatMessages: [],

      // Actions
      setPlayerId: (id) => set({ playerId: id }),

      setRoom: (room) => {
        console.log('🏠 setRoom called with:', room);
        set({ room });
      },

      addPlayer: (player) =>
        set((state) => {
          if (!state.room) return state;
          const playerExists = state.room.players.some(p => p.id === player.id);
          if (playerExists) return state;
          return {
            room: {
              ...state.room,
              players: [...state.room.players, player],
            },
          };
        }),

      removePlayer: (playerId) =>
        set((state) => {
          if (!state.room) return state;
          return {
            room: {
              ...state.room,
              players: state.room.players.filter((p) => p.id !== playerId),
            },
          };
        }),

      updatePlayer: (playerId, updates) =>
        set((state) => {
          if (!state.room) return state;
          return {
            room: {
              ...state.room,
              players: state.room.players.map((p) =>
                p.id === playerId ? { ...p, ...updates } : p
              ),
            },
          };
        }),

      setGamePhase: (phase) => set({ gamePhase: phase }),

      setGameState: (state) => {
        // Convert the state to StopGameState if it matches
        if (state && typeof state === 'object') {
          set({ stopGameState: state as StopGameState });
        }
      },

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages.slice(-99), message],
        })),

      handleGameAction: (action: GameActionReceivedEvent) => {
        const { action: actionType, payload } = action;
        
        switch (actionType) {
          case StopGameAction.START_ROUND: {
            const data = payload as { letter: string; roundStartTime: number };
            set((state) => ({
              stopGameState: state.stopGameState
                ? {
                    ...state.stopGameState,
                    currentLetter: data.letter,
                    roundStartTime: data.roundStartTime,
                    phase: GamePhase.ROUND_ACTIVE,
                  }
                : null,
              currentAnswers: {},
              hasSubmitted: false,
            }));
            break;
          }
          
          case StopGameAction.STOP: {
            const data = payload as { stoppedBy: string };
            set((state) => ({
              stopGameState: state.stopGameState
                ? {
                    ...state.stopGameState,
                    phase: GamePhase.STOPPED,
                    stoppedBy: data.stoppedBy,
                    roundEndTime: Date.now(),
                  }
                : null,
            }));
            break;
          }
          
          case StopGameAction.SUBMIT_ANSWERS: {
            const data = payload as { playerId: string; answers: Record<string, string> };
            set((state) => {
              if (!state.stopGameState) return state;
              const newPlayerAnswers = new Map(state.stopGameState.playerAnswers);
              newPlayerAnswers.set(data.playerId, {
                playerId: data.playerId,
                answers: data.answers,
                submittedAt: Date.now(),
              });
              return {
                stopGameState: {
                  ...state.stopGameState,
                  playerAnswers: newPlayerAnswers,
                },
              };
            });
            break;
          }

          case StopGameAction.NEXT_ROUND: {
            const data = payload as { round: number; letter: string };
            set((state) => ({
              stopGameState: state.stopGameState
                ? {
                    ...state.stopGameState,
                    currentRound: data.round,
                    currentLetter: data.letter,
                    roundStartTime: Date.now(),
                    phase: GamePhase.ROUND_ACTIVE,
                    playerAnswers: new Map(),
                    stoppedBy: undefined,
                    roundEndTime: undefined,
                  }
                : null,
              currentAnswers: {},
              hasSubmitted: false,
            }));
            break;
          }
          
          default:
            console.log('Unhandled game action:', actionType);
        }
      },

      // Local game actions
      setAnswer: (category, answer) =>
        set((state) => ({
          currentAnswers: {
            ...state.currentAnswers,
            [category]: answer,
          },
        })),

      submitAnswers: () => set({ hasSubmitted: true }),

      resetAnswers: () => set({ currentAnswers: {}, hasSubmitted: false }),

      // Stop game specific
      initStopGame: (categories, totalRounds) => {
        const initialState: StopGameState = {
          currentLetter: '',
          currentRound: 0,
          totalRounds,
          categories,
          roundStartTime: 0,
          playerAnswers: new Map(),
          scores: new Map(),
          phase: GamePhase.IDLE,
        };
        
        // Initialize scores for all players
        const room = get().room;
        if (room) {
          room.players.forEach(player => {
            initialState.scores.set(player.id, 0);
          });
        }
        
        set({ stopGameState: initialState });
        return initialState;
      },

      startNewRound: () => {
        const state = get();
        if (!state.stopGameState) return null;
        
        const usedLetters: string[] = [];
        const newLetter = getRandomLetter(usedLetters);
        const newRound = state.stopGameState.currentRound + 1;
        
        const updatedState: StopGameState = {
          ...state.stopGameState,
          currentLetter: newLetter,
          currentRound: newRound,
          roundStartTime: Date.now(),
          phase: GamePhase.ROUND_ACTIVE,
          playerAnswers: new Map(),
          stoppedBy: undefined,
          roundEndTime: undefined,
        };
        
        set({
          stopGameState: updatedState,
          currentAnswers: {},
          hasSubmitted: false,
        });
        
        return updatedState;
      },

      stopRound: (stoppedBy) => {
        set((state) => ({
          stopGameState: state.stopGameState
            ? {
                ...state.stopGameState,
                phase: GamePhase.STOPPED,
                stoppedBy,
                roundEndTime: Date.now(),
              }
            : null,
        }));
      },

      reset: () =>
        set({
          room: null,
          gamePhase: 'home',
          stopGameState: null,
          currentAnswers: {},
          hasSubmitted: false,
          chatMessages: [],
        }),
    }),
    { name: 'game-store' }
  )
);

// Selectors
export const selectIsHost = (state: GameState) =>
  state.room?.hostId === state.playerId;

export const selectCurrentPlayer = (state: GameState) =>
  state.room?.players.find((p) => p.id === state.playerId);

export const selectAllPlayersReady = (state: GameState) => {
  if (!state.room || state.room.players.length < 2) return false;
  return state.room.players
    .filter((p) => !p.isHost)
    .every((p) => p.isReady);
};

export const selectCanStartGame = (state: GameState) => {
  const isHost = selectIsHost(state);
  const allReady = selectAllPlayersReady(state);
  return isHost && allReady && (state.room?.players.length ?? 0) >= 2;
};
