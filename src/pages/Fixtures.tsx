import React, { useState } from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy } from 'lucide-react';

const Fixtures: React.FC = () => {
  const { state } = useChampions();
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);

  const groupMatches = state.matches.filter(m => m.stage === 'group');
  const matchdays = [...new Set(groupMatches.map(m => m.matchday))].sort((a, b) => a - b);

  const getMatchesForMatchday = (matchday: number) => {
    return groupMatches.filter(m => m.matchday === matchday);
  };

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const formatScore = (match: any) => {
    if (match.completed) {
      return `${match.homeScore || 0} - ${match.awayScore || 0}`;
    }
    return 'vs';
  };

  const getMatchStatus = (match: any) => {
    if (match.completed) {
      return <Badge className="bg-green-600 text-white">Completed</Badge>;
    }
    return <Badge variant="outline">Scheduled</Badge>;
  };

  if (groupMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Fixtures & Results</h1>
        <p className="text-muted-foreground">No fixtures have been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Fixtures & Results</h1>
        <p className="text-muted-foreground">
          Group stage matches organized by matchday
        </p>
      </div>

      {/* Matchday Selector */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Matchday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {matchdays.map((matchday) => (
              <Button
                key={matchday}
                variant={selectedMatchday === matchday ? "champions" : "outline"}
                onClick={() => setSelectedMatchday(matchday)}
                className="min-w-[100px]"
              >
                Matchday {matchday}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matches for Selected Matchday */}
      {selectedMatchday && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Matchday {selectedMatchday}
          </h2>

          {/* Group by groups */}
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((groupName) => {
            const groupMatches = getMatchesForMatchday(selectedMatchday).filter(
              m => m.group === groupName
            );

            if (groupMatches.length === 0) return null;

            return (
              <Card key={groupName} className="champions-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Group {groupName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-right min-w-[120px]">
                            <p className="font-semibold text-primary-foreground">
                              {getTeamName(match.homeTeam)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-center min-w-[80px]">
                              <p className="text-lg font-bold text-primary">
                                {formatScore(match)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-left min-w-[120px]">
                            <p className="font-semibold text-primary-foreground">
                              {getTeamName(match.awayTeam)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {getMatchStatus(match)}
                          {match.date && (
                            <div className="text-right text-sm text-muted-foreground">
                              <p className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {match.date}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle>Tournament Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {state.matches.filter(m => m.completed).length}
              </p>
              <p className="text-sm text-muted-foreground">Matches Played</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {state.matches.filter(m => !m.completed).length}
              </p>
              <p className="text-sm text-muted-foreground">Upcoming Matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {state.matches
                  .filter(m => m.completed)
                  .reduce((total, m) => total + (m.homeScore || 0) + (m.awayScore || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {Math.round(
                  state.matches.filter(m => m.completed).length > 0
                    ? state.matches
                        .filter(m => m.completed)
                        .reduce((total, m) => total + (m.homeScore || 0) + (m.awayScore || 0), 0) /
                      state.matches.filter(m => m.completed).length
                    : 0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Goals Per Match</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fixtures;