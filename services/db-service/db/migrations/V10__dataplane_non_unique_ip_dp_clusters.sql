ALTER TABLE dataplane.dp_clusters DROP CONSTRAINT dp_clusters_ip_address_key;
ALTER TABLE dataplane.dp_clusters ADD UNIQUE (ambari_url);
