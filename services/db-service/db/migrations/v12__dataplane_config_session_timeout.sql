--Add a default value for session timeout
INSERT INTO dataplane.configs (config_key, config_value, active, export) VALUES ('dp.session.timeout.minutes', 120, true, true);

