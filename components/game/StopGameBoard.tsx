'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useGameStore, selectIsHost } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { GamePhase, StopGameAction } from '@/lib/types';

export const StopGameBoard = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { sendGameAction, updateGameState } = useSocket();
  
  const room = useGameStore((state) => state.room);
  const playerId = useGameStore((state) => state.playerId);
  const isHost = useGameStore(selectIsHost);
  const stopGameState = useGameStore((state) => state.stopGameState);
  const currentAnswers = useGameStore((state) => state.currentAnswers);
  const hasSubmitted = useGameStore((state) => state.hasSubmitted);
  const setAnswer = useGameStore((state) => state.setAnswer);
  const submitAnswers = useGameStore((state) => state.submitAnswers);
  const initStopGame = useGameStore((state) => state.initStopGame);

  // Timer effect
  useEffect(() => {
    if (stopGameState?.phase !== GamePhase.ROUND_ACTIVE) {
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - stopGameState.roundStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [stopGameState?.phase, stopGameState?.roundStartTime]);

  // Initialize game state if host
  useEffect(() => {
    if (isHost && room && !stopGameState) {
      const initialState = initStopGame(['Name', 'Animal', 'Country', 'Food', 'Object'], 5);
      updateGameState(initialState).catch(console.error);
    }
  }, [isHost, room, stopGameState, initStopGame, updateGameState]);

  const handleStartRound = useCallback(async () => {
    if (!isHost || !stopGameState) return;
    
    const newRound = stopGameState.currentRound + 1;
    const letters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
    const newLetter = letters[Math.floor(Math.random() * letters.length)];
    
    await sendGameAction(StopGameAction.START_ROUND, {
      letter: newLetter,
      round: newRound,
      roundStartTime: Date.now(),
    });
  }, [isHost, stopGameState, sendGameAction]);

  const handleStop = useCallback(async () => {
    if (!room || !playerId) return;
    
    await sendGameAction(StopGameAction.STOP, {
      stoppedBy: playerId,
    });
  }, [room, playerId, sendGameAction]);

  const handleSubmitAnswers = useCallback(async () => {
    if (!playerId || hasSubmitted) return;
    
    await sendGameAction(StopGameAction.SUBMIT_ANSWERS, {
      playerId,
      answers: currentAnswers,
    });
    submitAnswers();
  }, [playerId, hasSubmitted, currentAnswers, sendGameAction, submitAnswers]);

  const handleNextRound = useCallback(async () => {
    if (!isHost || !stopGameState) return;
    
    if (stopGameState.currentRound >= stopGameState.totalRounds) {
      // Game over
      return;
    }
    
    const letters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
    const newLetter = letters[Math.floor(Math.random() * letters.length)];
    
    await sendGameAction(StopGameAction.NEXT_ROUND, {
      round: stopGameState.currentRound + 1,
      letter: newLetter,
    });
  }, [isHost, stopGameState, sendGameAction]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!stopGameState) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading game...</p>
        </div>
      </Card>
    );
  }

  // Waiting to start
  if (stopGameState.phase === GamePhase.IDLE) {
    return (
      <Card className="text-center">
        <div className="py-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🛑 Stop! (Tutti Frutti)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Round {stopGameState.currentRound} of {stopGameState.totalRounds}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Categories</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {stopGameState.categories.map((category) => (
                <Badge key={category} variant="info">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          {isHost ? (
            <Button onClick={handleStartRound} size="lg" className="animate-pulse">
              Start Round 1
            </Button>
          ) : (
            <p className="text-gray-500">Waiting for host to start...</p>
          )}
        </div>
      </Card>
    );
  }

  // Round active - show answer form
  if (stopGameState.phase === GamePhase.ROUND_ACTIVE) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default" className="bg-white/20 text-white">
              Round {stopGameState.currentRound}/{stopGameState.totalRounds}
            </Badge>
            <span className="text-2xl font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="text-8xl font-bold mb-2">{stopGameState.currentLetter}</div>
          <p className="text-white/80">Words starting with this letter</p>
        </div>

        {/* Answer form */}
        <Card>
          <div className="space-y-4">
            {stopGameState.categories.map((category) => (
              <div key={category}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {category}
                </label>
                <Input
                  value={currentAnswers[category] || ''}
                  onChange={(e) => setAnswer(category, e.target.value)}
                  placeholder={`${category} starting with ${stopGameState.currentLetter}...`}
                  disabled={hasSubmitted}
                  className={hasSubmitted ? 'opacity-50' : ''}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleStop}
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={hasSubmitted}
          >
            🛑 STOP!
          </Button>
          <Button
            onClick={handleSubmitAnswers}
            variant="success"
            size="lg"
            className="flex-1"
            disabled={hasSubmitted}
          >
            {hasSubmitted ? 'Submitted ✓' : 'Submit'}
          </Button>
        </div>
      </div>
    );
  }

  // Round stopped - show results preview
  if (stopGameState.phase === GamePhase.STOPPED) {
    const stoppedByPlayer = room?.players.find(p => p.id === stopGameState.stoppedBy);
    
    return (
      <div className="space-y-6">
        {/* Stopped banner */}
        <div className="bg-red-500 text-white rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold mb-2">🛑 STOP!</h2>
          <p>
            Stopped by <span className="font-bold">{stoppedByPlayer?.username || 'Unknown'}</span>
          </p>
          <p className="text-white/80 mt-1">
            Round {stopGameState.currentRound} - Letter: {stopGameState.currentLetter}
          </p>
        </div>

        {/* Submit if not done */}
        {!hasSubmitted && (
          <Card>
            <div className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Quick! Submit your answers before time runs out!
              </p>
              {stopGameState.categories.map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {category}
                  </label>
                  <Input
                    value={currentAnswers[category] || ''}
                    onChange={(e) => setAnswer(category, e.target.value)}
                    placeholder={`${category} starting with ${stopGameState.currentLetter}...`}
                  />
                </div>
              ))}
              <Button onClick={handleSubmitAnswers} variant="success" className="w-full">
                Submit Answers
              </Button>
            </div>
          </Card>
        )}

        {/* Show submitted status */}
        {hasSubmitted && (
          <Card>
            <div className="text-center py-4">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                ✓ Your answers have been submitted!
              </p>
              <p className="text-gray-500 mt-2">Waiting for other players...</p>
            </div>
          </Card>
        )}

        {/* Next round button for host */}
        {isHost && (
          <Button onClick={handleNextRound} size="lg" className="w-full">
            {stopGameState.currentRound >= stopGameState.totalRounds
              ? 'See Final Results'
              : 'Next Round →'}
          </Button>
        )}
      </div>
    );
  }

  // Game over
  if (stopGameState.phase === GamePhase.GAME_OVER) {
    return (
      <Card className="text-center">
        <div className="py-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🏆 Game Over!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Final results after {stopGameState.totalRounds} rounds
          </p>
          
          {/* TODO: Show final scores */}
          
          {isHost && (
            <Button onClick={() => {/* Reset game */}} size="lg">
              Play Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
};
