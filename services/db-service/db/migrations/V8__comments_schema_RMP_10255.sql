ALTER TABLE dataplane.datasets ADD sharedstatus SMALLINT DEFAULT 1;   -- enum 1 - Public, 2 - Private

CREATE TABLE IF NOT EXISTS dataplane.comments (
  id           BIGSERIAL PRIMARY KEY,
  comment      TEXT,
  object_type  VARCHAR(255)                                           NOT NULL,
  object_id    BIGINT                                                 NOT NULL,
  createdby    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,
  createdon    TIMESTAMP DEFAULT now(),
  lastmodified TIMESTAMP DEFAULT now(),
  parent_comment_id  BIGINT REFERENCES dataplane.comments(id)         ON DELETE CASCADE DEFAULT NULL,  --is it ok to use 'ON DELETE cascade' ?
  edit_version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dataplane.ratings (
  id           BIGSERIAL PRIMARY KEY,
  rating       DECIMAL(2,1)                                           NOT NULL,
  object_type  VARCHAR(255)                                           NOT NULL,
  object_id    BIGINT                                                 NOT NULL,
  createdby    BIGINT REFERENCES dataplane.users (id)                 NOT NULL,

  CONSTRAINT unique_creator_objId_objType_constraint UNIQUE (createdby, object_id,object_type)
);

-- currently not using this table. If we want to use it then we will need to have some mechanism to swap the contents of this table at regular intervals to external store.
/*CREATE TABLE IF NOT EXISTS dataplane.comment_edits (
  id           BIGSERIAL PRIMARY KEY,
  comment_id   BIGINT REFERENCES dataplane.comments(id)                NOT NULL ,
  comment      TEXT,
  createdon    TIMESTAMP                                              NOT NULL, --lastmodified of comments table entry (before modifying comments table entry)
  edit_number  BIGINT                                                 NOT NULL  --edit_version of comments table entry (before modifying comments table entry)
);*/

--not using this table. Picking the object_type from application.conf file for comments.
/*CREATE TABLE IF NOT EXISTS dataplane.comment_object_types (
  id          BIGSERIAL PRIMARY KEY,
  type        VARCHAR(255) NOT NULL,
  description TEXT,
  dptable     VARCHAR(255) NOT NULL,
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);*/

/*CREATE TABLE IF NOT EXISTS dataplane.comment_objects (
  id          BIGSERIAL PRIMARY KEY,
  type        VARCHAR(255) NOT NULL,
  object_id    BIGINT,
  UNIQUE(type,object_id)
);*/

--Index on comments table
CREATE INDEX idx_dp_comments_parent_id on dataplane.comments(parent_comment_id);