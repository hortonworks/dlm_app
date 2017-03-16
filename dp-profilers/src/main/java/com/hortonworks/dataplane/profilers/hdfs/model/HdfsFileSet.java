package com.hortonworks.dataplane.profilers.hdfs.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HdfsFileSet extends HdfsFileElement {

    private List<HdfsFileElement> fileElements = new ArrayList<>();
    private int count;
    private String fileSetType;
    private Map<String, String> fileSetTypeDetails;
    private Map<String, String> fileSetContentFeatures;

    public HdfsFileSet(String name, String description, String owner) {
        super(name, description, owner);
    }

    public List<HdfsFileElement> getFileElements() {
        return fileElements;
    }

    public void addFileElements(HdfsFileElement fileElement) {
        this.fileElements.add(fileElement);
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public void setFileElements(List<HdfsFileElement> fileElements) {
        this.fileElements = fileElements;
    }

    public String getFileSetType() {
        return fileSetType;
    }

    public void setFileSetType(String fileSetType) {
        this.fileSetType = fileSetType;
    }

    public Map<String, String> getFileSetTypeDetails() {
        return fileSetTypeDetails;
    }

    public void setFileSetTypeDetails(Map<String, String> fileSetTypeDetails) {
        this.fileSetTypeDetails = fileSetTypeDetails;
    }

    public Map<String, String> getFileSetContentFeatures() {
        return fileSetContentFeatures;
    }

    public void setFileSetContentFeatures(Map<String, String> fileSetContentFeatures) {
        this.fileSetContentFeatures = fileSetContentFeatures;
    }
}
