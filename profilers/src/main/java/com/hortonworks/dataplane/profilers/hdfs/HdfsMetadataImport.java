package com.hortonworks.dataplane.profilers.hdfs;

import org.apache.atlas.AtlasClient;
import org.apache.atlas.AtlasServiceException;

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
        HdfsTypeRegistrar hdfsTypeRegistrar = new HdfsTypeRegistrar(atlasClient);
        hdfsTypeRegistrar.registerTypes();
    }

    private static void printUsage() {
        System.out.println("Usage: " + HdfsMetadataImport.class.getCanonicalName() +
                " <atlasUrl> <atlasUserName> <password> <clusterName>");
        System.out.println(("Example: " + HdfsMetadataImport.class.getCanonicalName() +
                " http://localhost:21000/ admin PASSWORD cl1"));
    }
}
