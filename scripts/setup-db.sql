-- Create compilation_history table
CREATE TABLE IF NOT EXISTS compilation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code_input TEXT NOT NULL,
  
  -- Lexical Analysis Phase 1
  tokens JSONB,
  
  -- Syntax Analysis Phase 2
  ast JSONB,
  syntax_errors JSONB,
  
  -- Semantic Analysis Phase 3
  symbol_table JSONB,
  semantic_errors JSONB,
  
  -- Intermediate Code Generation Phase 4
  intermediate_code JSONB,
  
  -- Optimization Phase 5
  optimized_code JSONB,
  optimization_stats JSONB,
  
  -- Code Generation Phase 6
  generated_code JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_bookmarked BOOLEAN DEFAULT FALSE,
  bookmark_name TEXT,
  
  CONSTRAINT code_not_empty CHECK (CHAR_LENGTH(code_input) > 0)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  compilation_id UUID REFERENCES compilation_history(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_compilation UNIQUE (user_id, compilation_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_compilation_history_user_id ON compilation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_compilation_history_created_at ON compilation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compilation_history_is_bookmarked ON compilation_history(is_bookmarked);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_compilation_id ON bookmarks(compilation_id);

-- Enable Row Level Security
ALTER TABLE compilation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for compilation_history
CREATE POLICY "Users can view their own compilation history"
  ON compilation_history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own compilations"
  ON compilation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compilations"
  ON compilation_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compilations"
  ON compilation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
