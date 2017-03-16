package com.hortonworks.dataplane.profilers.hdfs.model;

import com.hortonworks.dataplane.profilers.common.Asset;

import java.util.Date;

public class HdfsFileElement extends Asset {

    private int size;
    private Date modificationTime;
    private Date accessTime;

    public HdfsFileElement(String name, String description, String owner) {
        super(name, description, owner);
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public Date getModificationTime() {
        return modificationTime;
    }

    public void setModificationTime(Date modificationTime) {
        this.modificationTime = modificationTime;
    }

    public Date getAccessTime() {
        return accessTime;
    }

    public void setAccessTime(Date accessTime) {
        this.accessTime = accessTime;
    }
}
