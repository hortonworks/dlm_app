package com.hortonworks.dataplane.profilers.hdfs.model;

import java.util.ArrayList;
import java.util.List;

public class HdfsMetadata {

    public List<HdfsFileSet> hdfsFileSets = new ArrayList<>();

    public void addFileSet(HdfsFileSet hdfsFileSet) {
        hdfsFileSets.add(hdfsFileSet);
    }

    public List<HdfsFileSet> getHdfsFileSets() {
        return hdfsFileSets;
    }
}
