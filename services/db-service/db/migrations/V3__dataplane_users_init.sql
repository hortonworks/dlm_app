GRANT ALL PRIVILEGES ON SCHEMA dataplane TO dp_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dataplane TO dp_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA dataplane TO dp_admin;
ALTER DATABASE dataplane SET search_path = dataplane;

INSERT INTO dataplane.roles  (name) VALUES ('SUPERADMIN'), ('INFRAADMIN'), ('USER'), ('CURATOR');

INSERT INTO dataplane.users (user_name, display_name, password) VALUES ('admin', 'Super Administrator', '$2a$10$G8hE1YikawgkzbFy3XQmk.XEbYVRef62DiOcaublWLcC9bE3oo6UW');

INSERT INTO dataplane.users_roles (user_id, role_id)
SELECT users.id, roles.id FROM (SELECT id FROM dataplane.users WHERE user_name = 'admin') AS users CROSS JOIN (SELECT id FROM dataplane.roles WHERE name IN ('SUPERADMIN', 'INFRAADMIN', 'USER', 'CURATOR')) AS roles;
