CREATE SCHEMA IF NOT EXISTS dataplane;


CREATE TABLE IF NOT EXISTS dataplane.dp_roles (
  id      BIGSERIAL PRIMARY KEY,
  name    VARCHAR(32) UNIQUE NOT NULL,
  created TIMESTAMP DEFAULT now(),
  updated TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_users (
  id          BIGSERIAL PRIMARY KEY,
  username    VARCHAR(255) NOT NULL UNIQUE,
  displayname VARCHAR(255),
  avatar      VARCHAR(255),
  active      BOOLEAN   DEFAULT TRUE,
  password    VARCHAR(255),
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_users_roles (
  id     BIGSERIAL PRIMARY KEY,
  userid BIGINT REFERENCES dataplane.dp_users (id) NOT NULL,
  roleid BIGINT REFERENCES dataplane.dp_roles (id) NOT NULL,
  UNIQUE (userid, roleid)

);

CREATE TABLE IF NOT EXISTS dataplane.dp_permissions (
  id         BIGSERIAL PRIMARY KEY,
  permission VARCHAR(255) UNIQUE                       NOT NULL,
  roleid     BIGINT REFERENCES dataplane.dp_roles (id) NOT NULL,
  created    TIMESTAMP DEFAULT now(),
  updated    TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_locations (
  id        BIGSERIAL PRIMARY KEY,
  country   VARCHAR(255)   NOT NULL,
  city      VARCHAR(255)   NOT NULL,
  latitude  DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  UNIQUE (country, city)
);

CREATE TABLE IF NOT EXISTS dataplane.dp_datalakes (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255)                                  NOT NULL UNIQUE,
  description TEXT,
  locationid  BIGINT REFERENCES dataplane.dp_locations (id) NOT NULL,
  createdby   BIGINT REFERENCES dataplane.dp_users (id)     NOT NULL,
  properties  JSONB,
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_clusters (
  id                     BIGSERIAL PRIMARY KEY,
  name                   VARCHAR(255),
  description            TEXT,
  ambariurl              VARCHAR(255),
  ambariuser             VARCHAR(255),
  ambaripass             VARCHAR(255),
  secured                BOOLEAN DEFAULT FALSE,
  kerberosuser           VARCHAR(255),
  kerberosticketLocation TEXT,
  datalakeid             BIGINT REFERENCES dataplane.dp_datalakes (id) UNIQUE NOT NULL, -- One cluster per DL
  userid                 BIGINT REFERENCES dataplane.dp_users (id)            NOT NULL, -- The user who created the cluster
  properties             JSONB
);


CREATE TABLE IF NOT EXISTS dataplane.dp_cloud_clusters (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255),
  description TEXT,
  fqdn        VARCHAR(255),
  ipaddr      VARCHAR(39),
  port        INT,
  ambariuser  VARCHAR(255),
  ambaripass  VARCHAR(255),
  datalakeid  BIGINT REFERENCES dataplane.dp_datalakes (id),
  userid      BIGINT REFERENCES dataplane.dp_users (id)            NOT NULL, -- The user who created the cluster
  properties  JSONB
);


CREATE TABLE IF NOT EXISTS dataplane.dp_cluster_services (
  id          BIGSERIAL PRIMARY KEY,
  servicename VARCHAR(255) NOT NULL,
  servicehost VARCHAR(255),
  serviceport INT,
  fullURL     TEXT,
  properties  JSONB,
  clusterid   BIGINT REFERENCES dataplane.dp_clusters (id),
  datalakeid  BIGINT REFERENCES dataplane.dp_datalakes (id),
  CHECK (clusterid IS NOT NULL OR datalakeid IS NOT NULL)

);


CREATE TABLE IF NOT EXISTS dataplane.dp_workspace (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255)                              NOT NULL,
  description TEXT,
  createdby   BIGINT REFERENCES dataplane.dp_users (id) NOT NULL,
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);


CREATE TABLE IF NOT EXISTS dataplane.dp_data_asset_workspace (
  assetType   VARCHAR(10)                                    NOT NULL,
  assetid     BIGINT                                         NOT NULL,
  workspaceid BIGINT REFERENCES dataplane.dp_workspace (id)  NOT NULL
);


CREATE TABLE IF NOT EXISTS dataplane.dp_cluster_hosts (
  id         BIGSERIAL PRIMARY KEY,
  host       VARCHAR(255)                                 NOT NULL,
  status     VARCHAR(10)                                  NOT NULL,
  properties JSONB,
  clusterid  BIGINT REFERENCES dataplane.dp_clusters (id) NOT NULL
);


CREATE TABLE IF NOT EXISTS dataplane.dp_cluster_health (
  id        BIGSERIAL PRIMARY KEY,
  status    VARCHAR(255)                                 NOT NULL,
  state     VARCHAR(10)                                  NOT NULL,
  uptime    BIGINT,
  started   TIMESTAMP,
  clusterid BIGINT REFERENCES dataplane.dp_clusters (id) NOT NULL
);

CREATE TABLE IF NOT EXISTS dataplane.dp_cluster_properties (
  id         BIGSERIAL PRIMARY KEY,
  properties JSONB,
  clusterid  BIGINT REFERENCES dataplane.dp_clusters (id) NOT NULL
);

CREATE TABLE IF NOT EXISTS dataplane.dp_categories (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_datasets (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(255)                                       NOT NULL,
  description  TEXT,
  datalakeid   BIGINT REFERENCES dataplane.dp_datalakes (id)      NOT NULL,
  createdby    BIGINT REFERENCES dataplane.dp_users (id)          NOT NULL,
  createdon    TIMESTAMP DEFAULT now()                            NOT NULL,
  lastmodified TIMESTAMP DEFAULT now()                            NOT NULL,
  version      SMALLINT DEFAULT 1,
  customprops  JSONB
);

CREATE TABLE IF NOT EXISTS dataplane.dp_dataset_categories (
  category_id BIGINT REFERENCES dataplane.dp_categories (id) NOT NULL,
  dataset_id  BIGINT REFERENCES dataplane.dp_datasets (id)   NOT NULL
);

CREATE TABLE IF NOT EXISTS dataplane.dp_unclassified_datasets (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(255)                                       NOT NULL,
  description  TEXT,
  datalakeid   BIGINT REFERENCES dataplane.dp_datalakes (id)      NOT NULL,
  createdby    BIGINT REFERENCES dataplane.dp_users (id)          NOT NULL,
  createdon    TIMESTAMP DEFAULT now()                            NOT NULL,
  lastmodified TIMESTAMP DEFAULT now()                            NOT NULL,
  customprops  JSONB
);

CREATE TABLE IF NOT EXISTS dataplane.dp_unclassified_datasets_categories (
  category_id             BIGINT REFERENCES dataplane.dp_categories (id)            NOT NULL,
  unclassified_dataset_id BIGINT REFERENCES dataplane.dp_unclassified_datasets (id) NOT NULL
);

CREATE TABLE IF NOT EXISTS dataplane.dp_data_asset (
  id              BIGSERIAL PRIMARY KEY,
  assettype       VARCHAR(10) NOT NULL,
  assetname       TEXT        NOT NULL,
  assetdetails    TEXT        NOT NULL,
  asseturl        TEXT        NOT NULL,
  assetproperties JSONB       NOT NULL,
  datasetid       BIGINT REFERENCES dataplane.dp_datasets (id) DEFAULT NULL


);

-- Since datasets are boxes, we will need to store details
CREATE TABLE IF NOT EXISTS dataplane.dp_dataset_details (
  id        BIGSERIAL,
  details   JSONB,
  datasetid BIGINT REFERENCES dataplane.dp_datasets (id)
);

-- create filters

CREATE TABLE IF NOT EXISTS dataplane.dp_filters (
  id        BIGSERIAL PRIMARY KEY,
  condition TEXT NOT NULL,
  active    BOOLEAN DEFAULT FALSE,
  datasetid BIGINT REFERENCES dataplane.dp_datasets (id)
);

CREATE TABLE IF NOT EXISTS dataplane.dp_skus (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  status      SMALLINT  DEFAULT 1, -- enum 1 - Disable, 2 - Setting up, 3 - Active, ...
  created     TIMESTAMP DEFAULT now(),
  updated     TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataplane.dp_enabled_skus (
  sku_id         BIGINT REFERENCES dataplane.dp_skus (id) UNIQUE NOT NULL,
  enabledby      BIGINT REFERENCES dataplane.dp_users (id)       NOT NULL,
  enabledon      TIMESTAMP                                       NOT NULL,
  smartsenseid   TEXT                                            NOT NULL,
  subscriptionid TEXT                                            NOT NULL,
  created        TIMESTAMP DEFAULT now(),
  updated        TIMESTAMP DEFAULT now()
);

-- Global DP configurations - could be exported to cluster ZK if needed
CREATE TABLE IF NOT EXISTS dataplane.dp_configs (
  id          BIGSERIAL PRIMARY KEY,
  configkey   VARCHAR(255)          NOT NULL  UNIQUE,
  configvalue TEXT                  NOT NULL,
  active      BOOLEAN DEFAULT TRUE  NOT NULL,
  export      BOOLEAN DEFAULT FALSE NOT NULL
);
