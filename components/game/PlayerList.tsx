'use client';

import { PlayerInfo } from '@/lib/types';
import { Badge } from '@/components/ui';
import { useGameStore, selectIsHost } from '@/lib/store';

interface PlayerListProps {
  players: PlayerInfo[];
  onKick?: (playerId: string) => void;
}

export const PlayerList = ({ players, onKick }: PlayerListProps) => {
  const isHost = useGameStore(selectIsHost);
  const playerId = useGameStore((state) => state.playerId);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        Players ({players.length})
      </h4>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {player.username}
                  {player.id === playerId && (
                    <span className="text-blue-500 ml-1">(You)</span>
                  )}
                </span>
                <div className="flex gap-1 mt-0.5">
                  {player.isHost && (
                    <Badge variant="warning" size="sm">Host</Badge>
                  )}
                  {player.isReady && !player.isHost && (
                    <Badge variant="success" size="sm">Ready</Badge>
                  )}
                  {!player.isReady && !player.isHost && (
                    <Badge variant="default" size="sm">Not Ready</Badge>
                  )}
                </div>
              </div>
            </div>
            
            {isHost && !player.isHost && onKick && (
              <button
                onClick={() => onKick(player.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Kick
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
