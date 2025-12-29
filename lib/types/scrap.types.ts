// Scrap-related types for the frontend

export enum ScrapType {
  PLAYER = 'player',
  TEAM = 'team',
  LEAGUE = 'league',
  MANAGER = 'manager',
}

export interface ScrapUrlPayload {
  url: string;
  type: ScrapType;
  notes?: string;
}

export interface CareerEntry {
  teamName: string;
  teamId?: string;
  leagueName?: string;
  leagueId?: string;
  seasonStart: number;
  seasonEnd?: number;
  appearances?: number;
  goals?: number;
  assists?: number;
  isLoan?: boolean;
  isCurrent?: boolean;
}

export interface ScrapPlayerResult {
  name: string;
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  nationalities?: string[];
  position?: string;
  foot?: string;
  heightCm?: number;
  currentTeam?: string;
  currentTeamId?: string;
  marketValueEuros?: number;
  imageUrl?: string;
  transfermarktId?: string;
  careerHistory?: CareerEntry[];
}

export interface SquadMember {
  name: string;
  personId?: string;
  position?: string;
  nationality?: string;
  number?: number;
}

export interface Trophy {
  competitionName: string;
  season: number;
  competitionType?: string;
}

export interface ScrapTeamResult {
  name: string;
  shortName?: string;
  country?: string;
  foundedYear?: number;
  stadium?: string;
  logoUrl?: string;
  transfermarktId?: string;
  leagueName?: string;
  leagueId?: string;
  squad?: SquadMember[];
  trophies?: Trophy[];
}

export interface ScrapResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  scrapedAt: string;
  sourceUrl: string;
}
