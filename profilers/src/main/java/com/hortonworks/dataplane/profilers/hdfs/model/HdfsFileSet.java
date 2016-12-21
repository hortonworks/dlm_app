package com.hortonworks.dataplane.profilers.hdfs.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class HdfsFileSet extends HdfsFileElement {

    private List<HdfsFileElement> fileElements = new ArrayList<>();
    private int count;

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
}
