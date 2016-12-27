package com.hortonworks.dataplane.profilers.hdfs.model;

import java.util.Map;

public class HdfsFile extends HdfsFileElement {

    private String uri;
    private String format;
    private Map<String, String> formatDetails;
    private String group;
    private String posixAcls;

    public HdfsFile(String name, String description, String owner) {
        super(name, description, owner);
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Map<String, String> getFormatDetails() {
        return formatDetails;
    }

    public void setFormatDetails(Map<String, String> formatDetails) {
        this.formatDetails = formatDetails;
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
