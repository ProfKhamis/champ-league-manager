import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateGroupFixtures } from "@/utils/championsLogic";
import ScoreInputSupabase from "@/components/ScoreInputSupabase";
import FixturesTableSupabase from "@/components/FixturesTableSupabase";
import { Trash2, UserPlus, Zap, Calculator, LogOut, Loader2, Shield } from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Authentication states
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Data states
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);

  // Team management states
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        await loadData();
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load data from Supabase
  const loadData = async () => {
    try {
      // Load groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (groupsError) throw groupsError;
      setGroups(groupsData || []);

      // Load teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Load matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!matches_team_a_id_fkey(name),
          team_b:teams!matches_team_b_id_fkey(name),
          group:groups(name)
        `)
        .order('matchday');
      
      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

    } catch (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Team management handlers
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedGroupId) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if team name already exists
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .ilike('name', newTeamName.trim())
        .single();
      
      if (existingTeam) {
        toast({
          title: "Error",
          description: "A team with this name already exists",
          variant: "destructive",
        });
        return;
      }

      // Check if group has space (max 4 teams per group)
      const { count } = await supabase
        .from('teams')
        .select('id', { count: 'exact' })
        .eq('group_id', selectedGroupId);

      if (count >= 4) {
        toast({
          title: "Error",
          description: "This group already has 4 teams",
          variant: "destructive",
        });
        return;
      }

      // Insert new team
      const { error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName.trim(),
          group_id: selectedGroupId,
        });

      if (error) throw error;

      // Reload data
      await loadData();
      setNewTeamName("");
      setSelectedGroupId("");

      toast({
        title: "Team added",
        description: `${newTeamName.trim()} has been added to the group`,
      });

    } catch (error) {
      toast({
        title: "Error adding team",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      // Reload data
      await loadData();

      toast({
        title: "Team deleted",
        description: "Team and associated matches have been removed",
      });
    } catch (error) {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fixture and score management
  const handleGenerateFixtures = async () => {
    try {
      // Get teams grouped by group
      const groupedTeams = groups.map(group => ({
        ...group,
        teams: teams.filter(team => team.group_id === group.id)
      }));

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

      // Reload data
      await loadData();

      toast({
        title: "Fixtures generated",
        description: `Generated ${newMatches.length} matches`,
      });
    } catch (error) {
      toast({
        title: "Error generating fixtures",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateMatchResult = async (matchId: string, teamAScore: number, teamBScore: number) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          team_a_score: teamAScore,
          team_b_score: teamBScore,
          is_completed: true,
        })
        .eq('id', matchId);

      if (error) throw error;

      // Reload data
      await loadData();
      
      // Recalculate standings would need to be implemented server-side
      // For now, just show success message
      toast({
        title: "Match updated",
        description: "Score has been recorded",
      });
    } catch (error) {
      toast({
        title: "Error updating match",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="champions-glass-effect rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome {user?.email} - Manage tournament teams and fixtures
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Team Management Section */}
        <Card className="champions-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Team Management
            </CardTitle>
            <CardDescription>Add teams to groups and manage tournament participants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Team Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group">Select Group</Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({teams.filter(t => t.group_id === group.id).length}/4)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddTeam} className="w-full" variant="champions">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </div>

            {/* Teams by Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div key={group.id} className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {group.name}
                    <span className="text-sm text-muted-foreground">
                      ({teams.filter(t => t.group_id === group.id).length}/4)
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {teams
                      .filter(team => team.group_id === group.id)
                      .map(team => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{team.name}</span>
                          <Button
                            onClick={() => handleDeleteTeam(team.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fixture Management Section */}
        <Card className="champions-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Fixture Management
            </CardTitle>
            <CardDescription>Generate fixtures and manage tournament schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button onClick={handleGenerateFixtures} variant="champions" className="flex-1 max-w-xs">
                <Zap className="w-4 h-4 mr-2" />
                Generate Fixtures
              </Button>
              <Button 
                onClick={loadData} 
                variant="secondary"
                className="flex-1 max-w-xs"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total Matches: {matches.length}</p>
              <p>Completed: {matches.filter(m => m.is_completed).length}</p>
              <p>Remaining: {matches.filter(m => !m.is_completed).length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Score Input Section */}
        <ScoreInputSupabase />

        {/* Fixtures Table Section */}
        <FixturesTableSupabase />
      </div>
    </div>
  );
};

export default Admin;