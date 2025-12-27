'use client';

import { useCallback } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { PlayerList, ChatBox, GameSettings } from '@/components/game';
import { useSocket } from '@/lib/socket';
import { useGameStore, selectIsHost, selectCanStartGame, selectCurrentPlayer } from '@/lib/store';
import { RoomStatus, StopGameAction } from '@/lib/types';

interface LobbyViewProps {
  onGameStart: () => void;
  onLeave: () => void;
}

export const LobbyView = ({ onGameStart, onLeave }: LobbyViewProps) => {
  const room = useGameStore((state) => state.room);
  const isHost = useGameStore(selectIsHost);
  const canStartGame = useGameStore(selectCanStartGame);
  const currentPlayer = useGameStore(selectCurrentPlayer);

  const { setReady, startGame, kickPlayer, leaveRoom, sendGameAction, updateGameState } = useSocket();
  const initStopGame = useGameStore((state) => state.initStopGame);

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    await setReady(!currentPlayer.isReady);
  };

  const handleStartGame = useCallback(async (categories: string[], totalRounds: number) => {
    try {
      // Initialize game state
      const gameState = initStopGame(categories, totalRounds);
      await updateGameState(gameState);
      await startGame();
      onGameStart();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, [initStopGame, updateGameState, startGame, onGameStart]);

  const handleLeave = async () => {
    await leaveRoom();
    onLeave();
  };

  const handleKick = async (playerId: string) => {
    await kickPlayer(playerId);
  };

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {room.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <span className="text-lg font-mono font-bold tracking-widest">
                  {room.code}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <Badge variant={room.status === RoomStatus.WAITING ? 'info' : 'success'}>
                {room.status}
              </Badge>
            </div>
          </div>
          <Button variant="danger" onClick={handleLeave}>
            Leave Room
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room info card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Players: <span className="font-bold">{room.players.length}/{room.maxPlayers}</span>
                  </p>
                </div>
                {!isHost && currentPlayer && (
                  <Button
                    variant={currentPlayer.isReady ? 'secondary' : 'success'}
                    onClick={handleToggleReady}
                  >
                    {currentPlayer.isReady ? 'Not Ready' : 'Ready'}
                  </Button>
                )}
              </div>
            </Card>

            {/* Game settings (visible to all, editable by host) */}
            <GameSettings 
              onStartGame={handleStartGame} 
              isHost={isHost} 
            />

            {/* Start game info */}
            {isHost && !canStartGame && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {room.players.length < 2
                    ? 'Need at least 2 players to start the game.'
                    : 'Waiting for all players to be ready...'}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players list */}
            <Card>
              <PlayerList players={room.players} onKick={handleKick} />
            </Card>

            {/* Chat */}
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
};
