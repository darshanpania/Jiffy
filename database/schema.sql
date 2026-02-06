-- JIFFY Database Schema for Supabase PostgreSQL
-- Complete schema with Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL CHECK (char_length(display_name) >= 3 AND char_length(display_name) <= 30),
    photo_url TEXT,
    bio TEXT CHECK (char_length(bio) <= 150),
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_online ON profiles(is_online);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FRIEND REQUESTS TABLE
-- ============================================
CREATE TABLE friend_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their requests"
ON friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
ON friend_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests"
ON friend_requests FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
ON friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);

-- Trigger to create friendship when request accepted
CREATE OR REPLACE FUNCTION create_friendship_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN
        INSERT INTO friendships (user_id, friend_id)
        VALUES 
            (NEW.sender_id, NEW.receiver_id),
            (NEW.receiver_id, NEW.sender_id)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_request_accepted
AFTER UPDATE ON friend_requests
FOR EACH ROW EXECUTE FUNCTION create_friendship_on_accept();

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
CREATE TABLE chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('DIRECT', 'GROUP')),
    name TEXT,
    description TEXT,
    photo_url TEXT,
    created_by UUID REFERENCES auth.users,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chats"
ON chat_rooms FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_id = id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create chats"
ON chat_rooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- ============================================
-- CHAT PARTICIPANTS TABLE
-- ============================================
CREATE TABLE chat_participants (
    chat_id UUID REFERENCES chat_rooms ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INT DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    PRIMARY KEY (chat_id, user_id)
);

ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat participants"
ON chat_participants FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid()
    )
);

CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chat_rooms ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 5000),
    type TEXT NOT NULL CHECK (type IN ('TEXT', 'GIF', 'IMAGE')),
    status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES messages(id)
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Trigger to update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_participants
    SET unread_count = unread_count + 1
    WHERE chat_id = NEW.chat_id AND user_id != NEW.sender_id;
    
    UPDATE chat_rooms
    SET updated_at = NEW.created_at
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_sent_update_unread
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_unread_count();

-- ============================================
-- FAVORITE GIFS TABLE
-- ============================================
CREATE TABLE favorite_gifs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    gif_id TEXT NOT NULL,
    gif_url TEXT NOT NULL,
    gif_source TEXT NOT NULL CHECK (gif_source IN ('GIPHY', 'TENOR')),
    title TEXT,
    preview_url TEXT,
    thumbnail_url TEXT,
    width INT,
    height INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, gif_id, gif_source)
);

ALTER TABLE favorite_gifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON favorite_gifs FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_favorite_gifs_user ON favorite_gifs(user_id, created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get or create direct chat between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_chat(
    user1_id UUID,
    user2_id UUID
)
RETURNS UUID AS $$
DECLARE
    existing_chat_id UUID;
    new_chat_id UUID;
BEGIN
    -- Check if chat exists
    SELECT cp1.chat_id INTO existing_chat_id
    FROM chat_participants cp1
    INNER JOIN chat_participants cp2 ON cp1.chat_id = cp2.chat_id
    INNER JOIN chat_rooms cr ON cr.id = cp1.chat_id
    WHERE cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND cr.type = 'DIRECT'
    AND (SELECT COUNT(*) FROM chat_participants WHERE chat_id = cp1.chat_id) = 2;
    
    IF existing_chat_id IS NOT NULL THEN
        RETURN existing_chat_id;
    END IF;
    
    -- Create new chat
    INSERT INTO chat_rooms (type, created_by)
    VALUES ('DIRECT', user1_id)
    RETURNING id INTO new_chat_id;
    
    -- Add participants
    INSERT INTO chat_participants (chat_id, user_id) VALUES
        (new_chat_id, user1_id),
        (new_chat_id, user2_id);
    
    RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql;

-- Get user's chats with last message
CREATE OR REPLACE FUNCTION get_user_chats(p_user_id UUID)
RETURNS TABLE (
    chat_id UUID,
    chat_type TEXT,
    chat_name TEXT,
    chat_photo_url TEXT,
    last_message JSONB,
    unread_count INT,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id as chat_id,
        cr.type as chat_type,
        COALESCE(cr.name, other_profile.display_name) as chat_name,
        COALESCE(cr.photo_url, other_profile.photo_url) as chat_photo_url,
        (SELECT row_to_json(m.*) FROM messages m 
         WHERE m.chat_id = cr.id 
         ORDER BY m.created_at DESC LIMIT 1) as last_message,
        COALESCE(cp.unread_count, 0) as unread_count,
        cr.updated_at
    FROM chat_rooms cr
    INNER JOIN chat_participants cp ON cp.chat_id = cr.id
    LEFT JOIN chat_participants other_cp ON other_cp.chat_id = cr.id AND other_cp.user_id != p_user_id
    LEFT JOIN profiles other_profile ON other_profile.id = other_cp.user_id
    WHERE cp.user_id = p_user_id
    ORDER BY cr.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
