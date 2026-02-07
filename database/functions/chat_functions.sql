-- ============================================
-- CHAT & MESSAGING RPC FUNCTIONS
-- PostgreSQL functions for JIFFY chat operations
-- ============================================

-- ============================================
-- 1. Get or Create Direct Chat
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_direct_chat(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  chat_id UUID;
BEGIN
  -- Check if direct chat exists between these two users
  SELECT cr.id INTO chat_id
  FROM chat_rooms cr
  JOIN chat_participants cp1 ON cr.id = cp1.chat_id
  JOIN chat_participants cp2 ON cr.id = cp2.chat_id
  WHERE cr.type = 'DIRECT'
    AND cp1.user_id = user1_id
    AND cp2.user_id = user2_id;
  
  -- If chat doesn't exist, create it
  IF chat_id IS NULL THEN
    -- Create new direct chat
    INSERT INTO chat_rooms (type, created_by)
    VALUES ('DIRECT', user1_id)
    RETURNING id INTO chat_id;
    
    -- Add both users as participants
    INSERT INTO chat_participants (chat_id, user_id, role)
    VALUES 
      (chat_id, user1_id, 'MEMBER'),
      (chat_id, user2_id, 'MEMBER');
  END IF;
  
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Create Group Chat
-- ============================================

CREATE OR REPLACE FUNCTION create_group_chat(
  p_creator_id UUID,
  p_group_name TEXT,
  p_member_ids UUID[],
  p_description TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
  v_member_id UUID;
BEGIN
  -- Create group chat room
  INSERT INTO chat_rooms (type, name, description, photo_url, created_by)
  VALUES ('GROUP', p_group_name, p_description, p_photo_url, p_creator_id)
  RETURNING id INTO v_chat_id;
  
  -- Add creator as admin
  INSERT INTO chat_participants (chat_id, user_id, role)
  VALUES (v_chat_id, p_creator_id, 'ADMIN');
  
  -- Add other members as regular members
  FOREACH v_member_id IN ARRAY p_member_ids
  LOOP
    -- Skip if member is the creator (already added)
    IF v_member_id != p_creator_id THEN
      INSERT INTO chat_participants (chat_id, user_id, role)
      VALUES (v_chat_id, v_member_id, 'MEMBER')
      ON CONFLICT DO NOTHING; -- Prevent duplicates
    END IF;
  END LOOP;
  
  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Get User's Chats with Last Message
-- ============================================

CREATE OR REPLACE FUNCTION get_user_chats(p_user_id UUID)
RETURNS TABLE (
  chat_id UUID,
  chat_type TEXT,
  chat_name TEXT,
  chat_photo TEXT,
  chat_description TEXT,
  unread_count BIGINT,
  last_message_id UUID,
  last_message_content TEXT,
  last_message_type TEXT,
  last_message_time TIMESTAMPTZ,
  last_message_sender_id UUID,
  last_message_sender_name TEXT,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id as chat_id,
    cr.type as chat_type,
    -- For direct chats, show other user's name; for groups, show group name
    CASE 
      WHEN cr.type = 'GROUP' THEN cr.name
      ELSE (
        SELECT p.display_name 
        FROM chat_participants cp2
        JOIN profiles p ON cp2.user_id = p.id
        WHERE cp2.chat_id = cr.id 
          AND cp2.user_id != p_user_id
        LIMIT 1
      )
    END as chat_name,
    -- For direct chats, show other user's photo; for groups, show group photo
    CASE 
      WHEN cr.type = 'GROUP' THEN cr.photo_url
      ELSE (
        SELECT p.photo_url 
        FROM chat_participants cp2
        JOIN profiles p ON cp2.user_id = p.id
        WHERE cp2.chat_id = cr.id 
          AND cp2.user_id != p_user_id
        LIMIT 1
      )
    END as chat_photo,
    cr.description as chat_description,
    cp.unread_count,
    m.id as last_message_id,
    m.content as last_message_content,
    m.type as last_message_type,
    m.created_at as last_message_time,
    m.sender_id as last_message_sender_id,
    sender.display_name as last_message_sender_name,
    cr.updated_at
  FROM chat_rooms cr
  JOIN chat_participants cp ON cr.id = cp.chat_id
  LEFT JOIN LATERAL (
    SELECT * FROM messages
    WHERE chat_id = cr.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  LEFT JOIN profiles sender ON m.sender_id = sender.id
  WHERE cp.user_id = p_user_id
  ORDER BY COALESCE(m.created_at, cr.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Mark Messages as Read
-- ============================================

CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_user_id UUID,
  p_chat_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update message status to READ for recipient messages
  UPDATE messages
  SET status = 'READ',
      updated_at = NOW()
  WHERE chat_id = p_chat_id
    AND sender_id != p_user_id
    AND status IN ('SENT', 'DELIVERED');
  
  -- Reset unread count for user in this chat
  UPDATE chat_participants
  SET unread_count = 0,
      last_read_at = NOW()
  WHERE chat_id = p_chat_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Increment Unread Count
-- ============================================

CREATE OR REPLACE FUNCTION increment_unread_count(
  p_chat_id UUID,
  p_sender_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Increment unread count for all participants except sender
  UPDATE chat_participants
  SET unread_count = unread_count + 1
  WHERE chat_id = p_chat_id
    AND user_id != p_sender_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Update Message Status
-- ============================================

CREATE OR REPLACE FUNCTION update_message_status(
  p_message_id UUID,
  p_new_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Get Chat Member Count
-- ============================================

CREATE OR REPLACE FUNCTION get_chat_member_count(p_chat_id UUID)
RETURNS INTEGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM chat_participants
  WHERE chat_id = p_chat_id;
  
  RETURN member_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Check User Is Chat Participant
-- ============================================

CREATE OR REPLACE FUNCTION is_chat_participant(
  p_user_id UUID,
  p_chat_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  is_participant BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM chat_participants
    WHERE user_id = p_user_id
      AND chat_id = p_chat_id
  ) INTO is_participant;
  
  RETURN is_participant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Check User Is Chat Admin
-- ============================================

CREATE OR REPLACE FUNCTION is_chat_admin(
  p_user_id UUID,
  p_chat_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM chat_participants
    WHERE user_id = p_user_id
      AND chat_id = p_chat_id
      AND role = 'ADMIN'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANTS
-- Grant execute permissions to authenticated users
-- ============================================

GRANT EXECUTE ON FUNCTION get_or_create_direct_chat(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_group_chat(UUID, TEXT, UUID[], TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_chats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_unread_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_message_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_member_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_chat_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_chat_admin(UUID, UUID) TO authenticated;

-- ============================================
-- COMMENTS
-- Add descriptions for documentation
-- ============================================

COMMENT ON FUNCTION get_or_create_direct_chat IS 'Get existing or create new direct chat between two users';
COMMENT ON FUNCTION create_group_chat IS 'Create new group chat with multiple members';
COMMENT ON FUNCTION get_user_chats IS 'Get all chats for user with last message details';
COMMENT ON FUNCTION mark_messages_as_read IS 'Mark all messages in chat as read for user';
COMMENT ON FUNCTION increment_unread_count IS 'Increment unread count for all participants except sender';
COMMENT ON FUNCTION update_message_status IS 'Update message delivery status';
COMMENT ON FUNCTION get_chat_member_count IS 'Get total number of members in chat';
COMMENT ON FUNCTION is_chat_participant IS 'Check if user is participant in chat';
COMMENT ON FUNCTION is_chat_admin IS 'Check if user is admin in chat';
