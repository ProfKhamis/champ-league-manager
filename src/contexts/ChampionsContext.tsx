import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CompetitionState } from '@/types/champions';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  getDefaultCompetitionState 
} from '@/utils/localStorage';
import { calculateGroupStandings, isGroupStageComplete } from '@/utils/championsLogic';

type ChampionsAction = 
  | { type: 'LOAD_DATA'; payload: CompetitionState }
  | { type: 'UPDATE_TEAMS'; payload: CompetitionState['teams'] }
  | { type: 'UPDATE_MATCHES'; payload: CompetitionState['matches'] }
  | { type: 'UPDATE_GROUPS'; payload: CompetitionState['groups'] }
  | { type: 'UPDATE_KNOCKOUT'; payload: CompetitionState['knockoutPairings'] }
  | { type: 'SET_STAGE'; payload: CompetitionState['currentStage'] }
  | { type: 'RECALCULATE_STANDINGS' }
  | { type: 'RESET_COMPETITION' };

const championsReducer = (state: CompetitionState, action: ChampionsAction): CompetitionState => {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    
    case 'UPDATE_TEAMS':
      return { ...state, teams: action.payload };
    
    case 'UPDATE_MATCHES':
      return { ...state, matches: action.payload };
    
    case 'UPDATE_GROUPS': {
      const newState = { ...state, groups: action.payload };
      // Recalculate standings when groups are updated
      const updatedGroups = newState.groups.map(group => ({
        ...group,
        standings: calculateGroupStandings(group, newState.matches)
      }));
      
      const groupStageCompleted = isGroupStageComplete(updatedGroups, newState.matches);
      
      return {
        ...newState,
        groups: updatedGroups,
        groupStageCompleted,
        currentStage: groupStageCompleted && newState.currentStage === 'group' ? 'round16' : newState.currentStage
      };
    }
    
    case 'UPDATE_KNOCKOUT':
      return { ...state, knockoutPairings: action.payload };
    
    case 'SET_STAGE':
      return { ...state, currentStage: action.payload };
    
    case 'RECALCULATE_STANDINGS': {
      const updatedGroups = state.groups.map(group => ({
        ...group,
        standings: calculateGroupStandings(group, state.matches)
      }));
      
      const groupStageCompleted = isGroupStageComplete(updatedGroups, state.matches);
      
      return {
        ...state,
        groups: updatedGroups,
        groupStageCompleted,
        currentStage: groupStageCompleted && state.currentStage === 'group' ? 'round16' : state.currentStage
      };
    }
    
    case 'RESET_COMPETITION':
      return getDefaultCompetitionState();
    
    default:
      return state;
  }
};

interface ChampionsContextType {
  state: CompetitionState;
  dispatch: React.Dispatch<ChampionsAction>;
  saveData: () => void;
}

const ChampionsContext = createContext<ChampionsContextType | undefined>(undefined);

export const useChampions = () => {
  const context = useContext(ChampionsContext);
  if (!context) {
    throw new Error('useChampions must be used within a ChampionsProvider');
  }
  return context;
};

interface ChampionsProviderProps {
  children: React.ReactNode;
}

export const ChampionsProvider: React.FC<ChampionsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(championsReducer, getDefaultCompetitionState());

  // Load data on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: savedData });
    }
  }, []);

  // Save data whenever state changes
  const saveData = () => {
    saveToLocalStorage(state);
  };

  // Auto-save on state changes
  useEffect(() => {
    saveData();
  }, [state]);

  return (
    <ChampionsContext.Provider value={{ state, dispatch, saveData }}>
      {children}
    </ChampionsContext.Provider>
  );
};