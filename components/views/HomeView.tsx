'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { useSocket } from '@/lib/socket';

interface HomeViewProps {
  onRoomJoined: () => void;
}

export const HomeView = ({ onRoomJoined }: HomeViewProps) => {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, isConnecting, connect, createRoom, joinRoom, error: socketError } = useSocket();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        await connect();
      }
      await createRoom({
        roomName: roomName.trim(),
        maxPlayers,
        username: username.trim(),
      });
      onRoomJoined();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        await connect();
      }
      await joinRoom({
        roomCode: roomCode.trim().toUpperCase(),
        username: username.trim(),
      });
      onRoomJoined();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  // Home screen
  if (mode === 'home') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <Card className="w-full max-w-md text-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🛑 Stop!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                The classic word game (Tutti Frutti)
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={() => setMode('create')} className="w-full" size="lg">
                Create Room
              </Button>
              <Button onClick={() => setMode('join')} variant="secondary" className="w-full" size="lg">
                Join Room
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connection: {isConnected ? (
                  <span className="text-green-500">● Connected</span>
                ) : isConnecting ? (
                  <span className="text-yellow-500">● Connecting...</span>
                ) : (
                  <span className="text-gray-400">● Not connected</span>
                )}
              </p>
              {!isConnected && !isConnecting && (
                <Button onClick={handleConnect} variant="ghost" size="sm" className="mt-2">
                  Connect to Server
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Create room form
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <Card className="w-full max-w-md">
          <button
            onClick={() => setMode('home')}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create a Room
          </h2>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <Input
              label="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />

            <Input
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="E.g., Friday Night Games"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Players: {maxPlayers}
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {(error || socketError) && (
              <p className="text-red-500 text-sm">{error || socketError}</p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Room
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Join room form
  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <Card className="w-full max-w-md">
          <button
            onClick={() => setMode('home')}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Join a Room
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <Input
              label="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />

            <Input
              label="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              required
              className="text-center text-2xl tracking-widest uppercase"
            />

            {(error || socketError) && (
              <p className="text-red-500 text-sm">{error || socketError}</p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Join Room
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return null;
};
