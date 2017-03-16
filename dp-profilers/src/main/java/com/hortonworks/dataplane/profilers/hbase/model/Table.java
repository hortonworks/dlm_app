package com.hortonworks.dataplane.profilers.hbase.model;

import com.hortonworks.dataplane.profilers.common.Asset;

import java.util.ArrayList;
import java.util.List;

public class Table extends Asset {

    private final boolean isEnabled;
    private List<ColumnFamily> columnFamilies;

    public Table(String name, String description, boolean isEnabled) {
        super(name, description);
        this.isEnabled = isEnabled;
        columnFamilies = new ArrayList<>();
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public void addColumnFamily(ColumnFamily columnFamily) {
        columnFamilies.add(columnFamily);
    }

    public List<ColumnFamily> getColumnFamilies() {
        return columnFamilies;
    }
}
