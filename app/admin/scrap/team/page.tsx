'use client';

import { useState, useTransition } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { scrapApi } from '@/lib/api';
import { ScrapResponse, ScrapTeamResult, SquadMember, Trophy } from '@/lib/types';

function TeamPreview({ data }: { data: ScrapTeamResult }) {
  return (
    <div className="space-y-6">
      {/* Header with logo and basic info */}
      <div className="flex gap-6">
        {data.logoUrl && (
          <div className="flex-shrink-0">
            <img
              src={data.logoUrl}
              alt={data.name}
              className="w-24 h-24 rounded-lg object-contain bg-white p-2"
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
          {data.shortName && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {data.shortName}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.country && (
              <Badge variant="secondary">{data.country}</Badge>
            )}
            {data.leagueName && (
              <Badge variant="primary">{data.leagueName}</Badge>
            )}
            {data.foundedYear && (
              <Badge variant="info">Est. {data.foundedYear}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.stadium && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Stadium
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.stadium}
            </p>
          </div>
        )}
        {data.squad && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Squad Size
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.squad.length} players
            </p>
          </div>
        )}
        {data.trophies && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Trophies
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.trophies.length}
            </p>
          </div>
        )}
      </div>

      {/* Squad */}
      {data.squad && data.squad.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Squad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.squad.map((member, index) => (
              <SquadRow key={index} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Trophies */}
      {data.trophies && data.trophies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            Trophies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.trophies.map((trophy, index) => (
              <TrophyRow key={index} trophy={trophy} />
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

function SquadRow({ member }: { member: SquadMember }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        {member.number && (
          <span className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-bold">
            {member.number}
          </span>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {member.name}
          </p>
          <p className="text-sm text-gray-500">
            {member.position}
            {member.nationality && ` • ${member.nationality}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function TrophyRow({ trophy }: { trophy: Trophy }) {
  return (
    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {trophy.competitionName}
          </p>
          <p className="text-sm text-gray-500">
            {trophy.season}/{trophy.season + 1}
          </p>
        </div>
      </div>
      {trophy.competitionType && (
        <Badge variant="secondary" className="text-xs">
          {trophy.competitionType.replace('_', ' ')}
        </Badge>
      )}
    </div>
  );
}

export default function ScrapTeamPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScrapResponse<ScrapTeamResult> | null>(null);
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
        const response = await scrapApi.scrapeTeam(url.trim());
        setResult(response);
        if (!response.success) {
          setError(response.error || 'Failed to scrape team data');
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
            🏟️ Scrape Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a Transfermarkt team URL to scrape their data
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
                Team URL
              </label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.transfermarkt.com/manchester-city/startseite/verein/281"
                disabled={isPending}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: https://www.transfermarkt.com/team-name/startseite/verein/12345
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
              {isPending ? 'Scraping...' : 'Scrape Team Data'}
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
            <TeamPreview data={result.data} />
          </Card>
        )}
      </div>
    </div>
  );
}
