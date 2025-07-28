import React, { useState } from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Filter, Trophy, Calendar } from 'lucide-react';

type FilterStage = 'all' | 'group' | 'knockout';

const MatchHistory: React.FC = () => {
  const { state } = useChampions();
  const [filterStage, setFilterStage] = useState<FilterStage>('all');

  const completedMatches = state.matches.filter(m => m.completed);

  const getFilteredMatches = () => {
    if (filterStage === 'all') return completedMatches;
    if (filterStage === 'group') return completedMatches.filter(m => m.stage === 'group');
    return completedMatches.filter(m => m.stage !== 'group');
  };

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getStageLabel = (match: any) => {
    switch (match.stage) {
      case 'group':
        return `Group ${match.group} - MD ${match.matchday}`;
      case 'round16':
        return 'Round of 16';
      case 'quarter':
        return 'Quarter Final';
      case 'semi':
        return 'Semi Final';
      case 'final':
        return 'Final';
      default:
        return 'Unknown';
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'group':
        return 'bg-blue-600 text-white';
      case 'round16':
        return 'bg-purple-600 text-white';
      case 'quarter':
        return 'bg-orange-600 text-white';
      case 'semi':
        return 'bg-red-600 text-white';
      case 'final':
        return 'bg-yellow-600 text-black';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getWinnerHighlight = (match: any) => {
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    
    if (homeScore > awayScore) return 'home';
    if (awayScore > homeScore) return 'away';
    return 'draw';
  };

  const filteredMatches = getFilteredMatches().sort((a, b) => {
    // Sort by stage priority (final first, then semi, etc.) then by matchday
    const stagePriority = { final: 5, semi: 4, quarter: 3, round16: 2, group: 1 };
    const aPriority = stagePriority[a.stage as keyof typeof stagePriority] || 0;
    const bPriority = stagePriority[b.stage as keyof typeof stagePriority] || 0;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return (b.matchday || 0) - (a.matchday || 0);
  });

  if (completedMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Match History</h1>
        <p className="text-muted-foreground">No matches have been completed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Match History</h1>
        <p className="text-muted-foreground">
          Complete record of all matches played in the tournament
        </p>
      </div>

      {/* Filter Controls */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStage === 'all' ? "champions" : "outline"}
              onClick={() => setFilterStage('all')}
            >
              All Matches ({completedMatches.length})
            </Button>
            <Button
              variant={filterStage === 'group' ? "champions" : "outline"}
              onClick={() => setFilterStage('group')}
            >
              Group Stage ({completedMatches.filter(m => m.stage === 'group').length})
            </Button>
            <Button
              variant={filterStage === 'knockout' ? "champions" : "outline"}
              onClick={() => setFilterStage('knockout')}
            >
              Knockout Stage ({completedMatches.filter(m => m.stage !== 'group').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Match History List */}
      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const winner = getWinnerHighlight(match);
          
          return (
            <Card key={match.id} className="champions-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Stage Badge */}
                    <Badge className={getStageBadgeColor(match.stage)}>
                      {getStageLabel(match)}
                    </Badge>

                    {/* Match Details */}
                    <div className="flex items-center space-x-6 flex-1">
                      <div className={`text-right min-w-[140px] ${
                        winner === 'home' ? 'font-bold text-green-400' : 'text-primary-foreground'
                      }`}>
                        {getTeamName(match.homeTeam)}
                      </div>
                      
                      <div className="text-center min-w-[80px]">
                        <p className="text-xl font-bold text-primary">
                          {match.homeScore || 0} - {match.awayScore || 0}
                        </p>
                      </div>
                      
                      <div className={`text-left min-w-[140px] ${
                        winner === 'away' ? 'font-bold text-green-400' : 'text-primary-foreground'
                      }`}>
                        {getTeamName(match.awayTeam)}
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="text-right text-sm text-muted-foreground">
                    {match.date && (
                      <p className="flex items-center gap-1 justify-end mb-1">
                        <Calendar className="w-4 h-4" />
                        {match.date}
                      </p>
                    )}
                    {winner === 'draw' && (
                      <Badge variant="outline" className="ml-2">
                        Draw
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <Card className="champions-card">
          <CardContent className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No matches found for the selected filter.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      {filteredMatches.length > 0 && (
        <Card className="champions-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Statistics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredMatches.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredMatches.reduce((total, m) => total + (m.homeScore || 0) + (m.awayScore || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredMatches.filter(m => (m.homeScore || 0) !== (m.awayScore || 0)).length}
                </p>
                <p className="text-sm text-muted-foreground">Decisive Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredMatches.filter(m => (m.homeScore || 0) === (m.awayScore || 0)).length}
                </p>
                <p className="text-sm text-muted-foreground">Draws</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchHistory;