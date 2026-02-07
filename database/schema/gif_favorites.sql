-- ============================================
-- GIF FAVORITES TABLE
-- Stores user's favorite GIFs from GIPHY/Tenor
-- ============================================

CREATE TABLE IF NOT EXISTS gif_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gif_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('giphy', 'tenor')),
    gif_url TEXT NOT NULL,
    title TEXT DEFAULT '',
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, gif_id, provider)
);

-- ============================================
-- INDEXES
-- ============================================

-- Index for querying user's favorites
CREATE INDEX IF NOT EXISTS gif_favorites_user_id_idx 
    ON gif_favorites(user_id, created_at DESC);

-- Index for provider filtering
CREATE INDEX IF NOT EXISTS gif_favorites_provider_idx 
    ON gif_favorites(provider);

-- Index for GIF ID lookups
CREATE INDEX IF NOT EXISTS gif_favorites_gif_id_idx 
    ON gif_favorites(gif_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE gif_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
CREATE POLICY "Users can view own favorites"
    ON gif_favorites
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
    ON gif_favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own favorites
CREATE POLICY "Users can update own favorites"
    ON gif_favorites
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
    ON gif_favorites
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gif_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gif_favorites_updated_at
    BEFORE UPDATE ON gif_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_gif_favorites_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE gif_favorites IS 'User favorite GIFs from GIPHY and Tenor';
COMMENT ON COLUMN gif_favorites.user_id IS 'User who favorited the GIF';
COMMENT ON COLUMN gif_favorites.gif_id IS 'GIF ID from provider (GIPHY or Tenor)';
COMMENT ON COLUMN gif_favorites.provider IS 'GIF provider: giphy or tenor';
COMMENT ON COLUMN gif_favorites.gif_url IS 'Direct URL to GIF';
COMMENT ON COLUMN gif_favorites.title IS 'GIF title/description';
COMMENT ON COLUMN gif_favorites.thumbnail_url IS 'Thumbnail/preview URL';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has favorited a GIF
CREATE OR REPLACE FUNCTION is_gif_favorited(
    p_user_id UUID,
    p_gif_id TEXT,
    p_provider TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM gif_favorites
        WHERE user_id = p_user_id
          AND gif_id = p_gif_id
          AND provider = p_provider
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's favorite count
CREATE OR REPLACE FUNCTION get_user_favorites_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    favorite_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO favorite_count
    FROM gif_favorites
    WHERE user_id = p_user_id;
    
    RETURN favorite_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_gif_favorited(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_favorites_count(UUID) TO authenticated;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- To insert sample favorites (run only in development):
-- INSERT INTO gif_favorites (user_id, gif_id, provider, gif_url, title, thumbnail_url)
-- VALUES 
--     ('user-uuid', 'giphy-id-1', 'giphy', 'https://media.giphy.com/...', 'Happy Cat', 'https://...'),
--     ('user-uuid', 'tenor-id-1', 'tenor', 'https://media.tenor.com/...', 'Excited Dog', 'https://...');
