'use client';

import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  route: string;
  available: boolean;
}

const GAMES: GameInfo[] = [
  {
    id: 'stop',
    name: 'Stop! (Tutti Frutti)',
    description: 'Race to fill categories with words starting with a random letter. Be quick and creative!',
    emoji: '🛑',
    minPlayers: 2,
    maxPlayers: 8,
    route: '/games/stop',
    available: true,
  },
  {
    id: 'trivia',
    name: 'Trivia',
    description: 'Test your knowledge with multiplayer trivia questions across various categories.',
    emoji: '🧠',
    minPlayers: 2,
    maxPlayers: 10,
    route: '/games/trivia',
    available: false,
  },
  {
    id: 'drawing',
    name: 'Draw & Guess',
    description: 'One player draws, others guess! A classic party game for everyone.',
    emoji: '🎨',
    minPlayers: 3,
    maxPlayers: 12,
    route: '/games/drawing',
    available: false,
  },
  {
    id: 'word-chain',
    name: 'Word Chain',
    description: 'Each word must start with the last letter of the previous word. Keep the chain going!',
    emoji: '🔗',
    minPlayers: 2,
    maxPlayers: 6,
    route: '/games/word-chain',
    available: false,
  },
];

function GameCard({ game }: { game: GameInfo }) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-200 ${
      game.available 
        ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
        : 'opacity-60'
    }`}>
      {!game.available && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="text-5xl">{game.emoji}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {game.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
            {game.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
            <span>👥 {game.minPlayers}-{game.maxPlayers} players</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {game.available ? (
          <Link href={game.route}>
            <Button className="w-full">
              Play Now
            </Button>
          </Link>
        ) : (
          <Button className="w-full" disabled>
            Coming Soon
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎮 412 Games
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Play fun multiplayer games with your friends! Create a room, share the code, and start playing.
          </p>
        </div>

        {/* Games Grid */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎯</span> Choose a Game
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/70">
          <p>More games coming soon! 🚀</p>
        </div>
      </div>
    </div>
  );
}
