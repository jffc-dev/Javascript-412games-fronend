'use client';

import { useState, useTransition } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { scrapApi } from '@/lib/api';
import { ScrapResponse, ScrapPlayerResult, CareerEntry } from '@/lib/types';

function PlayerPreview({ data }: { data: ScrapPlayerResult }) {
  return (
    <div className="space-y-6">
      {/* Header with image and basic info */}
      <div className="flex gap-6">
        {data.imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={data.imageUrl}
              alt={data.name}
              className="w-32 h-32 rounded-lg object-cover bg-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.name}
          </h3>
          {data.fullName && data.fullName !== data.name && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {data.fullName}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.position && (
              <Badge variant="primary">{data.position}</Badge>
            )}
            {data.nationality && (
              <Badge variant="secondary">{data.nationality}</Badge>
            )}
            {data.currentTeam && (
              <Badge variant="success">{data.currentTeam}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.dateOfBirth && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Date of Birth
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(data.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        )}
        {data.heightCm && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Height
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.heightCm} cm
            </p>
          </div>
        )}
        {data.foot && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Foot
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.foot}
            </p>
          </div>
        )}
        {data.marketValueEuros && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Market Value
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              €{(data.marketValueEuros / 1000000).toFixed(1)}M
            </p>
          </div>
        )}
      </div>

      {/* Nationalities */}
      {data.nationalities && data.nationalities.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            Nationalities
          </h4>
          <div className="flex gap-2">
            {data.nationalities.map((nat) => (
              <Badge key={nat} variant="secondary">
                {nat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Career History */}
      {data.careerHistory && data.careerHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Career History
          </h4>
          <div className="space-y-2">
            {data.careerHistory.map((entry, index) => (
              <CareerRow key={index} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Transfermarkt ID */}
      {data.transfermarktId && (
        <p className="text-xs text-gray-400">
          Transfermarkt ID: {data.transfermarktId}
        </p>
      )}
    </div>
  );
}

function CareerRow({ entry }: { entry: CareerEntry }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {entry.teamName}
            {entry.isLoan && (
              <span className="ml-2 text-xs text-orange-500">(loan)</span>
            )}
            {entry.isCurrent && (
              <span className="ml-2 text-xs text-green-500">(current)</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {entry.seasonStart}
            {entry.seasonEnd ? ` - ${entry.seasonEnd}` : ' - present'}
          </p>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        {entry.appearances !== undefined && (
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {entry.appearances}
            </p>
            <p className="text-xs text-gray-500">Apps</p>
          </div>
        )}
        {entry.goals !== undefined && (
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {entry.goals}
            </p>
            <p className="text-xs text-gray-500">Goals</p>
          </div>
        )}
        {entry.assists !== undefined && (
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {entry.assists}
            </p>
            <p className="text-xs text-gray-500">Assists</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScrapPlayerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScrapResponse<ScrapPlayerResult> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    startTransition(async () => {
      try {
        const response = await scrapApi.scrapePlayer(url.trim());
        setResult(response);
        if (!response.success) {
          setError(response.error || 'Failed to scrape player data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ⚽ Scrape Player
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a Transfermarkt player URL to scrape their data
          </p>
        </div>

        {/* Form */}
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Player URL
              </label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.transfermarkt.com/lionel-messi/profil/spieler/28003"
                disabled={isPending}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: https://www.transfermarkt.com/player-name/profil/spieler/12345
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isPending}
              disabled={isPending}
            >
              {isPending ? 'Scraping...' : 'Scrape Player Data'}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {result && result.success && result.data && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scrape Result
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="success">Success</Badge>
                <span>
                  {new Date(result.scrapedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <PlayerPreview data={result.data} />
          </Card>
        )}
      </div>
    </div>
  );
}
