package com.hortonworks.dataplane.profilers.hdfs;

import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFile;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileElement;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileSet;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsMetadata;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class HdfsProfiler {

    private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    public HdfsMetadata getHdfsMetadata() {
        HdfsMetadata hdfsMetadata = new HdfsMetadata();
        constructAppLogFileSets(hdfsMetadata);
        constructHiveFileSets(hdfsMetadata);
        return hdfsMetadata;
    }

    private void constructHiveFileSets(HdfsMetadata hdfsMetadata) {
        HdfsFile hiveTableFile1 = buildHdfsFile("000000_0",
                "/apps/hive/warehouse/microstrategy.db/inventory/000000_0",
                3105125,
                "hcube", "hdfs", "-rwxrwxrwx",
                "2016-03-03 21:54",
                new String[]{"Hive DB file", "csv"});

        HdfsFile hiveTableFile2 = buildHdfsFile("000000_0_copy_1",
                "/apps/hive/warehouse/microstrategy.db/inventory/000000_0_copy_1",
                1747258,
                "hcube", "hdfs", "-rwxrwxrwx",
                "2016-03-03 21:54",
                new String[]{"Hive DB file", "csv"});

        HdfsFileSet hiveFileSet = buildHdfsFileSet("Hive DB files: microstrategy.db",
                "/apps/hive/warehouse/microstrategy.db",
                "hcube", "hdfs", "drwxrwxrwx",
                "2016-03-03 21:54",
                new String[]{"Hive DB file container", "directory"},
                new HdfsFileElement[]{hiveTableFile1, hiveTableFile2});

        hdfsMetadata.addFileSet(hiveFileSet);
    }

    private void constructAppLogFileSets(HdfsMetadata hdfsMetadata) {
        HdfsFile hcubeUserAppLog1 = buildHdfsFile("hcube1-1n01.eng.hortonworks.com_45454_1479904984835",
                "/app-logs/hcube/logs/application_1478967587833_10000/hcube1-1n01.eng.hortonworks.com_45454_1479904984835",
                181432,
                "hcube", "hadoop", "-rw-r-----",
                "2016-11-23 12:43",
                new String[]{"Application log file", "text"});

        HdfsFile hcubeUserAppLog2 = buildHdfsFile("hcube1-1n03.eng.hortonworks.com_45454_1479905013250",
                "/app-logs/hcube/logs/application_1478967587833_10001/hcube1-1n03.eng.hortonworks.com_45454_1479905013250",
                97585,
                "hcube", "hadoop", "-rw-r-----",
                "2016-11-23 12:43",
                new String[] {"Application log file", "text"});

        HdfsFileSet hcubeUserAppLogs = buildHdfsFileSet("Logs: HCube User",
                "/app-logs/hcube",
                "hcube", "hadoop", "drwxrwx---",
                "2016-11-23 12:43",
                new String[]{"Application log file container", "directory"},
                new HdfsFileElement[]{hcubeUserAppLog1, hcubeUserAppLog2});

        hdfsMetadata.addFileSet(hcubeUserAppLogs);
    }

    private HdfsFileSet buildHdfsFileSet(String name, String path, String owner, String group, String posixAcls, String timeStamp, String[] types, HdfsFileElement[] hdfsFileElements) {
        HdfsFileSet hdfsFileSet = new HdfsFileSet(name, name, owner);
        hdfsFileSet.setUri(path);
        int size = 0;
        for (HdfsFileElement element : hdfsFileElements) {
            size += element.getSize();
            hdfsFileSet.addFileElements(element);
        }
        hdfsFileSet.setSize(size);
        hdfsFileSet.setGroup(group);
        hdfsFileSet.setPosixAcls(posixAcls);
        Date accessTime = parseDateFromTimestamp(timeStamp);
        hdfsFileSet.setModificationTime(accessTime);
        hdfsFileSet.setAccessTime(accessTime);
        hdfsFileSet.setTypes(types);
        hdfsFileSet.setCount(hdfsFileElements.length);
        return hdfsFileSet;
    }

    private HdfsFile buildHdfsFile(String name, String path, int size, String owner, String group, String posixAcls, String timeStamp, String[] fileTypes) {
        HdfsFile hdfsFile = new HdfsFile(name, name, owner);
        hdfsFile.setUri(path);
        hdfsFile.setSize(size);
        hdfsFile.setGroup(group);
        hdfsFile.setPosixAcls(posixAcls);
        Date accessTime = parseDateFromTimestamp(timeStamp);
        hdfsFile.setAccessTime(accessTime);
        hdfsFile.setModificationTime(accessTime);
        hdfsFile.setTypes(fileTypes);
        return hdfsFile;
    }

    private Date parseDateFromTimestamp(String timeStamp) {
        Date accessTime = null;
        try {
            accessTime = simpleDateFormat.parse(timeStamp);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return accessTime;
    }
}
