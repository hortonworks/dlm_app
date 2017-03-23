package com.hortonworks.dataplane.profilers.hbase;

import com.hortonworks.dataplane.profilers.hbase.model.ColumnFamily;
import com.hortonworks.dataplane.profilers.hbase.model.HBaseMetadata;
import com.hortonworks.dataplane.profilers.hbase.model.Namespace;
import com.hortonworks.dataplane.profilers.hbase.model.Table;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.NamespaceDescriptor;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;

import java.io.IOException;
import java.util.List;

public class HBaseMetadataProfiler {

    private final Connection connection;
    private final Admin admin;

    public HBaseMetadataProfiler(String zkQuorum, String zkClientPort) throws IOException {
        Configuration conf = HBaseConfiguration.create();
        conf.set("hbase.zookeeper.quorum", zkQuorum);
        conf.set("hbase.zookeeper.property.clientPort", zkClientPort);
        connection = ConnectionFactory.createConnection(conf);
        admin = connection.getAdmin();
    }

    public static void main(String[] args) throws Exception {
        HBaseMetadataProfiler hBaseMetadataProfiler = new HBaseMetadataProfiler("localhost", "3181");
        hBaseMetadataProfiler.run();
    }

    private void run() throws IOException {
        HBaseMetadata hbaseMetadata = getHBaseMetadata();
        List<Namespace> namespaces = hbaseMetadata.getNamespaces();
        for (Namespace n : namespaces) {
            System.out.println("Namespace: " + n.getName());
            for (Table t : n.getTables()) {
                System.out.println("Table: " + t.getName());
                for (ColumnFamily cf : t.getColumnFamilies()) {
                    System.out.println("Column Family: " + cf.getName());
                }
            }
        }
    }

    public HBaseMetadata getHBaseMetadata() throws IOException {
        System.out.println("Importing HBase Metadata");
        NamespaceDescriptor[] namespaceDescriptors = admin.listNamespaceDescriptors();
        HBaseMetadata hbaseMetadata = new HBaseMetadata();
        for (NamespaceDescriptor ns : namespaceDescriptors) {
            System.out.println("Importing tables from " + ns.getName());
            Namespace namespace = new Namespace(ns.getName(), ns.getName());
            hbaseMetadata.add(namespace);
            buildTablesInNamespace(ns.getName(), namespace);
        }
        admin.close();
        connection.close();
        return hbaseMetadata;
    }

    private void buildTablesInNamespace(String ns, Namespace namespace) throws IOException {
        HTableDescriptor[] hTableDescriptors = admin.listTableDescriptorsByNamespace(ns);
        for (HTableDescriptor tableDescriptor : hTableDescriptors) {
            TableName tableName = tableDescriptor.getTableName();
            Table table = new Table(tableName.getNameAsString(), tableName.getNameAsString(),
                    admin.isTableEnabled(tableName));
            namespace.addTable(table);
            buildColumnFamiliesInTable(tableDescriptor, table);
        }
    }

    private void buildColumnFamiliesInTable(HTableDescriptor hTableDescriptor, Table table) {
        HColumnDescriptor[] columnFamilies = hTableDescriptor.getColumnFamilies();
        for (HColumnDescriptor cf : columnFamilies) {
            ColumnFamily columnFamily = new ColumnFamily(cf.getNameAsString(), cf.getNameAsString(),
                    cf.getMaxVersions(), cf.isInMemory(), cf.getCompression().getName(), cf.getBlocksize());
            table.addColumnFamily(columnFamily);
        }
    }
}