-- ============================================
-- GIF FAVORITES SCHEMA
-- Stores user's favorite GIFs from GIPHY/Tenor
-- ============================================

-- Create gif_favorites table
CREATE TABLE IF NOT EXISTS gif_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gif_id TEXT NOT NULL,
    gif_url TEXT NOT NULL,
    title TEXT,
    source TEXT NOT NULL CHECK (source IN ('giphy', 'tenor')),
    preview_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, gif_id, source)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS gif_favorites_user_id_idx ON gif_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gif_favorites_source_idx ON gif_favorites(source);

-- Enable Row Level Security
ALTER TABLE gif_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view only their own favorites
CREATE POLICY "Users can view own favorites"
    ON gif_favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
    ON gif_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
    ON gif_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE gif_favorites IS 'Stores user favorite GIFs from GIPHY and Tenor';
COMMENT ON COLUMN gif_favorites.gif_id IS 'GIF ID from provider (GIPHY or Tenor)';
COMMENT ON COLUMN gif_favorites.source IS 'Provider source: giphy or tenor';
COMMENT ON COLUMN gif_favorites.preview_url IS 'Preview/thumbnail URL for quick loading';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get favorite count for user
CREATE OR REPLACE FUNCTION get_user_favorite_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    fav_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fav_count
    FROM gif_favorites
    WHERE user_id = p_user_id;
    
    RETURN fav_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_favorite_count TO authenticated;

COMMENT ON FUNCTION get_user_favorite_count IS 'Get total number of favorites for a user';
