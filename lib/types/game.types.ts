// Room and Player Types (matching backend DTOs)
export interface PlayerInfo {
  id: string;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

export interface RoomInfo {
  id: string;
  code: string;
  name: string;
  hostId: string;
  players: PlayerInfo[];
  maxPlayers: number;
  status: RoomStatus;
}

export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

// Stop Game Specific Types
export interface StopGameState {
  currentLetter: string;
  currentRound: number;
  totalRounds: number;
  categories: string[];
  roundStartTime: number;
  roundEndTime?: number;
  playerAnswers: Record<string, PlayerAnswers>;
  scores: Record<string, number>;
  phase: GamePhase;
  stoppedBy?: string;
}

export enum GamePhase {
  IDLE = 'idle',
  ROUND_ACTIVE = 'round_active',
  STOPPED = 'stopped',
  VOTING = 'voting',
  RESULTS = 'results',
  GAME_OVER = 'game_over',
}

export interface PlayerAnswers {
  playerId: string;
  answers: Record<string, string>; // category -> answer
  submittedAt?: number;
}

export interface RoundResult {
  letter: string;
  round: number;
  categoryResults: CategoryResult[];
  playerScores: Record<string, number>;
}

export interface CategoryResult {
  category: string;
  answers: CategoryAnswer[];
}

export interface CategoryAnswer {
  playerId: string;
  username: string;
  answer: string;
  isValid: boolean;
  isUnique: boolean;
  points: number;
}

// Socket Event Payloads
export interface CreateRoomPayload {
  roomName: string;
  maxPlayers: number;
  username: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  username: string;
}

export interface PlayerReadyPayload {
  roomCode: string;
  isReady: boolean;
}

export interface GameActionPayload {
  roomCode: string;
  action: string;
  payload?: unknown;
}

export interface ChatMessagePayload {
  roomCode: string;
  message: string;
}

// Socket Response Types
export interface SocketResponse<T = unknown> {
  success: boolean;
  error?: string;
  room?: RoomInfo;
  data?: T;
}

export interface PlayerJoinedEvent {
  player: PlayerInfo;
  room: RoomInfo;
}

export interface PlayerLeftEvent {
  playerId: string;
  room: RoomInfo;
  newHostId?: string;
}

export interface PlayerReadyChangedEvent {
  playerId: string;
  isReady: boolean;
  room: RoomInfo;
}

export interface GameStartedEvent {
  room: RoomInfo;
}

export interface GameActionReceivedEvent {
  playerId: string;
  action: string;
  payload: unknown;
  timestamp: number;
}

export interface GameStateUpdatedEvent {
  gameState: StopGameState;
  timestamp: number;
}

export interface GameEndedEvent {
  room: RoomInfo;
  winner?: string;
  results?: unknown;
}

export interface ChatMessageReceivedEvent {
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface KickedEvent {
  message: string;
}

export interface PlayerKickedEvent {
  playerId: string;
  room: RoomInfo;
}

// Stop Game Actions
export enum StopGameAction {
  SET_CATEGORIES = 'SET_CATEGORIES',
  START_ROUND = 'START_ROUND',
  SUBMIT_ANSWERS = 'SUBMIT_ANSWERS',
  STOP = 'STOP',
  VOTE_ANSWER = 'VOTE_ANSWER',
  NEXT_ROUND = 'NEXT_ROUND',
}

export interface StopActionPayload {
  type: StopGameAction;
  data?: unknown;
}

export interface SetCategoriesData {
  categories: string[];
  totalRounds: number;
}

export interface SubmitAnswersData {
  answers: Record<string, string>;
}

export interface VoteAnswerData {
  playerId: string;
  category: string;
  isValid: boolean;
}

// Default categories for Stop game
export const DEFAULT_CATEGORIES = [
  'Name',
  'Animal',
  'Country/City',
  'Food',
  'Object',
  'Color',
  'Movie/Series',
  'Profession',
];

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
