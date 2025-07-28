import { Team, Match, Group, GroupStanding, KnockoutPairing, CompetitionState } from '@/types/champions';

// Generate group stage fixtures (round-robin)
export const generateGroupFixtures = (groups: Group[]): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;

  groups.forEach((group) => {
    if (group.teams.length < 4) return;

    const teams = group.teams;
    
    // Generate 6 matchdays for group stage
    for (let matchday = 1; matchday <= 6; matchday++) {
      // Each team plays 6 matches total (home and away vs each other team)
      if (matchday === 1) {
        matches.push(createMatch(matchId++, teams[0].id, teams[1].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[2].id, teams[3].id, matchday, group.name));
      } else if (matchday === 2) {
        matches.push(createMatch(matchId++, teams[1].id, teams[2].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[3].id, teams[0].id, matchday, group.name));
      } else if (matchday === 3) {
        matches.push(createMatch(matchId++, teams[0].id, teams[2].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[1].id, teams[3].id, matchday, group.name));
      } else if (matchday === 4) {
        matches.push(createMatch(matchId++, teams[1].id, teams[0].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[3].id, teams[2].id, matchday, group.name));
      } else if (matchday === 5) {
        matches.push(createMatch(matchId++, teams[2].id, teams[1].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[0].id, teams[3].id, matchday, group.name));
      } else if (matchday === 6) {
        matches.push(createMatch(matchId++, teams[2].id, teams[0].id, matchday, group.name));
        matches.push(createMatch(matchId++, teams[3].id, teams[1].id, matchday, group.name));
      }
    }
  });

  return matches;
};

const createMatch = (id: number, homeTeam: string, awayTeam: string, matchday: number, group: string): Match => ({
  id: id.toString(),
  homeTeam,
  awayTeam,
  matchday,
  stage: 'group',
  group,
  completed: false,
});

// Calculate group standings
export const calculateGroupStandings = (group: Group, matches: Match[]): GroupStanding[] => {
  const groupMatches = matches.filter(m => m.group === group.name && m.completed);
  
  const standings: GroupStanding[] = group.teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    position: 0,
  }));

  groupMatches.forEach(match => {
    const homeTeamStanding = standings.find(s => s.teamId === match.homeTeam);
    const awayTeamStanding = standings.find(s => s.teamId === match.awayTeam);
    
    if (!homeTeamStanding || !awayTeamStanding) return;

    // Update statistics
    homeTeamStanding.played++;
    awayTeamStanding.played++;
    
    homeTeamStanding.goalsFor += match.homeScore || 0;
    homeTeamStanding.goalsAgainst += match.awayScore || 0;
    awayTeamStanding.goalsFor += match.awayScore || 0;
    awayTeamStanding.goalsAgainst += match.homeScore || 0;

    // Determine result
    if ((match.homeScore || 0) > (match.awayScore || 0)) {
      homeTeamStanding.won++;
      homeTeamStanding.points += 3;
      awayTeamStanding.lost++;
    } else if ((match.homeScore || 0) < (match.awayScore || 0)) {
      awayTeamStanding.won++;
      awayTeamStanding.points += 3;
      homeTeamStanding.lost++;
    } else {
      homeTeamStanding.drawn++;
      awayTeamStanding.drawn++;
      homeTeamStanding.points++;
      awayTeamStanding.points++;
    }
  });

  // Calculate goal difference and sort
  standings.forEach(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  // Sort by points, then goal difference, then goals for
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Assign positions
  standings.forEach((s, index) => {
    s.position = index + 1;
  });

  return standings;
};

// Generate knockout stage pairings
export const generateKnockoutPairings = (groups: Group[], stage: 'round16' | 'quarter' | 'semi' | 'final'): KnockoutPairing[] => {
  if (stage === 'round16') {
    const qualifiedTeams: { teamId: string; groupWinner: boolean }[] = [];
    
    groups.forEach(group => {
      if (group.standings.length >= 2) {
        qualifiedTeams.push({ teamId: group.standings[0].teamId, groupWinner: true });
        qualifiedTeams.push({ teamId: group.standings[1].teamId, groupWinner: false });
      }
    });

    const groupWinners = qualifiedTeams.filter(t => t.groupWinner).map(t => t.teamId);
    const runnersUp = qualifiedTeams.filter(t => !t.groupWinner).map(t => t.teamId);

    // Shuffle to create random pairings (group winners vs runners-up)
    const pairings: KnockoutPairing[] = [];
    let pairingId = 1;

    for (let i = 0; i < Math.min(groupWinners.length, runnersUp.length); i++) {
      pairings.push({
        id: `R16-${pairingId++}`,
        homeTeam: groupWinners[i],
        awayTeam: runnersUp[i],
        stage: 'round16',
      });
    }

    return pairings;
  }

  return [];
};

// Check if group stage is completed
export const isGroupStageComplete = (groups: Group[], matches: Match[]): boolean => {
  const groupMatches = matches.filter(m => m.stage === 'group');
  return groupMatches.length > 0 && groupMatches.every(m => m.completed);
};

// Get qualified teams from group stage
export const getQualifiedTeams = (groups: Group[]): { winners: string[]; runnersUp: string[]; europaLeague: string[] } => {
  const winners: string[] = [];
  const runnersUp: string[] = [];
  const europaLeague: string[] = [];

  groups.forEach(group => {
    if (group.standings.length >= 3) {
      winners.push(group.standings[0].teamId);
      runnersUp.push(group.standings[1].teamId);
      europaLeague.push(group.standings[2].teamId);
    }
  });

  return { winners, runnersUp, europaLeague };
};