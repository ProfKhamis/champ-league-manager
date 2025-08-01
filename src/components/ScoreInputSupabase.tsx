import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Target, Trophy, Clock } from 'lucide-react';

const ScoreInputSupabase: React.FC = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!matches_team_a_id_fkey(name),
          team_b:teams!matches_team_b_id_fkey(name),
          group:groups(name)
        `)
        .eq('is_completed', false)
        .order('matchday');
      
      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitScore = async () => {
    if (!selectedMatchId || teamAScore === '' || teamBScore === '') {
      toast({
        title: "Incomplete data",
        description: "Please select a match and enter both scores",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          team_a_score: parseInt(teamAScore) || 0,
          team_b_score: parseInt(teamBScore) || 0,
          is_completed: true,
        })
        .eq('id', selectedMatchId);

      if (error) throw error;

      // Reload matches
      await loadMatches();
      
      // Reset form
      setSelectedMatchId('');
      setTeamAScore('');
      setTeamBScore('');

      toast({
        title: "Score updated",
        description: "Match result has been recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error updating score",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <Card className="champions-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Score Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Selection */}
        <div className="space-y-2">
          <Label htmlFor="match">Select Match</Label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a match to update" />
            </SelectTrigger>
            <SelectContent>
              {matches.map(match => (
                <SelectItem key={match.id} value={match.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {match.group?.name}
                    </Badge>
                    <span>{match.team_a?.name} vs {match.team_b?.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      MD{match.matchday}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Match Preview */}
        {selectedMatch && (
          <div className="match-preview">
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <div className="text-center">
                <div className="font-semibold text-lg">{selectedMatch.team_a?.name}</div>
                <Badge variant="outline" className="mt-1">
                  {selectedMatch.group?.name}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="font-semibold text-lg">{selectedMatch.team_b?.name}</div>
                <Badge variant="outline" className="mt-1">
                  {selectedMatch.group?.name}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Score Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teamAScore" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              {selectedMatch ? selectedMatch.team_a?.name : 'Team A'} Score
            </Label>
            <Input
              id="teamAScore"
              type="number"
              min="0"
              max="20"
              value={teamAScore}
              onChange={(e) => setTeamAScore(e.target.value)}
              placeholder="0"
              className="text-center text-2xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamBScore" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {selectedMatch ? selectedMatch.team_b?.name : 'Team B'} Score
            </Label>
            <Input
              id="teamBScore"
              type="number"
              min="0"
              max="20"
              value={teamBScore}
              onChange={(e) => setTeamBScore(e.target.value)}
              placeholder="0"
              className="text-center text-2xl font-bold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitScore}
          className="w-full champions-button h-12 text-lg"
          disabled={!selectedMatchId || teamAScore === '' || teamBScore === ''}
        >
          <Target className="w-5 h-5 mr-2" />
          Submit Match Result
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScoreInputSupabase;