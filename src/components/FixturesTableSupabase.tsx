import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Trophy, Clock, Share, Download, Image } from 'lucide-react';
import html2canvas from 'html2canvas';

const FixturesTableSupabase: React.FC = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchday, setSelectedMatchday] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const tableRef = useRef<HTMLDivElement>(null);

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

  const generatePNGAndShare = async () => {
    if (!tableRef.current) return;
    
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: tableRef.current.scrollWidth,
        height: tableRef.current.scrollHeight,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${getTableTitle()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          // Also prepare for WhatsApp
          const message = `🏆 Champions League Fixtures - ${getTableTitle()}`;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          
          toast({
            title: "Fixtures downloaded!",
            description: "PNG saved. Opening WhatsApp to share...",
          });
          
          setTimeout(() => {
            window.open(whatsappUrl, '_blank');
          }, 1000);
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Error generating image",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTableTitle = () => {
    if (selectedMatchday !== "all" && selectedGroup !== "all") {
      return `${selectedGroup} - Matchday ${selectedMatchday} Fixtures`;
    } else if (selectedMatchday !== "all") {
      return `Matchday ${selectedMatchday} Fixtures`;
    } else if (selectedGroup !== "all") {
      return `${selectedGroup} Fixtures`;
    }
    return "Tournament Fixtures";
  };

  const filteredMatches = matches.filter(match => {
    const matchdayFilter = selectedMatchday === "all" || match.matchday.toString() === selectedMatchday;
    const groupFilter = selectedGroup === "all" || match.group?.name === selectedGroup;
    return matchdayFilter && groupFilter;
  });

  const uniqueMatchdays = [...new Set(matches.map(m => m.matchday))].sort((a, b) => a - b);
  const uniqueGroups = [...new Set(matches.map(m => m.group?.name).filter(Boolean))].sort();

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
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No fixtures generated yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matchday</label>
                  <Select value={selectedMatchday} onValueChange={setSelectedMatchday}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {uniqueMatchdays.map(md => (
                        <SelectItem key={md} value={md.toString()}>MD {md}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group</label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {uniqueGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={generatePNGAndShare} 
                variant="champions"
                className="gap-2"
                disabled={filteredMatches.length === 0}
              >
                <Image className="w-4 h-4" />
                Share PNG
              </Button>
            </div>

            {/* Fixtures Table */}
            {filteredMatches.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No fixtures match the selected filters</p>
              </div>
            ) : (
              <div ref={tableRef} className="bg-white p-6 rounded-lg border">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                  {getTableTitle()}
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          Home
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                          Away
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMatches.map((match, index) => (
                        <tr key={match.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-300 px-4 py-3 text-center text-gray-900 font-medium">
                            {match.team_a?.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-gray-900 font-medium">
                            {match.team_b?.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Group and Matchday info */}
                {selectedGroup !== "all" || selectedMatchday !== "all" ? (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {selectedGroup !== "all" && <span>{selectedGroup}</span>}
                    {selectedGroup !== "all" && selectedMatchday !== "all" && <span> • </span>}
                    {selectedMatchday !== "all" && <span>Matchday {selectedMatchday}</span>}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixturesTableSupabase;