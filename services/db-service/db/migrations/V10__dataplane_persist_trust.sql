CREATE TABLE IF NOT EXISTS dataplane.certificates (
  id      BIGSERIAL     PRIMARY KEY,
  name    VARCHAR(255)  NOT NULL,
  data    BYTEA,
  active  BOOLEAN
);
