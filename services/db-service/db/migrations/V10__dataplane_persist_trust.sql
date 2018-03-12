CREATE TABLE IF NOT EXISTS dataplane.certificates (
  id      BIGSERIAL     PRIMARY KEY,
  name    VARCHAR(255)  NOT NULL UNIQUE,
  format  VARCHAR(255),
  data    TEXT,
  active  BOOLEAN
);
