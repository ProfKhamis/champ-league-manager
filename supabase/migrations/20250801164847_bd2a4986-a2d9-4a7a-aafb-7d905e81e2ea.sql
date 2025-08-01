-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  team_a_score INTEGER,
  team_b_score INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  matchday INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (tournament data should be viewable by everyone)
CREATE POLICY "Groups are viewable by everyone" 
ON public.groups 
FOR SELECT 
USING (true);

CREATE POLICY "Teams are viewable by everyone" 
ON public.teams 
FOR SELECT 
USING (true);

CREATE POLICY "Matches are viewable by everyone" 
ON public.matches 
FOR SELECT 
USING (true);

-- Admin-only policies for modifications (only authenticated users can modify)
CREATE POLICY "Only authenticated users can insert groups" 
ON public.groups 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update groups" 
ON public.groups 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete groups" 
ON public.groups 
FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can insert teams" 
ON public.teams 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update teams" 
ON public.teams 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete teams" 
ON public.teams 
FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can insert matches" 
ON public.matches 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update matches" 
ON public.matches 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete matches" 
ON public.matches 
FOR DELETE 
TO authenticated
USING (true);

-- Insert initial groups (A through F)
INSERT INTO public.groups (name) VALUES 
('Group A'),
('Group B'), 
('Group C'),
('Group D'),
('Group E'),
('Group F');