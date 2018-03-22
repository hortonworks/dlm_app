
CREATE TABLE IF NOT EXISTS dataplane.blacklisted_tokens (
  id          BIGSERIAL PRIMARY KEY,
  token       TEXT                   NOT NULL UNIQUE,
  expiry      TIMESTAMP              NOT NULL
);

--blacklisted tokens
CREATE INDEX idx_dp_blacklisted_tokens on dataplane.blacklisted_tokens(token);