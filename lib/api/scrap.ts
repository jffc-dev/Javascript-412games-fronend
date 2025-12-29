import { api } from './client';
import {
  ScrapType,
  ScrapUrlPayload,
  ScrapResponse,
  ScrapPlayerResult,
  ScrapTeamResult,
} from '@/lib/types';

export const scrapApi = {
  /**
   * Scrape player data from URL
   */
  scrapePlayer: (url: string, notes?: string) =>
    api.post<ScrapResponse<ScrapPlayerResult>>('/scrap/player', {
      url,
      type: ScrapType.PLAYER,
      notes,
    } as ScrapUrlPayload),

  /**
   * Scrape team data from URL
   */
  scrapeTeam: (url: string, notes?: string) =>
    api.post<ScrapResponse<ScrapTeamResult>>('/scrap/team', {
      url,
      type: ScrapType.TEAM,
      notes,
    } as ScrapUrlPayload),

  /**
   * Generic scrape endpoint
   */
  scrape: <T>(payload: ScrapUrlPayload) =>
    api.post<ScrapResponse<T>>('/scrap', payload),
};
