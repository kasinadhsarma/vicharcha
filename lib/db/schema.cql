-- Stories table to store story metadata
CREATE TABLE IF NOT EXISTS stories (
  id bigint PRIMARY KEY,
  user_id text,
  username text,
  user_image text,
  media_url text,
  type text,
  duration int,
  is_viewed boolean,
  is_premium boolean,
  expires_at timestamp,
  created_at timestamp,
  downloadable boolean,
  is_adult boolean,
  category text
);

-- Story items table to store individual media items in a story
CREATE TABLE IF NOT EXISTS story_items (
  id text,
  story_id bigint,
  url text,
  type text,
  duration int,
  PRIMARY KEY ((story_id), id)
);

-- Story views table to track who viewed which stories
CREATE TABLE IF NOT EXISTS story_views (
  story_id bigint,
  user_id text,
  viewed_at timestamp,
  PRIMARY KEY ((story_id), user_id)
);

-- Story likes table for engagement metrics
CREATE TABLE IF NOT EXISTS story_likes (
  story_id bigint,
  user_id text,
  created_at timestamp,
  PRIMARY KEY ((story_id), user_id)
);

-- Story reactions table for more detailed engagement
CREATE TABLE IF NOT EXISTS story_reactions (
  story_id bigint,
  user_id text,
  reaction_type text,
  created_at timestamp,
  PRIMARY KEY ((story_id), user_id)
);