import { CompetitionState, Team, Match, Group, KnockoutPairing } from '@/types/champions';

const STORAGE_KEY = 'champions-league-data';
const ADMIN_KEY = 'champions-league-admin';

export const saveToLocalStorage = (data: CompetitionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): CompetitionState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const getDefaultCompetitionState = (): CompetitionState => {
  return {
    teams: [],
    groups: [
      { name: 'A', teams: [], standings: [] },
      { name: 'B', teams: [], standings: [] },
      { name: 'C', teams: [], standings: [] },
      { name: 'D', teams: [], standings: [] },
      { name: 'E', teams: [], standings: [] },
      { name: 'F', teams: [], standings: [] },
    ],
    matches: [],
    knockoutPairings: [],
    currentStage: 'group',
    groupStageCompleted: false,
    awayGoalRule: true,
  };
};

export const saveAdminSession = (isLoggedIn: boolean): void => {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify({ isLoggedIn, timestamp: Date.now() }));
  } catch (error) {
    console.error('Error saving admin session:', error);
  }
};

export const getAdminSession = (): boolean => {
  try {
    const data = localStorage.getItem(ADMIN_KEY);
    if (!data) return false;
    
    const session = JSON.parse(data);
    // Session expires after 24 hours
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000;
    
    return session.isLoggedIn && !isExpired;
  } catch (error) {
    console.error('Error checking admin session:', error);
    return false;
  }
};

export const clearAdminSession = (): void => {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch (error) {
    console.error('Error clearing admin session:', error);
  }
};