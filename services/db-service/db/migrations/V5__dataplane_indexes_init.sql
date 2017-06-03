-- Add your indexes here

--Users
CREATE INDEX IF NOT EXISTS idx_dp_user_username on dataplane.users(user_name);
CREATE INDEX IF NOT EXISTS idx_dp_user_displayname on dataplane.users(display_name);

--Roles
CREATE INDEX IF NOT EXISTS idx_dp_roles_name on dataplane.roles(name);

-- Configs
CREATE INDEX IF NOT EXISTS idx_dp_configs on dataplane.configs(config_key);

-- Locations
CREATE INDEX IF NOT EXISTS idx_dp_locations on dataplane.locations(city);

-- cluster services
 CREATE INDEX IF NOT EXISTS idx_dp_clusterservices_servicename on dataplane.cluster_services(service_name);
