-- Add your indexes here

--Users
CREATE INDEX IF NOT EXISTS idx_dp_user_username on dataplane.dp_users(username);
CREATE INDEX IF NOT EXISTS idx_dp_user_displayname on dataplane.dp_users(displayname);

--Roles
CREATE INDEX IF NOT EXISTS idx_dp_roles_name on dataplane.dp_roles(name);

-- Configs
CREATE INDEX IF NOT EXISTS idx_dp_configs on dataplane.dp_configs(configkey);

