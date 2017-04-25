GRANT ALL PRIVILEGES ON SCHEMA dataplane TO dp_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dataplane TO dp_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA dataplane TO dp_admin;
ALTER DATABASE dataplane SET search_path = dataplane;

INSERT INTO dataplane.dp_roles  (name) VALUES ('SUPERADMIN'), ('INFRAADMIN'), ('USER'), ('CURATOR');

INSERT INTO dataplane.dp_users (username, displayname, password) VALUES ('admin', 'Super Administrator', '$2a$10$G8hE1YikawgkzbFy3XQmk.XEbYVRef62DiOcaublWLcC9bE3oo6UW');

INSERT INTO dataplane.dp_users_roles (userid, roleid)
SELECT users.id, roles.id FROM (SELECT id FROM dataplane.dp_users WHERE username = 'admin') AS users CROSS JOIN (SELECT id FROM dataplane.dp_roles WHERE name IN ('SUPERADMIN', 'INFRAADMIN', 'USER', 'CURATOR')) AS roles;
