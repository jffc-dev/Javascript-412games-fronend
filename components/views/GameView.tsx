'use client';

import { Button, Card, Badge } from '@/components/ui';
import { PlayerList, ChatBox, StopGameBoard } from '@/components/game';
import { useSocket } from '@/lib/socket';
import { useGameStore, selectIsHost } from '@/lib/store';

interface GameViewProps {
  onGameEnd: () => void;
}

export const GameView = ({ onGameEnd }: GameViewProps) => {
  const room = useGameStore((state) => state.room);
  const isHost = useGameStore(selectIsHost);
  const stopGameState = useGameStore((state) => state.stopGameState);
  const { resetRoom, leaveRoom, endGame } = useSocket();

  console.log(stopGameState)

  const handleEndGame = async () => {
    try {
      await endGame();
      onGameEnd();
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    onGameEnd();
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🛑 {room.name}
            </h1>
            <Badge variant="success">In Game</Badge>
            {stopGameState && (
              <Badge variant="info">
                Round {stopGameState.currentRound}/{stopGameState.totalRounds}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {isHost && (
              <Button variant="danger" onClick={handleEndGame}>
                End Game
              </Button>
            )}
            <Button variant="secondary" onClick={handleLeave}>
              Leave
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main game board */}
          <div className="lg:col-span-2">
            <StopGameBoard />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players with scores */}
            <Card>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                Scoreboard
              </h4>
              <ul className="space-y-2">
                {room.players
                  .map((player) => ({
                    ...player,
                    score: stopGameState?.scores?.[player.id] ?? 0
                  }))
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {player.username}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {player.score}
                      </span>
                    </li>
                  ))}
              </ul>
            </Card>

            {/* Chat */}
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
};
