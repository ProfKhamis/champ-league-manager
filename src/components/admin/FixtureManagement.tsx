import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateGroupFixtures } from "@/utils/championsLogic";
import { Zap, Calculator, TrendingUp } from "lucide-react";

interface FixtureManagementProps {
  groups: any[];
  teams: any[];
  matches: any[];
  onDataChange: () => void;
}

const FixtureManagement = ({ groups, teams, matches, onDataChange }: FixtureManagementProps) => {
  const { toast } = useToast();

  const handleGenerateFixtures = async () => {
    try {
      // Get teams grouped by group
      const groupedTeams = groups.map(group => ({
        ...group,
        teams: teams.filter(team => team.group_id === group.id)
      }));

      // Check if all groups have enough teams
      const incompleteGroups = groupedTeams.filter(group => group.teams.length < 2);
      if (incompleteGroups.length > 0) {
        toast({
          title: "Cannot generate fixtures",
          description: `Groups need at least 2 teams. Check: ${incompleteGroups.map(g => g.name).join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      const newMatches = generateGroupFixtures(groupedTeams);

      // Insert matches into database
      const matchesForDB = newMatches.map(match => ({
        team_a_id: match.homeTeam,
        team_b_id: match.awayTeam,
        group_id: groups.find(g => g.name === match.group)?.id,
        matchday: match.matchday,
      }));

      const { error } = await supabase
        .from('matches')
        .insert(matchesForDB);

      if (error) throw error;

      onDataChange();

      toast({
        title: "Fixtures generated",
        description: `Generated ${newMatches.length} matches across ${groups.length} groups`,
      });
    } catch (error) {
      toast({
        title: "Error generating fixtures",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completedMatches = matches.filter(m => m.is_completed).length;
  const remainingMatches = matches.filter(m => !m.is_completed).length;
  const completionPercentage = matches.length > 0 ? Math.round((completedMatches / matches.length) * 100) : 0;

  return (
    <Card className="champions-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Fixture Management
        </CardTitle>
        <CardDescription>Generate fixtures and manage tournament schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGenerateFixtures} 
              variant="champions" 
              className="w-full gap-2"
              disabled={teams.length === 0}
            >
              <Zap className="w-4 h-4" />
              Generate Fixtures
            </Button>
            <Button 
              onClick={onDataChange} 
              variant="secondary"
              className="w-full gap-2"
            >
              <Calculator className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
          
          {/* Tournament Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
                <div className="text-xs text-muted-foreground">Total Matches</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedMatches}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{remainingMatches}</div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tournament Progress</span>
              <span>{completionPercentage}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixtureManagement;