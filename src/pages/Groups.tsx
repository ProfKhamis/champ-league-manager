import React from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award } from 'lucide-react';

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
      return (
        <Badge className="uefa-qualified-1 flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          CL Winner
        </Badge>
      );
    } else if (position === 2) {
      return (
        <Badge className="uefa-qualified-2 flex items-center gap-1">
          <Star className="w-3 h-3" />
          Qualified
        </Badge>
      );
    } else if (position === 3) {
      return (
        <Badge className="uefa-europa flex items-center gap-1">
          <Award className="w-3 h-3" />
          Europa
        </Badge>
      );
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
                <div className="uefa-table-container">
                  <table className="uefa-table">
                    <thead>
                      <tr className="uefa-table-header">
                        <th className="uefa-th uefa-th-pos">#</th>
                        <th className="uefa-th uefa-th-team">Team</th>
                        <th className="uefa-th uefa-th-stat">P</th>
                        <th className="uefa-th uefa-th-stat">W</th>
                        <th className="uefa-th uefa-th-stat">D</th>
                        <th className="uefa-th uefa-th-stat">L</th>
                        <th className="uefa-th uefa-th-stat">GF</th>
                        <th className="uefa-th uefa-th-stat">GA</th>
                        <th className="uefa-th uefa-th-stat">GD</th>
                        <th className="uefa-th uefa-th-stat">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.standings.map((standing, index) => (
                        <tr 
                          key={standing.teamId} 
                          className={`uefa-table-row ${getQualificationClass(standing.position)}`}
                        >
                          <td className="uefa-td uefa-td-pos">
                            <div className="uefa-position">
                              {standing.position}
                            </div>
                          </td>
                          <td className="uefa-td uefa-td-team">
                            <div className="uefa-team-cell">
                              <span className="uefa-team-name">
                                {standing.teamName}
                              </span>
                              <div className="uefa-badge-wrapper">
                                {getQualificationBadge(standing.position)}
                              </div>
                            </div>
                          </td>
                          <td className="uefa-td uefa-td-stat">{standing.played}</td>
                          <td className="uefa-td uefa-td-stat">{standing.won}</td>
                          <td className="uefa-td uefa-td-stat">{standing.drawn}</td>
                          <td className="uefa-td uefa-td-stat">{standing.lost}</td>
                          <td className="uefa-td uefa-td-stat">{standing.goalsFor}</td>
                          <td className="uefa-td uefa-td-stat">{standing.goalsAgainst}</td>
                          <td className="uefa-td uefa-td-stat uefa-gd">
                            <span className={standing.goalDifference > 0 ? 'uefa-gd-positive' : 
                              standing.goalDifference < 0 ? 'uefa-gd-negative' : 'uefa-gd-neutral'}>
                              {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                            </span>
                          </td>
                          <td className="uefa-td uefa-td-stat uefa-points">
                            <strong>{standing.points}</strong>
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

      {/* Footer */}
      <footer className="uefa-footer">
        <div className="uefa-footer-content">
          <p className="uefa-footer-text">
            Made with 🥶 profKhamis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Groups;