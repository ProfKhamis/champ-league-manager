import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Trophy, Clock, Share } from 'lucide-react';

const FixturesTableSupabase: React.FC = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
        .order('matchday');
      
      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      toast({
        title: "Error loading fixtures",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareToWhatsApp = (match) => {
    const message = `🏆 Champions League Match
${match.team_a?.name} vs ${match.team_b?.name}
${match.group?.name} - Matchday ${match.matchday}
${match.is_completed ? 
  `Score: ${match.team_a_score || 0} - ${match.team_b_score || 0}` : 
  'Fixture scheduled'
}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const groupedMatches = matches.reduce((acc, match) => {
    const groupName = match.group?.name || 'Unknown Group';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(match);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className="champions-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading fixtures...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="champions-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Tournament Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No fixtures generated yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
              <div key={groupName} className="space-y-4">
                <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">
                  {groupName}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold">Match</th>
                        <th className="text-center p-3 font-semibold">Matchday</th>
                        <th className="text-center p-3 font-semibold">Result</th>
                        <th className="text-center p-3 font-semibold">Status</th>
                        <th className="text-center p-3 font-semibold">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(groupMatches as any[]).map((match) => (
                        <tr key={match.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{match.team_a?.name}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="font-medium">{match.team_b?.name}</span>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <Badge variant="outline" className="font-mono">
                              MD{match.matchday}
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            {match.is_completed ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-bold text-lg">
                                  {match.team_a_score || 0}
                                </span>
                                <span className="text-muted-foreground">-</span>
                                <span className="font-bold text-lg">
                                  {match.team_b_score || 0}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">TBD</span>
                            )}
                          </td>
                          <td className="text-center p-3">
                            <Badge 
                              variant={match.is_completed ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {match.is_completed ? (
                                <>
                                  <Trophy className="w-3 h-3" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  Scheduled
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareToWhatsApp(match)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Share className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixturesTableSupabase;