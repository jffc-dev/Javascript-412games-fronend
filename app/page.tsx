'use client';

import { useEffect } from 'react';
import { HomeView, LobbyView, GameView } from '@/components/views';
import { useGameStore } from '@/lib/store';
import { RoomStatus } from '@/lib/types';

export default function Home() {
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
        <HomeView 
          onRoomJoined={() => setGamePhase('lobby')} 
        />
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
        <HomeView 
          onRoomJoined={() => setGamePhase('lobby')} 
        />
      );
  }
}