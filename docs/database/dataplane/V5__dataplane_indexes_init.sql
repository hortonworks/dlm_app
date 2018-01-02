-- Add your indexes here

--Users
CREATE INDEX idx_dp_user_username on dataplane.users(user_name);
CREATE INDEX idx_dp_user_displayname on dataplane.users(display_name);

--Roles
CREATE INDEX idx_dp_roles_name on dataplane.roles(name);

-- Configs
CREATE INDEX idx_dp_configs on dataplane.configs(config_key);

-- Locations
CREATE INDEX idx_dp_locations on dataplane.locations(city);

-- cluster services
 CREATE INDEX idx_dp_clusterservices_servicename on dataplane.cluster_services(service_name);

-- workspaces
 CREATE INDEX idx_dp_workspace_name on dataplane.workspace(name);

-- datasets
 CREATE INDEX idx_dp_dataset_active on dataplane.datasets(id) WHERE active;

 -- data-assets
 CREATE INDEX idx_dp_data_asset_guid on dataplane.data_asset(guid);

 --user-groups
 CREATE INDEX idx_dp_user_groups_user_id on dataplane.user_groups(user_id);
 CREATE INDEX idx_dp_user_groups_group_id on dataplane.user_groups(group_id);

 --blacklisted tokens
 CREATE INDEX idx_dp_blacklisted_tokens on dataplane.blacklisted_tokens(token);
