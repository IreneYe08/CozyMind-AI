-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('before', 'before', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('after', 'after', true);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  budget INTEGER,
  size TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own results
CREATE POLICY "Users can view own results" ON results
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own results
CREATE POLICY "Users can insert own results" ON results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own results
CREATE POLICY "Users can update own results" ON results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own results
CREATE POLICY "Users can delete own results" ON results
  FOR DELETE USING (auth.uid() = user_id);

