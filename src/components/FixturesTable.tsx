import React from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, Clock } from 'lucide-react';

const FixturesTable: React.FC = () => {
  const { state } = useChampions();

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const groupedMatches = state.matches.reduce((acc, match) => {
    const key = match.stage === 'group' ? `Group ${match.group}` : match.stage;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, typeof state.matches>);

  if (state.matches.length === 0) {
    return (
      <Card className="champions-card">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Fixtures Available</h3>
          <p className="text-muted-foreground">Generate fixtures to see the match schedule</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([groupName, matches]) => (
        <Card key={groupName} className="champions-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              {groupName} Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="fixtures-table-container">
              <table className="fixtures-table">
                <thead>
                  <tr className="fixtures-table-header">
                    <th className="fixtures-th">Matchday</th>
                    <th className="fixtures-th">Home Team</th>
                    <th className="fixtures-th">Score</th>
                    <th className="fixtures-th">Away Team</th>
                    <th className="fixtures-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches
                    .sort((a, b) => (a.matchday || 0) - (b.matchday || 0))
                    .map((match) => (
                    <tr key={match.id} className="fixtures-table-row">
                      <td className="fixtures-td">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">MD {match.matchday}</span>
                        </div>
                      </td>
                      <td className="fixtures-td">
                        <div className="team-cell">
                          <span className="team-name">{getTeamName(match.homeTeam)}</span>
                          <div className="team-venue">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">Home</span>
                          </div>
                        </div>
                      </td>
                      <td className="fixtures-td score-cell">
                        {match.completed ? (
                          <div className="score-display">
                            <span className="score-number">{match.homeScore}</span>
                            <span className="score-separator">-</span>
                            <span className="score-number">{match.awayScore}</span>
                          </div>
                        ) : (
                          <div className="match-time">
                            <Clock className="w-4 h-4" />
                            <span>vs</span>
                          </div>
                        )}
                      </td>
                      <td className="fixtures-td">
                        <div className="team-cell">
                          <span className="team-name">{getTeamName(match.awayTeam)}</span>
                          <div className="team-venue">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">Away</span>
                          </div>
                        </div>
                      </td>
                      <td className="fixtures-td">
                        <Badge 
                          variant={match.completed ? "default" : "outline"}
                          className={match.completed ? "status-completed" : "status-upcoming"}
                        >
                          {match.completed ? "Completed" : "Upcoming"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FixturesTable;