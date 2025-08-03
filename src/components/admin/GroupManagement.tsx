import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Plus, Trash2, AlertTriangle } from "lucide-react";

interface GroupManagementProps {
  groups: any[];
  teams: any[];
  onDataChange: () => void;
}

const GroupManagement = ({ groups, teams, onDataChange }: GroupManagementProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(groups.length.toString());
  const [isLoading, setIsLoading] = useState(false);

  const generateGroupNames = (count: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: count }, (_, i) => `Group ${letters[i]}`);
  };

  const handleUpdateGroups = async () => {
    const newCount = parseInt(numberOfGroups);
    
    if (newCount < 1 || newCount > 26) {
      toast({
        title: "Invalid number",
        description: "Please enter a number between 1 and 26",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const currentCount = groups.length;
      
      if (newCount > currentCount) {
        // Add new groups
        const newGroupNames = generateGroupNames(newCount).slice(currentCount);
        const newGroups = newGroupNames.map(name => ({ name }));
        
        const { error } = await supabase
          .from('groups')
          .insert(newGroups);
          
        if (error) throw error;
        
        toast({
          title: "Groups added",
          description: `Added ${newCount - currentCount} new groups`,
        });
      } else if (newCount < currentCount) {
        // Check if groups to be removed have teams
        const groupsToRemove = groups.slice(newCount);
        const hasTeams = groupsToRemove.some(group => 
          teams.some(team => team.group_id === group.id)
        );
        
        if (hasTeams) {
          toast({
            title: "Cannot remove groups",
            description: "Some groups contain teams. Please remove teams first.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Remove excess groups
        const groupIdsToRemove = groupsToRemove.map(g => g.id);
        const { error } = await supabase
          .from('groups')
          .delete()
          .in('id', groupIdsToRemove);
          
        if (error) throw error;
        
        toast({
          title: "Groups removed",
          description: `Removed ${currentCount - newCount} groups`,
        });
      }
      
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error updating groups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="champions-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Group Configuration
        </CardTitle>
        <CardDescription>
          Manage tournament groups and structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Current groups: {groups.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total teams: {teams.length}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Configure Groups
              </Button>
            </DialogTrigger>
            <DialogContent className="champions-glass-effect border-primary/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Configure Tournament Groups
                </DialogTitle>
                <DialogDescription>
                  Choose how many groups your tournament should have. Groups will be named A, B, C, etc.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="groupCount">Number of Groups</Label>
                  <Select value={numberOfGroups} onValueChange={setNumberOfGroups}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of groups" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-primary/20">
                      {Array.from({ length: 26 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Group{num !== 1 ? 's' : ''} ({generateGroupNames(num).slice(0, 3).join(', ')}{num > 3 ? '...' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {parseInt(numberOfGroups) < groups.length && (
                  <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-500">Warning</p>
                      <p className="text-muted-foreground">
                        Reducing groups will remove excess groups. Make sure they don't contain teams.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateGroups}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>Updating...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Update Groups
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-lg text-center"
            >
              <div className="font-semibold text-sm">{group.name}</div>
              <div className="text-xs text-muted-foreground">
                {teams.filter(t => t.group_id === group.id).length} teams
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupManagement;