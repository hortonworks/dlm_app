package com.hortonworks.dataplane.profilers.phoenix.model;

import com.hortonworks.dataplane.profilers.common.Asset;

public class Column extends Asset {

    private final String columnType;
    private final String columnFamily;

    public Column(String name, String description, String columnType, String columnFamily) {
        super(name, description);
        this.columnType = columnType;
        this.columnFamily = (columnFamily==null) ? "Null" : columnFamily;
    }

    public String getColumnType() {
        return columnType;
    }

    public String getColumnFamily() {
        return columnFamily;
    }
}
