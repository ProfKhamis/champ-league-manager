import React from 'react';
import { Link } from 'react-router-dom';
import { useChampions } from '@/contexts/ChampionsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Award, TrendingUp } from 'lucide-react';
import championLogo from '@/assets/champions-league-logo.png';

const Home: React.FC = () => {
  const { state } = useChampions();

  const totalTeams = state.teams.length;
  const totalMatches = state.matches.length;
  const completedMatches = state.matches.filter(m => m.completed).length;
  const upcomingMatches = totalMatches - completedMatches;

  const getStageStatus = () => {
    switch (state.currentStage) {
      case 'group':
        return 'Group Stage in Progress';
      case 'round16':
        return 'Round of 16';
      case 'quarter':
        return 'Quarter Finals';
      case 'semi':
        return 'Semi Finals';
      case 'final':
        return 'Champions League Final';
      case 'completed':
        return 'Tournament Completed';
      default:
        return 'Tournament Setup';
    }
  };

  const getTopTeamsFromGroups = () => {
    const topTeams: Array<{ name: string; points: number; group: string }> = [];
    
    state.groups.forEach(group => {
      if (group.standings.length > 0) {
        const topTeam = group.standings[0];
        const team = state.teams.find(t => t.id === topTeam.teamId);
        if (team) {
          topTeams.push({
            name: team.name,
            points: topTeam.points,
            group: group.name
          });
        }
      }
    });

    return topTeams.sort((a, b) => b.points - a.points).slice(0, 4);
  };

  const topTeams = getTopTeamsFromGroups();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 champions-card rounded-xl">
        <img 
          src={championLogo} 
          alt="Champions League" 
          className="w-20 h-20 mx-auto mb-6 object-contain"
        />
        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
          Efootball UEFA League
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Professional League Management System
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/groups">
            <Button variant="champions" size="lg">
              <Users className="w-5 h-5" />
              View Groups
            </Button>
          </Link>
          <Link to="/fixtures">
            <Button variant="outline" size="lg">
              <Calendar className="w-5 h-5" />
              Fixtures & Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Tournament Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="champions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournament Stage</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              {getStageStatus()}
            </div>
          </CardContent>
        </Card>

        <Card className="champions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              Across 8 groups
            </p>
          </CardContent>
        </Card>

        <Card className="champions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Played</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">{completedMatches}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingMatches} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="champions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competition Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {state.groupStageCompleted ? 'Knockout stage' : 'Group stage'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Teams */}
      {topTeams.length > 0 && (
        <Card className="champions-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Performing Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topTeams.map((team, index) => (
                <div 
                  key={team.name}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-primary-foreground">{team.name}</p>
                    <p className="text-sm text-muted-foreground">Group {team.group}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{team.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/groups" className="block">
          <Card className="champions-card hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View current group standings and qualification positions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/fixtures" className="block">
          <Card className="champions-card hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fixtures & Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Check upcoming matches and latest results by matchday
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/history" className="block">
          <Card className="champions-card hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Match History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete record of all matches played in the tournament
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Setup Notice */}
      {totalTeams === 0 && (
        <Card className="champions-card border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Tournament Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No teams have been added to the tournament yet. Use the Admin Panel to set up teams and groups.
            </p>
            <Link to="/auth">
              <Button variant="admin">
                Go to Admin Panel
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
