'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { DEFAULT_CATEGORIES } from '@/lib/types';

interface GameSettingsProps {
  onStartGame: (categories: string[], totalRounds: number) => void;
  isHost: boolean;
}

export const GameSettings = ({ onStartGame, isHost }: GameSettingsProps) => {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES.slice(0, 5));
  const [newCategory, setNewCategory] = useState('');
  const [totalRounds, setTotalRounds] = useState(5);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((c) => c !== categoryToRemove));
  };

  const handleStart = () => {
    if (categories.length >= 3) {
      onStartGame(categories, totalRounds);
    }
  };

  if (!isHost) {
    return (
      <Card title="Game Settings" subtitle="Waiting for host to start the game...">
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Categories</h5>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Rounds: <span className="font-bold">{totalRounds}</span>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Game Settings" subtitle="Configure the game before starting">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Categories ({categories.length})
          </h5>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {category}
                <button
                  onClick={() => handleRemoveCategory(category)}
                  className="hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add a category..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} variant="secondary">
              Add
            </Button>
          </div>
        </div>

        {/* Rounds */}
        <div>
          <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Number of Rounds
          </h5>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={totalRounds}
              onChange={(e) => setTotalRounds(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">
              {totalRounds}
            </span>
          </div>
        </div>

        {/* Quick Category Sets */}
        <div>
          <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Quick Sets
          </h5>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategories(['Name', 'Animal', 'Country', 'Food', 'Object'])}
            >
              Classic
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategories(['Name', 'Animal', 'Country', 'Food', 'Object', 'Color', 'Movie', 'Profession'])}
            >
              Extended
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategories(['Movie', 'Song', 'Actor', 'Director', 'TV Show'])}
            >
              Entertainment
            </Button>
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full"
          size="lg"
          disabled={categories.length < 3}
        >
          Start Game ({categories.length} categories, {totalRounds} rounds)
        </Button>
      </div>
    </Card>
  );
};
