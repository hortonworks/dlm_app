ALTER TABLE dataplane.datasets ADD sharedstatus SMALLINT DEFAULT 1;   -- enum 1 - Public, 2 - Private

CREATE TABLE IF NOT EXISTS dataplane.comments (
  id           BIGSERIAL PRIMARY KEY,
  comment      TEXT,
  object_type  VARCHAR(255)                                           NOT NULL,
  object_id    BIGINT                                                 NOT NULL,
  createdby    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,
  createdon    TIMESTAMP DEFAULT now(),
  lastmodified TIMESTAMP DEFAULT now(),
  parent_comment_id  BIGINT REFERENCES dataplane.comments(id)         ON DELETE CASCADE DEFAULT NULL,
  number_of_replies BIGINT DEFAULT 0,
  edit_version BIGINT DEFAULT 0
);

--Index on comments table
CREATE INDEX idx_dp_comments_parent_id on dataplane.comments(parent_comment_id);

CREATE TABLE IF NOT EXISTS dataplane.ratings (
  id           BIGSERIAL PRIMARY KEY,
  rating       DECIMAL(2,1)                                           NOT NULL,
  object_type  VARCHAR(255)                                           NOT NULL,
  object_id    BIGINT                                                 NOT NULL,
  createdby    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,

  CONSTRAINT unique_creator_objId_objType_constraint UNIQUE (createdby, object_id,object_type)
);

CREATE TABLE IF NOT EXISTS dataplane.favourites (
  id           BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,
  dataset_id BIGINT REFERENCES dataplane.datasets(id)             NOT NULL,

  CONSTRAINT fav_unique_userId_datasetId_constraint UNIQUE (user_id, dataset_id)
);

--Index on favourites table
CREATE INDEX idx_dp_favourites_user_id on dataplane.favourites(user_id);

CREATE TABLE IF NOT EXISTS dataplane.bookmarks (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,
  dataset_id BIGINT REFERENCES dataplane.datasets(id)             NOT NULL,

  CONSTRAINT bm_unique_userId_datasetId_constraint UNIQUE (user_id, dataset_id)
);

--Index on bookmarks table
CREATE INDEX idx_dp_bookmarks_user_id on dataplane.bookmarks(user_id);
