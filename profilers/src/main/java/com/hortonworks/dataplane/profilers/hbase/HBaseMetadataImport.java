package com.hortonworks.dataplane.profilers.hbase;

import com.hortonworks.dataplane.profilers.common.AtlasTypeRegistrar;
import com.hortonworks.dataplane.profilers.hbase.model.ColumnFamily;
import com.hortonworks.dataplane.profilers.hbase.model.HBaseMetadata;
import com.hortonworks.dataplane.profilers.hbase.model.Namespace;
import static com.hortonworks.dataplane.profilers.common.AtlasTypeConstants.*;

import com.sun.jersey.api.client.ClientResponse;
import org.apache.atlas.AtlasClient;
import org.apache.atlas.AtlasServiceException;
import com.hortonworks.dataplane.profilers.common.AtlasReferenceableBuilder;
import com.hortonworks.dataplane.profilers.hbase.model.Table;
import org.apache.atlas.typesystem.Referenceable;
import org.apache.atlas.typesystem.json.InstanceSerialization;
import org.apache.atlas.typesystem.persistence.Id;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HBaseMetadataImport {

    public static final String DEFAULT_OWNER = "admin";
    private final AtlasClient atlasClient;
    private final String clusterName;

    public HBaseMetadataImport(String atlasURL, String atlasUserName, String password, String clusterName) {
        atlasClient = new AtlasClient(new String[]{atlasURL}, new String[]{atlasUserName, password});
        this.clusterName = clusterName;
    }
    public static void main(String[] args) throws IOException, AtlasServiceException {
        if (args.length != 6) {
            printUsage();
            System.exit(-1);
        }
        HBaseMetadataImport hbaseMetadataImport = new HBaseMetadataImport(args[0], args[1], args[2], args[3]);
        hbaseMetadataImport.run(args[4], args[5]);
    }

    private static void printUsage() {
        System.out.println("Usage: java " + HBaseMetadataImport.class.getCanonicalName() +
                " <atlasURL> <atlasUserName> <password> <clusterName> <zkConnectString> <zkPort>");
        System.out.println("Example: java " + HBaseMetadataImport.class.getCanonicalName() +
                " http://localhost:21000/ admin admin cl1 localhost 3181");
    }

    private void run(String zkConnectString, String zkClientPort) throws IOException, AtlasServiceException {
        HBaseMetadataProfiler hBaseMetadataProfiler = new HBaseMetadataProfiler(zkConnectString, zkClientPort);
        HBaseMetadata hBaseMetadata = hBaseMetadataProfiler.getHBaseMetadata();
        createTypes();
        importIntoAtlas(hBaseMetadata);
    }

    private void createTypes() throws AtlasServiceException {
        AtlasTypeRegistrar atlasTypeRegistrar = new AtlasTypeRegistrar(atlasClient);
        atlasTypeRegistrar.registerTypes();
    }

    private void importIntoAtlas(HBaseMetadata hBaseMetadata) throws AtlasServiceException {
        for (Namespace ns : hBaseMetadata.getNamespaces()) {
            String namespaceId = importNamespace(ns);
            for (Table t : ns.getTables()) {
                List<Referenceable> tableEntities = createTableEntities(clusterName, ns.getName(), t, namespaceId);
                atlasClient.updateEntities(tableEntities);
                System.out.println("Created/Updated table: " + t.getName());
            }
        }
    }

    private String importNamespace(Namespace ns) throws AtlasServiceException {
        Referenceable namespace = null;
        try {
            namespace = atlasClient.getEntity(
                    HBASE_NAMESPACE_TYPE, AtlasClient.REFERENCEABLE_ATTRIBUTE_NAME, ns.getName() + "@" + clusterName);
        } catch (AtlasServiceException ase) {
            if (!ase.getStatus().equals(ClientResponse.Status.NOT_FOUND)) {
                throw ase;
            }
        }
        String guid;
        if (namespace == null) {
            Referenceable namespaceReferenceable = createNamespace(clusterName, ns);
            String hbaseNamespaceJson = InstanceSerialization.toJson(namespaceReferenceable, true);
            List<String> createdEntities = atlasClient.createEntity(hbaseNamespaceJson);
            guid = createdEntities.get(0);
            System.out.println(String.format("Created namespace: %s with ID %s", ns.getName(), guid));
        } else {
            guid = namespace.getId()._getId();
            System.out.println("Namespace already exists with ID " + guid);
        }
        return guid;
    }

    private Referenceable createNamespace(String clusterName, Namespace ns) {
        System.out.println("Creating namespace entity");
        AtlasReferenceableBuilder atlasReferenceableBuilder = AtlasReferenceableBuilder.newAtlasReferenceableBuilder();
        Referenceable hbaseNamespace = atlasReferenceableBuilder.
                ofType(HBASE_NAMESPACE_TYPE).
                withReferenceableName(ns.getName() + "@" + clusterName).
                withAssetProperties(ns.getName(), ns.getDescription(), DEFAULT_OWNER).
                build();
        return hbaseNamespace;
    }

    private List<Referenceable> createTableEntities(String clusterName, String nsName, Table t, String namespaceId) throws AtlasServiceException {
        List<Referenceable> cfReferenceables = new ArrayList<>();

        for (ColumnFamily cf : t.getColumnFamilies()) {
            Map<String, Object> attributeProperties = new HashMap<>();
            attributeProperties.put(CF_ATTRIBUTE_VERSIONS, cf.getVersions());
            attributeProperties.put(CF_ATTRIBUTE_IN_MEMORY, cf.isInMemory());
            attributeProperties.put(CF_ATTRIBUTE_COMPRESSION, cf.getCompression());
            attributeProperties.put(CF_ATTRIBUTE_BLOCK_SIZE, cf.getBlockSize());

            AtlasReferenceableBuilder atlasReferenceableBuilder = AtlasReferenceableBuilder.newAtlasReferenceableBuilder();
            Referenceable cfReferenceable = atlasReferenceableBuilder.ofType(HBASE_COLUMN_FAMILY_TYPE).
                    withReferenceableName(String.format("%s.%s.%s@%s", nsName, t.getName(), cf.getName(), clusterName)).
                    withAssetProperties(cf.getName(), cf.getDescription(), DEFAULT_OWNER).
                    withAttributeProperties(attributeProperties).
                    build();
            cfReferenceables.add(cfReferenceable);
        }

        Map<String, Object> tableAssetProperties = new HashMap<>();
        tableAssetProperties.put(TABLE_ATTRIBUTE_IS_ENABLED, t.isEnabled());
        tableAssetProperties.put(TABLE_ATTRIBUTE_NAMESPACE, getReferenceableId(namespaceId, HBASE_NAMESPACE_TYPE));
        tableAssetProperties.put(TABLE_ATTRIBUTE_COLUMN_FAMILIES, cfReferenceables);

        AtlasReferenceableBuilder atlasReferenceableBuilder = AtlasReferenceableBuilder.newAtlasReferenceableBuilder();
        Referenceable tableReferenceable = atlasReferenceableBuilder.ofType(HBASE_TABLE_TYPE).
                withReferenceableName(String.format("%s.%s:%s", nsName, t.getName(), clusterName)).
                withAssetProperties(t.getName(), t.getDescription(), DEFAULT_OWNER).
                withAttributeProperties(tableAssetProperties).
                build();

        List<Referenceable> tableEntities = new ArrayList<>();
        tableEntities.addAll(cfReferenceables);
        tableEntities.add(tableReferenceable);
        return tableEntities;

    }

    public static Id getReferenceableId(String id, String typeName) {
        return new Id(id, 0, typeName);
    }

}
