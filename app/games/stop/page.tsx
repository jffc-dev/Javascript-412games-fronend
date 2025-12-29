'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HomeView, LobbyView, GameView } from '@/components/views';
import { useGameStore } from '@/lib/store';
import { RoomStatus } from '@/lib/types';
import { Button } from '@/components/ui';

// Back button component - defined outside of render
function BackToGames() {
  return (
    <div className="absolute top-4 left-4 z-10">
      <Link href="/">
        <Button variant="secondary" size="sm">
          ← Back to Games
        </Button>
      </Link>
    </div>
  );
}

export default function StopGame() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const room = useGameStore((state) => state.room);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const reset = useGameStore((state) => state.reset);

  // Handle room status changes
  useEffect(() => {
    if (room?.status === RoomStatus.PLAYING && gamePhase !== 'playing') {
      setGamePhase('playing');
    } else if (room?.status === RoomStatus.FINISHED && gamePhase !== 'finished') {
      setGamePhase('finished');
    }
  }, [room?.status, gamePhase, setGamePhase]);

  // Render based on game phase
  switch (gamePhase) {
    case 'home':
      return (
        <div className="relative">
          <BackToGames />
          <HomeView 
            onRoomJoined={() => setGamePhase('lobby')} 
            gameName="Stop!"
            gameEmoji="🛑"
          />
        </div>
      );

    case 'lobby':
      return (
        <LobbyView
          onGameStart={() => setGamePhase('playing')}
          onLeave={() => {
            reset();
            setGamePhase('home');
          }}
        />
      );

    case 'playing':
      return (
        <GameView
          onGameEnd={() => {
            reset();
            setGamePhase('home');
          }}
        />
      );

    case 'finished':
      return (
        <GameView
          onGameEnd={() => {
            reset();
            setGamePhase('home');
          }}
        />
      );

    default:
      return (
        <div className="relative">
          <BackToGames />
          <HomeView 
            onRoomJoined={() => setGamePhase('lobby')}
            gameName="Stop!"
            gameEmoji="🛑"
          />
        </div>
      );
  }
}
