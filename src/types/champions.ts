export interface Team {
  id: string;
  name: string;
  logo?: string;
  group?: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  matchday: number;
  stage: 'group' | 'round16' | 'quarter' | 'semi' | 'final';
  group?: string;
  date?: string;
  completed: boolean;
  leg?: 1 | 2; // For two-legged knockout ties
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface Group {
  name: string;
  teams: Team[];
  standings: GroupStanding[];
}

export interface KnockoutPairing {
  id: string;
  homeTeam: string;
  awayTeam: string;
  stage: 'round16' | 'quarter' | 'semi' | 'final';
  firstLeg?: Match;
  secondLeg?: Match;
  winner?: string;
  aggregateHome?: number;
  aggregateAway?: number;
}

export interface CompetitionState {
  teams: Team[];
  groups: Group[];
  matches: Match[];
  knockoutPairings: KnockoutPairing[];
  currentStage: 'group' | 'round16' | 'quarter' | 'semi' | 'final' | 'completed';
  groupStageCompleted: boolean;
  awayGoalRule: boolean;
}