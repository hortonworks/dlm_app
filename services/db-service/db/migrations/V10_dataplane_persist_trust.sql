CREATE TABLE IF NOT EXISTS dataplane.certificates (
  id      BIGSERIAL PRIMARY KEY,
  data    BYTEA,
  active  BOOLEAN
);
