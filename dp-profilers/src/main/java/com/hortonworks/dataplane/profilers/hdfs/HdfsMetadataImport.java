package com.hortonworks.dataplane.profilers.hdfs;

import com.hortonworks.dataplane.profilers.common.AtlasReferenceableBuilder;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFile;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileElement;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileSet;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsMetadata;
import com.sun.jersey.api.client.ClientResponse;
import org.apache.atlas.AtlasClient;
import org.apache.atlas.AtlasServiceException;
import org.apache.atlas.typesystem.Referenceable;
import org.apache.atlas.typesystem.persistence.Id;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HdfsMetadataImport {

    private final AtlasClient atlasClient;
    private final String clusterName;

    public HdfsMetadataImport(String atlasUrl, String atlasUserName, String atlasPassword, String clusterName) {
        atlasClient = new AtlasClient(new String[]{atlasUrl}, new String[]{atlasUserName, atlasPassword});
        this.clusterName = clusterName;
    }

    public static void main(String[] args) throws AtlasServiceException {
        if (args.length != 4) {
            printUsage();
            System.exit(-1);
        }
        HdfsMetadataImport hdfsMetadataImport = new HdfsMetadataImport(args[0], args[1], args[2], args[3]);
        hdfsMetadataImport.run();
    }

    private void run() throws AtlasServiceException {
        HdfsProfiler hdfsProfiler = new HdfsProfiler();
        HdfsMetadata hdfsMetadata = hdfsProfiler.getHdfsMetadata();

        HdfsTypeRegistrar hdfsTypeRegistrar = new HdfsTypeRegistrar(atlasClient);
        hdfsTypeRegistrar.registerTypes();
        importIntoAtlas(hdfsMetadata);
    }

    private void importIntoAtlas(HdfsMetadata hdfsMetadata) throws AtlasServiceException {
        List<HdfsFileSet> hdfsFileSets = hdfsMetadata.getHdfsFileSets();

        for (HdfsFileSet fs: hdfsFileSets) {
            List<HdfsFileElement> fileElements = fs.getFileElements();
            List<Id> ids = new ArrayList<>();
            for (HdfsFileElement fe : fileElements) {
                if (fe instanceof HdfsFile) {
                    String id = addHdfsFile((HdfsFile)fe);
                    ids.add(getReferenceableId(id, getTypeName(fe)));
                }
            }
            Referenceable hdfsFileSet = createHdfsFileSetReferenceable(fs, ids);

            atlasClient.updateEntities(hdfsFileSet);
            System.out.println("Created / Updated fileset: " + hdfsFileSet.get(AtlasClient.REFERENCEABLE_ATTRIBUTE_NAME));
        }

    }

    private Referenceable createHdfsFileSetReferenceable(HdfsFileSet fs, List<Id> ids) {
        AtlasReferenceableBuilder atlasReferenceableBuilder = AtlasReferenceableBuilder.newAtlasReferenceableBuilder();
        Map<String, Object> fileSetAttributes = new HashMap<>();
        fileSetAttributes.put(HdfsTypeRegistrar.SIZE_ATTRIBUTE, fs.getSize());
        fileSetAttributes.put(HdfsTypeRegistrar.ACCESS_TIME_STAMP_ATTRIBUTE, fs.getAccessTime());
        fileSetAttributes.put(HdfsTypeRegistrar.MODIFICATION_TIME_STAMP_ATTRIBUTE, fs.getModificationTime());
        fileSetAttributes.put(HdfsTypeRegistrar.COUNT_ATTRIBUTE, fs.getCount());
        fileSetAttributes.put(HdfsTypeRegistrar.FILE_SET_ELEMENTS_ATTRIBUTE, ids);
        fileSetAttributes.put(HdfsTypeRegistrar.FILE_SET_TYPE_ATTRIBUTE, fs.getFileSetType());
        if (fs.getFileSetTypeDetails() != null) {
            fileSetAttributes.put(HdfsTypeRegistrar.FILE_SET_TYPE_DETAILS_ATTRIBUTE, fs.getFileSetTypeDetails());
        }
        if (fs.getFileSetContentFeatures() != null) {
            fileSetAttributes.put(HdfsTypeRegistrar.FILE_SET_CONTENT_FEATURES_ATTRIBUTE, fs.getFileSetContentFeatures());
        }

        return atlasReferenceableBuilder.ofType(HdfsTypeRegistrar.HDFS_FILE_SET_TYPE).
                withReferenceableName(String.format("%s@%s", fs.getName(), clusterName)).
                withAssetProperties(fs.getName(), fs.getDescription(), fs.getOwner()).
                withAttributeProperties(fileSetAttributes).
                build();
    }

    private String addHdfsFile(HdfsFile fe) throws AtlasServiceException {
        String referenceableName = String.format("%s@%s", fe.getUri(), clusterName);
        String entityId = getEntityIdIfExists(HdfsTypeRegistrar.HDFS_FILE_TYPE, referenceableName);
        if (entityId != null) {
            System.out.println(String.format("%s already exists, ID: %s", referenceableName, entityId));
            return entityId;
        }

        Map<String, Object> feAttributes = new HashMap<>();
        feAttributes.put(HdfsTypeRegistrar.URI_ATTRIBUTE, fe.getUri());
        feAttributes.put(HdfsTypeRegistrar.SIZE_ATTRIBUTE, fe.getSize());
        feAttributes.put(HdfsTypeRegistrar.GROUP_ATTRIBUTE, fe.getGroup());
        feAttributes.put(HdfsTypeRegistrar.POSIX_ACLS_ATTRIBUTE, fe.getPosixAcls());
        feAttributes.put(HdfsTypeRegistrar.ACCESS_TIME_STAMP_ATTRIBUTE, fe.getAccessTime());
        feAttributes.put(HdfsTypeRegistrar.MODIFICATION_TIME_STAMP_ATTRIBUTE, fe.getModificationTime());
        feAttributes.put(HdfsTypeRegistrar.FORMAT_ATTRIBUTE, fe.getFormat());
        if (fe.getFormatDetails() != null) {
            feAttributes.put(HdfsTypeRegistrar.FORMAT_DETAILS_ATTRIBUTE, fe.getFormatDetails());
        }
        // TODO: Need to recursively call this if the FileElement is a FileSet.

        AtlasReferenceableBuilder atlasReferenceableBuilder = AtlasReferenceableBuilder.newAtlasReferenceableBuilder();
        Referenceable feReferenceable = atlasReferenceableBuilder.ofType(HdfsTypeRegistrar.HDFS_FILE_TYPE).
                withReferenceableName(referenceableName).
                withAssetProperties(fe.getName(), fe.getDescription(), fe.getOwner()).
                withAttributeProperties(feAttributes).build();
        List<String> entity = atlasClient.createEntity(feReferenceable);
        System.out.println(String.format("Created entity %s with ID %s", referenceableName, entity.get(0)));
        return entity.get(0);
    }

    private String getTypeName(HdfsFileElement fe) {
        String atlasType = HdfsTypeRegistrar.HDFS_FILE_TYPE;
        if (fe instanceof HdfsFileSet) {
            atlasType = HdfsTypeRegistrar.HDFS_FILE_SET_TYPE;
        }
        return atlasType;
    }

    private String getEntityIdIfExists(String atlasType, String referenceableName) throws AtlasServiceException {
        try {
            Referenceable element = atlasClient.getEntity(
                    atlasType, AtlasClient.REFERENCEABLE_ATTRIBUTE_NAME, referenceableName);
            return element.getId()._getId();
        } catch (AtlasServiceException ase) {
            if (!ase.getStatus().equals(ClientResponse.Status.NOT_FOUND)) {
                throw ase;
            }
        }
        return null;
    }

    private static void printUsage() {
        System.out.println("Usage: " + HdfsMetadataImport.class.getCanonicalName() +
                " <atlasUrl> <atlasUserName> <password> <clusterName>");
        System.out.println(("Example: " + HdfsMetadataImport.class.getCanonicalName() +
                " http://localhost:21000/ admin PASSWORD cl1"));
    }

    public static Id getReferenceableId(String id, String typeName) {
        return new Id(id, 0, typeName);
    }

}
