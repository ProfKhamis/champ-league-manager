import React from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star } from 'lucide-react';

const Knockout: React.FC = () => {
  const { state } = useChampions();

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
  };

  const renderKnockoutBracket = () => {
    if (!state.groupStageCompleted) {
      return (
        <Card className="champions-card">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Knockout Stage Not Available</h3>
            <p className="text-muted-foreground">
              The group stage must be completed before the knockout stage begins.
            </p>
          </CardContent>
        </Card>
      );
    }

    // For now, show qualified teams from groups
    const qualifiedTeams: Array<{ name: string; group: string; position: number }> = [];
    
    state.groups.forEach(group => {
      if (group.standings.length >= 2) {
        const team1 = state.teams.find(t => t.id === group.standings[0].teamId);
        const team2 = state.teams.find(t => t.id === group.standings[1].teamId);
        
        if (team1) qualifiedTeams.push({ name: team1.name, group: group.name, position: 1 });
        if (team2) qualifiedTeams.push({ name: team2.name, group: group.name, position: 2 });
      }
    });

    const groupWinners = qualifiedTeams.filter(t => t.position === 1);
    const runnersUp = qualifiedTeams.filter(t => t.position === 2);

    return (
      <div className="space-y-8">
        {/* Qualified Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="champions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Group Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupWinners.map((team) => (
                  <div 
                    key={`${team.group}-1`}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="font-semibold text-primary-foreground">{team.name}</span>
                    <Badge className="bg-yellow-600 text-white">
                      Group {team.group} Winner
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="champions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Runners-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {runnersUp.map((team) => (
                  <div 
                    key={`${team.group}-2`}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="font-semibold text-primary-foreground">{team.name}</span>
                    <Badge className="bg-blue-600 text-white">
                      Group {team.group} Runner-up
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knockout Bracket Placeholder */}
        <Card className="champions-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Knockout Bracket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                The knockout bracket will be generated once the admin sets up the knockout pairings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Knockout Stage</h1>
        <p className="text-muted-foreground">
          {state.groupStageCompleted 
            ? 'Champions League knockout phase brackets and results'
            : 'Knockout stage will begin after group stage completion'
          }
        </p>
      </div>

      {renderKnockoutBracket()}

      {/* Tournament Progression */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle>Tournament Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                state.currentStage === 'group' ? 'bg-primary' : 'bg-green-500'
              }`}></div>
              <span className={`font-medium ${
                state.currentStage === 'group' ? 'text-primary' : 'text-green-500'
              }`}>
                Group Stage
              </span>
            </div>

            <div className="w-full md:w-16 h-0.5 bg-border"></div>

            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                state.currentStage === 'round16' ? 'bg-primary' : 
                state.groupStageCompleted ? 'bg-green-500' : 'bg-muted'
              }`}></div>
              <span className={`font-medium ${
                state.currentStage === 'round16' ? 'text-primary' : 
                state.groupStageCompleted ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                Round of 16
              </span>
            </div>

            <div className="w-full md:w-16 h-0.5 bg-border"></div>

            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                state.currentStage === 'quarter' ? 'bg-primary' : 'bg-muted'
              }`}></div>
              <span className={`font-medium ${
                state.currentStage === 'quarter' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Quarter Finals
              </span>
            </div>

            <div className="w-full md:w-16 h-0.5 bg-border"></div>

            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                state.currentStage === 'semi' ? 'bg-primary' : 'bg-muted'
              }`}></div>
              <span className={`font-medium ${
                state.currentStage === 'semi' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Semi Finals
              </span>
            </div>

            <div className="w-full md:w-16 h-0.5 bg-border"></div>

            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                state.currentStage === 'final' ? 'bg-primary' : 'bg-muted'
              }`}></div>
              <span className={`font-medium ${
                state.currentStage === 'final' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Final
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Knockout;