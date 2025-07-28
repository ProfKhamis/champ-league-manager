import React, { useState, useEffect } from 'react';
import { useChampions } from '@/contexts/ChampionsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Settings, 
  Users, 
  Plus, 
  Calendar, 
  Trophy,
  Lock,
  LogOut,
  Trash2,
  Edit,
  Save
} from 'lucide-react';
import { 
  saveAdminSession, 
  getAdminSession, 
  clearAdminSession 
} from '@/utils/localStorage';
import { generateGroupFixtures } from '@/utils/championsLogic';
import { Team, Match } from '@/types/champions';
import ScoreInput from '@/components/ScoreInput';
import FixturesTable from '@/components/FixturesTable';

const Admin: React.FC = () => {
  const { state, dispatch } = useChampions();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Team management
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Match management
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    setIsLoggedIn(getAdminSession());
  }, []);

  const handleLogin = () => {
    if (username === 'Prof' && password === 'prof') {
      setIsLoggedIn(true);
      saveAdminSession(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid credentials. Toka Hapa 😂');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    clearAdminSession();
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;

    // Check for duplicate team name
    const existingTeam = state.teams.find(t => 
      t.name.toLowerCase() === newTeamName.trim().toLowerCase()
    );
    if (existingTeam) {
      alert('A team with this name already exists!');
      return;
    }

    const group = state.groups.find(g => g.name === selectedGroup);
    if (!group || group.teams.length >= 4) {
      alert('Group is full or not found');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      group: selectedGroup,
    };

    const updatedTeams = [...state.teams, newTeam];
    const updatedGroups = state.groups.map(g => 
      g.name === selectedGroup 
        ? { ...g, teams: [...g.teams, newTeam] }
        : g
    );

    dispatch({ type: 'UPDATE_TEAMS', payload: updatedTeams });
    dispatch({ type: 'UPDATE_GROUPS', payload: updatedGroups });

    setNewTeamName('');
  };

  const handleDeleteTeam = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedTeams = state.teams.filter(t => t.id !== teamId);
    const updatedGroups = state.groups.map(g => ({
      ...g,
      teams: g.teams.filter(t => t.id !== teamId)
    }));

    // Remove matches involving this team
    const updatedMatches = state.matches.filter(
      m => m.homeTeam !== teamId && m.awayTeam !== teamId
    );

    dispatch({ type: 'UPDATE_TEAMS', payload: updatedTeams });
    dispatch({ type: 'UPDATE_GROUPS', payload: updatedGroups });
    dispatch({ type: 'UPDATE_MATCHES', payload: updatedMatches });
  };

  const handleGenerateFixtures = () => {
    const fixtures = generateGroupFixtures(state.groups);
    dispatch({ type: 'UPDATE_MATCHES', payload: fixtures });
  };

  const handleUpdateMatchResult = () => {
    if (!editingMatch) return;

    const updatedMatch = {
      ...editingMatch,
      homeScore: parseInt(homeScore) || 0,
      awayScore: parseInt(awayScore) || 0,
      completed: true,
    };

    const updatedMatches = state.matches.map(m => 
      m.id === editingMatch.id ? updatedMatch : m
    );

    dispatch({ type: 'UPDATE_MATCHES', payload: updatedMatches });
    dispatch({ type: 'RECALCULATE_STANDINGS' });

    setEditingMatch(null);
    setHomeScore('');
    setAwayScore('');
  };

  const getTeamName = (teamId: string) => {
    const team = state.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="champions-card w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {loginError && (
              <p className="text-destructive text-sm">{loginError}</p>
            )}
            <Button 
              onClick={handleLogin} 
              className="w-full champions-button"
            >
              Login
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p>Username: <strong>Prof</strong></p>
              <p>Password: <strong>prof</strong></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage teams, fixtures, and tournament settings
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Team Management */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Team */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="group">Group</Label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {['A', 'B', 'C', 'D', 'E', 'F'].map(group => (
                  <option key={group} value={group}>Group {group}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTeam} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </div>
          </div>

          {/* Teams List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['A', 'B', 'C', 'D', 'E', 'F'].map(groupName => {
              const group = state.groups.find(g => g.name === groupName);
              const teams = group?.teams || [];
              
              return (
                <div key={groupName} className="space-y-2">
                  <h3 className="font-semibold">Group {groupName} ({teams.length}/4)</h3>
                  <div className="space-y-2">
                    {teams.map(team => (
                      <div 
                        key={team.id}
                        className="flex items-center justify-between p-2 bg-secondary rounded"
                      >
                        <span className="text-sm">{team.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fixture Management */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Fixture Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleGenerateFixtures}
              variant="champions"
            >
              Generate Group Fixtures
            </Button>
            <Button 
              onClick={() => dispatch({ type: 'RECALCULATE_STANDINGS' })}
              variant="outline"
            >
              Recalculate Standings
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Total Matches: {state.matches.length}</p>
            <p>Completed: {state.matches.filter(m => m.completed).length}</p>
            <p>Remaining: {state.matches.filter(m => !m.completed).length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Score Input */}
      <ScoreInput />

      {/* Fixtures Table */}
      <Card className="champions-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            All Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FixturesTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
