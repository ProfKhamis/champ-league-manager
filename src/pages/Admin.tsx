import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ScoreInputSupabase from "@/components/ScoreInputSupabase";
import FixturesTableSupabase from "@/components/FixturesTableSupabase";
import TeamManagement from "@/components/admin/TeamManagement";
import GroupManagement from "@/components/admin/GroupManagement";
import FixtureManagement from "@/components/admin/FixtureManagement";
import { LogOut, Loader2, Shield } from "lucide-react";

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

        {/* Group Configuration */}
        <GroupManagement 
          groups={groups} 
          teams={teams} 
          onDataChange={loadData} 
        />

        {/* Team Management */}
        <TeamManagement 
          teams={teams} 
          groups={groups} 
          onDataChange={loadData} 
        />

        {/* Fixture Management */}
        <FixtureManagement 
          groups={groups} 
          teams={teams} 
          matches={matches} 
          onDataChange={loadData} 
        />

        {/* Score Input Section */}
        <ScoreInputSupabase />

        {/* Fixtures Table Section */}
        <FixturesTableSupabase />
      </div>
    </div>
  );
};

export default Admin;