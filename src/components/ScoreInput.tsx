import React, { useState } from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Clock } from 'lucide-react';

const ScoreInput: React.FC = () => {
  const { state, dispatch } = useChampions();
  const [selectedHomeTeam, setSelectedHomeTeam] = useState('');
  const [selectedAwayTeam, setSelectedAwayTeam] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const availableTeams = state.teams.filter(team => 
    team.id !== selectedHomeTeam && team.id !== selectedAwayTeam
  );

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : '';
  };

  const getTeamGroup = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.group : '';
  };

  const handleSubmitScore = () => {
    if (!selectedHomeTeam || !selectedAwayTeam || homeScore === '' || awayScore === '') {
      alert('Please select both teams and enter scores');
      return;
    }

    // Find existing match between these teams
    const existingMatch = state.matches.find(m => 
      (m.homeTeam === selectedHomeTeam && m.awayTeam === selectedAwayTeam) ||
      (m.homeTeam === selectedAwayTeam && m.awayTeam === selectedHomeTeam)
    );

    if (existingMatch) {
      // Update existing match
      const updatedMatch = {
        ...existingMatch,
        homeTeam: selectedHomeTeam,
        awayTeam: selectedAwayTeam,
        homeScore: parseInt(homeScore) || 0,
        awayScore: parseInt(awayScore) || 0,
        completed: true,
      };

      const updatedMatches = state.matches.map(m => 
        m.id === existingMatch.id ? updatedMatch : m
      );

      dispatch({ type: 'UPDATE_MATCHES', payload: updatedMatches });
    } else {
      // Create new match
      const homeTeam = state.teams.find(t => t.id === selectedHomeTeam);
      const awayTeam = state.teams.find(t => t.id === selectedAwayTeam);
      
      if (!homeTeam || !awayTeam || homeTeam.group !== awayTeam.group) {
        alert('Teams must be from the same group');
        return;
      }

      const newMatch = {
        id: Date.now().toString(),
        homeTeam: selectedHomeTeam,
        awayTeam: selectedAwayTeam,
        homeScore: parseInt(homeScore) || 0,
        awayScore: parseInt(awayScore) || 0,
        matchday: 1,
        stage: 'group' as const,
        group: homeTeam.group,
        completed: true,
      };

      const updatedMatches = [...state.matches, newMatch];
      dispatch({ type: 'UPDATE_MATCHES', payload: updatedMatches });
    }

    dispatch({ type: 'RECALCULATE_STANDINGS' });
    
    // Reset form
    setSelectedHomeTeam('');
    setSelectedAwayTeam('');
    setHomeScore('');
    setAwayScore('');
  };

  return (
    <Card className="champions-card score-input-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Quick Score Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="homeTeam" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Home Team
            </Label>
            <Select value={selectedHomeTeam} onValueChange={setSelectedHomeTeam}>
              <SelectTrigger className="score-select">
                <SelectValue placeholder="Select home team" />
              </SelectTrigger>
              <SelectContent>
                {state.teams.filter(t => t.id !== selectedAwayTeam).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Group {team.group}
                      </Badge>
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="awayTeam" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Away Team
            </Label>
            <Select value={selectedAwayTeam} onValueChange={setSelectedAwayTeam}>
              <SelectTrigger className="score-select">
                <SelectValue placeholder="Select away team" />
              </SelectTrigger>
              <SelectContent>
                {state.teams.filter(t => t.id !== selectedHomeTeam).map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Group {team.group}
                      </Badge>
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Match Preview */}
        {selectedHomeTeam && selectedAwayTeam && (
          <div className="match-preview">
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <div className="text-center">
                <div className="font-semibold text-lg">{getTeamName(selectedHomeTeam)}</div>
                <Badge variant="outline" className="mt-1">
                  Group {getTeamGroup(selectedHomeTeam)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="font-semibold text-lg">{getTeamName(selectedAwayTeam)}</div>
                <Badge variant="outline" className="mt-1">
                  Group {getTeamGroup(selectedAwayTeam)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Score Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeScore">
              {selectedHomeTeam ? getTeamName(selectedHomeTeam) : 'Home'} Score
            </Label>
            <Input
              id="homeScore"
              type="number"
              min="0"
              max="20"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              className="score-input text-center text-2xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayScore">
              {selectedAwayTeam ? getTeamName(selectedAwayTeam) : 'Away'} Score
            </Label>
            <Input
              id="awayScore"
              type="number"
              min="0"
              max="20"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              className="score-input text-center text-2xl font-bold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitScore}
          className="w-full champions-button h-12 text-lg"
          disabled={!selectedHomeTeam || !selectedAwayTeam || homeScore === '' || awayScore === ''}
        >
          <Target className="w-5 h-5 mr-2" />
          Submit Match Result
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScoreInput;