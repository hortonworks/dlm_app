package com.hortonworks.dataplane.profilers.hbase.model;

import com.hortonworks.dataplane.profilers.common.Asset;

public class ColumnFamily extends Asset {

    private final int versions;
    private final boolean inMemory;
    private final String compression;
    private final int blockSize;

    public ColumnFamily(String name, String description, int versions, boolean inMemory, String compression,
                        int blockSize) {
        super(name, description);
        this.versions = versions;
        this.inMemory = inMemory;
        this.compression = compression;
        this.blockSize = blockSize;
    }

    public int getVersions() {
        return versions;
    }

    public boolean isInMemory() {
        return inMemory;
    }

    public String getCompression() {
        return compression;
    }

    public int getBlockSize() {
        return blockSize;
    }
}
