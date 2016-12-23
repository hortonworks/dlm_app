package com.hortonworks.dataplane.profilers.hdfs.model;

import com.hortonworks.dataplane.profilers.common.Asset;

import java.util.Date;

public class HdfsFileElement extends Asset {

    private String uri;
    private int size;
    private String[] types;
    private Date modificationTime;
    private Date accessTime;
    private String group;
    private String posixAcls;

    public HdfsFileElement(String name, String description, String owner) {
        super(name, description, owner);
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String[] getTypes() {
        return types;
    }

    public void setTypes(String[] types) {
        this.types = types;
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

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getPosixAcls() {
        return posixAcls;
    }

    public void setPosixAcls(String posixAcls) {
        this.posixAcls = posixAcls;
    }
}
