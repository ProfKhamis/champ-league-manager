import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, UserPlus } from "lucide-react";

interface TeamManagementProps {
  teams: any[];
  groups: any[];
  onDataChange: () => void;
}

const TeamManagement = ({ teams, groups, onDataChange }: TeamManagementProps) => {
  const { toast } = useToast();
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

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

      onDataChange();
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

      onDataChange();

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

  return (
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
                    <div key={team.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
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
  );
};

export default TeamManagement;