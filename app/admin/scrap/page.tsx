'use client';

import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface ScrapOption {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
  available: boolean;
}

const SCRAP_OPTIONS: ScrapOption[] = [
  {
    id: 'player',
    title: 'Scrape Player',
    description: 'Import player data from Transfermarkt including career history, stats, and market value.',
    emoji: '⚽',
    href: '/admin/scrap/player',
    available: true,
  },
  {
    id: 'team',
    title: 'Scrape Team',
    description: 'Import team data from Transfermarkt including squad, trophies, and stadium info.',
    emoji: '🏟️',
    href: '/admin/scrap/team',
    available: true,
  },
  {
    id: 'league',
    title: 'Scrape League',
    description: 'Import league data including teams and competition details.',
    emoji: '🏆',
    href: '/admin/scrap/league',
    available: false,
  },
  {
    id: 'manager',
    title: 'Scrape Manager',
    description: 'Import manager data including coaching history and achievements.',
    emoji: '👔',
    href: '/admin/scrap/manager',
    available: false,
  },
];

function ScrapOptionCard({ option }: { option: ScrapOption }) {
  return (
    <Card
      className={`transition-all duration-200 ${
        option.available
          ? 'hover:shadow-lg hover:scale-[1.02]'
          : 'opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{option.emoji}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {option.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {option.description}
          </p>
          {option.available ? (
            <Link href={option.href}>
              <Button size="sm">Open Scraper</Button>
            </Link>
          ) : (
            <Button size="sm" disabled>
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ScrapAdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 Data Scraper
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import football data from Transfermarkt into the database
          </p>
        </div>

        {/* Scrap Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCRAP_OPTIONS.map((option) => (
            <ScrapOptionCard key={option.id} option={option} />
          ))}
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                How it works
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Paste a Transfermarkt URL into the scraper form. The system will
                extract relevant data and display a preview. You can then review
                and save the data to the database.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
