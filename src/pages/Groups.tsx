import React from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react';

const Groups: React.FC = () => {
  const { state } = useChampions();

  const getQualificationStatus = (position: number) => {
    if (position <= 2) {
      return position === 1 ? 'Champions League Winner' : 'Champions League Qualifier';
    } else if (position === 3) {
      return 'Europa League';
    } else {
      return 'Eliminated';
    }
  };

  const getQualificationClass = (position: number) => {
    if (position <= 2) return 'qualified-cl';
    if (position === 3) return 'qualified-el';
    return 'eliminated';
  };

  const getQualificationBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-green-600 text-white">CL Winner</Badge>;
    } else if (position === 2) {
      return <Badge className="bg-green-500 text-white">CL Qualifier</Badge>;
    } else if (position === 3) {
      return <Badge className="bg-orange-500 text-white">Europa League</Badge>;
    } else {
      return <Badge variant="destructive">Eliminated</Badge>;
    }
  };

  if (state.teams.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Group Standings</h1>
        <p className="text-muted-foreground">No teams have been added to the tournament yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Group Standings</h1>
        <p className="text-muted-foreground">
          Current standings for all 8 Champions League groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.groups.map((group) => (
          <Card key={group.name} className="champions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Group {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.standings.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Pos
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          P
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          W
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          D
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          L
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          GF
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          GA
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          GD
                        </th>
                        <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {group.standings.map((standing, index) => (
                        <tr 
                          key={standing.teamId} 
                          className={`table-row border-t border-border ${getQualificationClass(standing.position)}`}
                        >
                          <td className="px-3 py-3 text-sm font-medium">
                            {standing.position}
                          </td>
                          <td className="px-3 py-3 text-sm font-medium">
                            <div className="flex items-center justify-between">
                              <span className="text-primary-foreground">
                                {standing.teamName}
                              </span>
                              {getQualificationBadge(standing.position)}
                            </div>
                          </td>
                          <td className="px-1 py-3 text-center text-sm">{standing.played}</td>
                          <td className="px-1 py-3 text-center text-sm">{standing.won}</td>
                          <td className="px-1 py-3 text-center text-sm">{standing.drawn}</td>
                          <td className="px-1 py-3 text-center text-sm">{standing.lost}</td>
                          <td className="px-1 py-3 text-center text-sm">{standing.goalsFor}</td>
                          <td className="px-1 py-3 text-center text-sm">{standing.goalsAgainst}</td>
                          <td className={`px-1 py-3 text-center text-sm font-medium ${
                            standing.goalDifference > 0 ? 'text-green-400' : 
                            standing.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'
                          }`}>
                            {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                          </td>
                          <td className="px-1 py-3 text-center text-sm font-bold text-primary">
                            {standing.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No standings available</p>
                  <p className="text-sm">Teams need to be assigned and matches played</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle>Qualification Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">1st - Champions League Winner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">2nd - Champions League Qualifier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">3rd - Europa League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm">4th - Eliminated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Groups;