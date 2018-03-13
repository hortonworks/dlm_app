CREATE TABLE IF NOT EXISTS dataplane.certificates (
  id          BIGSERIAL     PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL UNIQUE,
  format      VARCHAR(255),
  data        TEXT,
  active      BOOLEAN,
  created_by  BIGINT REFERENCES dataplane.users (id)     NOT NULL,
  created     TIMESTAMP DEFAULT now()
);

ALTER TABLE dataplane.dp_clusters
  ADD COLUMN allow_untrusted BOOLEAN DEFAULT TRUE, 
  ADD COLUMN behind_gateway BOOLEAN DEFAULT FALSE;
