package com.hortonworks.dataplane.profilers.common;

public interface AtlasTypeConstants {
    String HBASE_NAMESPACE_TYPE = "HBaseNamespace";
    String HBASE_TABLE_TYPE = "HBaseTable";
    String HBASE_COLUMN_FAMILY_TYPE = "HBaseColumnFamily";

    String CF_ATTRIBUTE_VERSIONS = "versions";
    String CF_ATTRIBUTE_IN_MEMORY = "inMemory";
    String CF_ATTRIBUTE_BLOCK_SIZE = "blockSize";
    String CF_ATTRIBUTE_COMPRESSION = "compression";
    String TABLE_ATTRIBUTE_NAMESPACE = "namespace";
    String TABLE_ATTRIBUTE_IS_ENABLED = "isEnabled";
    String TABLE_ATTRIBUTE_COLUMN_FAMILIES = "columnFamilies";

    String PHOENIX_TABLE_TYPE = "PhoenixTable";
    String PHOENIX_COLUMN_TYPE = "PhoenixColumn";
    String PHOENIX_TABLE_ATTRIBUTE_COLUMNS = "columns";
    String PHOENIX_COLUMN_DATA_TYPE = "dataType";
    String PHOENIX_COLUMN_FAMILY_DATA_TYPE = "columnFamily";
}
