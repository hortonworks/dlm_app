CREATE OR REPLACE FUNCTION dataplane.dp_cluster_delete(
  IN  p_dp_cluster_id BIGINT,
  OUT o_result        INT
)
  RETURNS INT AS

-- Takes a dp cluster
-- and cleans up the DB in one transaction
-- A failure here will show up as an SQL exception
-- and get mapped into a ISE, or this routine will succeed and return 1
$BODY$
DECLARE

  l_cluster_id         BIGINT;
  l_orphaned_catgories BIGINT [];
  l_dataset_ids        BIGINT [];
BEGIN

  -- get discovered clusters
  SELECT id
  INTO l_cluster_id
  FROM dataplane.discovered_clusters
  WHERE dp_clusterid = p_dp_cluster_id;

  -- Delete service hosts
  DELETE FROM dataplane.cluster_service_hosts
  USING dataplane.cluster_services CS
  WHERE service_id = CS.id
        AND CS.cluster_id = l_cluster_id;

  -- Delete cluster related data
  DELETE FROM dataplane.cluster_hosts
  WHERE cluster_id = l_cluster_id;
  DELETE FROM dataplane.cluster_services
  WHERE cluster_id = l_cluster_id;
  DELETE FROM dataplane.cluster_properties
  WHERE cluster_id = l_cluster_id;

  -- Fetch affected data sets
  SELECT array_agg(id)
  INTO l_dataset_ids
  FROM dataplane.datasets
  WHERE dp_clusterid = p_dp_cluster_id;

  -- Delete data assets for all affected data sets
  DELETE FROM dataplane.data_asset
  WHERE dataset_id = ANY (l_dataset_ids);

  -- Delete category mappings
  DELETE FROM dataplane.dataset_categories
  WHERE dataset_id = ANY (l_dataset_ids);

  -- Delete any orphaned categories
  SELECT array_agg(id)
  INTO l_orphaned_catgories
  FROM dataplane.categories C LEFT JOIN dataplane.dataset_categories DC
      ON C.id = DC.category_id
         AND DC.category_id IS NULL;

  DELETE FROM dataplane.categories
  WHERE id = ANY (l_orphaned_catgories);

  -- delete data sets
  DELETE FROM dataplane.datasets
  WHERE id = ANY (l_dataset_ids);

  -- Delete mapped cluster
  DELETE FROM dataplane.discovered_clusters
  WHERE dp_clusterid = p_dp_cluster_id;

  -- Delete the dataplane cluster mapping
  DELETE FROM dataplane.dp_clusters
  WHERE id = p_dp_cluster_id;

  -- Send a result to make slick happy
  o_result := 1;

END;
$BODY$
LANGUAGE 'plpgsql' VOLATILE SECURITY DEFINER
COST 100;