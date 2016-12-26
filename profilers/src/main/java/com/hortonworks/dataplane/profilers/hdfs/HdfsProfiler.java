package com.hortonworks.dataplane.profilers.hdfs;

import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFile;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileElement;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsFileSet;
import com.hortonworks.dataplane.profilers.hdfs.model.HdfsMetadata;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class HdfsProfiler {

    private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    public HdfsMetadata getHdfsMetadata() {
        HdfsMetadata hdfsMetadata = new HdfsMetadata();
        constructAppLogFileSets(hdfsMetadata);
        constructHiveFileSets(hdfsMetadata);
        constructClinicalNotesFileSet(hdfsMetadata);
        constructRadiologyImagesFileSet(hdfsMetadata);
        return hdfsMetadata;
    }

    private void constructRadiologyImagesFileSet(HdfsMetadata hdfsMetadata) {

        String[] fileNames = {
                "i3NSCCuzMcpaZEu3IC8WnA_54.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_55.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_58.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_60.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_61.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_62.jpg",
                "i3NSCCuzMcpaZEu3IC8WnA_63.jpg",
                "tf0001.jpg",
                "tf0005.jpg",
                "tf0009a.jpg"
        };

        int[] fileSizes = {108610, 108623, 108836, 108874, 108825, 109245, 109147, 113330, 213752, 121344};

        HdfsFileElement[] fileElements = new HdfsFileElement[fileSizes.length];

        Map<String, String> fileFormatDetails = new HashMap<String, String>();
        fileFormatDetails.put("Content-Type", "image/jpeg");
        fileFormatDetails.put("Compression Type", "Baseline");
        fileFormatDetails.put("Comments", "converted DICOM image");
        fileFormatDetails.put("Image Height", "512 pixels");
        fileFormatDetails.put("Image Width", "512 pixels");
        fileFormatDetails.put("X Resolution", "72 dots");
        fileFormatDetails.put("Y Resolution", "72 dots");

        for (int i = 0; i <fileNames.length; i++) {
            HdfsFile file = buildHdfsFile(fileNames[i],
                    "/sko_demo_data/unstructured/RadiologyImages/Public/Cases/" + fileNames[i],
                    13033660,
                    "admin", "hdfs", "-rw-r--r--",
                    "2016-12-22 13:39",
                    "Image file", fileFormatDetails);
            fileElements[i] = file;
        }

        Map<String, String> fileSetTypeDetails = new HashMap<>();
        fileSetTypeDetails.put("directory-uri-pattern", "/sko_demo_data/unstructured/RadiologyImages/Public/Cases/FILE_NAME");
        fileSetTypeDetails.put("Comments", "converted DICOM images");

        Map<String, String> fileSetContentFeatures = new HashMap<>();
        fileSetContentFeatures.put("Average Image Height", "512 pixels");
        fileSetContentFeatures.put("Average Image Width", "512 pixels");
        fileSetContentFeatures.put("categories", "Autopsy report, Claim report, Evaluation report");
        fileSetContentFeatures.put("Average X Resolution", "72 dots");
        fileSetContentFeatures.put("Average Y Resolution", "72 dots");

        HdfsFileSet hdfsFileSet = buildHdfsFileSet("Radiology Images",
                "admin",
                "2016-12-22 13:39",
                fileElements, "Machine generated cluster of image documents", fileSetTypeDetails,
                fileSetContentFeatures);

        hdfsMetadata.addFileSet(hdfsFileSet);
    }

    private void constructClinicalNotesFileSet(HdfsMetadata hdfsMetadata) {

        Map<String, String> formatDetails = new HashMap<>();
        formatDetails.put("charset", "ISO-8859-1");
        formatDetails.put("Content-Encoding", "ISO-8859-1");
        formatDetails.put("Content-Type", "text/plain");

        String[] fileNames = {"autopsy-4.txt",
                "autopsy-5.txt",
                "autopsy-6.txt",
                "chiropractic-ime-1.txt",
                "chiropractic-ime-2.txt",
                "neuropsychological-evaluation-2.txt",
                "neuropsychological-evaluation-3-2.txt",
                "neuropsychological-evaluation-4.txt",
                "neuropsychological-evaluation.txt",
                "qualified-medical-evaluation-report.txt"};

        int[] fileSizes = {19899, 21770, 30020, 16640, 30204, 17700, 19295, 32596, 25411, 24954};

        HdfsFileElement[] fileElements = new HdfsFileElement[fileNames.length];

        for (int i = 0; i < fileNames.length; i++) {
            HdfsFile file = buildHdfsFile(fileNames[i],
                    "/sko_demo_data/unstructured/ClinicalNotesAndReports/Public/Cases/" + fileNames[i],
                    fileSizes[i],
                    "admin", "hdfs", "-rw-r--r--",
                    "2016-12-22 13:38",
                    "text", formatDetails);
            fileElements[i] = file;
        }

        Map<String, String> fileSetTypeDetails = new HashMap<>();
        fileSetTypeDetails.put("directory-uri-pattern", "/sko_demo_data/unstructured/ClinicalNotesAndReports/Public/Cases/FILE_NAME");
        fileSetTypeDetails.put("clustering-algorithm", "Hierarchical clustering");
        fileSetTypeDetails.put("clustered-date", "2016-12-22");

        Map<String, String> fileSetContentFeatures = new HashMap<>();
        fileSetContentFeatures.put("keywords", "Test, back, patient, wound, evaluation, history");
        fileSetContentFeatures.put("categories", "Autopsy report, Claim report, Evaluation report");

        HdfsFileSet clinicalNotesFileSet = buildHdfsFileSet("Clinical Notes and Reports",
                "admin",
                "2016-12-22 13:36",
                fileElements,
                "Machine generated cluster of text documents",
                fileSetTypeDetails,
                fileSetContentFeatures
                );

        hdfsMetadata.addFileSet(clinicalNotesFileSet);
    }

    private void constructHiveFileSets(HdfsMetadata hdfsMetadata) {

        HdfsFile hiveTableFile1 = buildHdfsFile("000000_0",
                "/apps/hive/warehouse/microstrategy.db/inventory/000000_0",
                3105125,
                "hcube", "hdfs", "-rwxrwxrwx",
                "2016-03-03 21:54",
                "Hadoop: ORC", null);

        HdfsFile hiveTableFile2 = buildHdfsFile("000000_0_copy_1",
                "/apps/hive/warehouse/microstrategy.db/inventory/000000_0_copy_1",
                1747258,
                "hcube", "hdfs", "-rwxrwxrwx",
                "2016-03-03 21:54",
                "Hadoop: ORC", null);

        Map<String, String> fileSetTypeDetails = new HashMap<>();
        fileSetTypeDetails.put("directory-uri-pattern", "/app-logs/hive/warehouse/microstrategy.db/TABLE_NAME/FILE_NAME");
        fileSetTypeDetails.put("compressed", "false");


        HdfsFileSet hiveFileSet = buildHdfsFileSet("Hive DB files: microstrategy.db",
                "hcube",
                "2016-03-03 21:54", new HdfsFileElement[]{hiveTableFile1, hiveTableFile2},
                "Hive Table Files",
                fileSetTypeDetails, null);

        hdfsMetadata.addFileSet(hiveFileSet);
    }

    private void constructAppLogFileSets(HdfsMetadata hdfsMetadata) {

        Map<String, String> formatDetails = new HashMap<>();
        formatDetails.put("charset", "ISO-8859-1");
        formatDetails.put("Content-Encoding", "UTF-8");
        formatDetails.put("Content-Length", "0");
        formatDetails.put("Content-Type", "text/x-log");

        HdfsFile hcubeUserAppLog1 = buildHdfsFile("hcube1-1n01.eng.hortonworks.com_45454_1479904984835",
                "/app-logs/hcube/logs/application_1478967587833_10000/hcube1-1n01.eng.hortonworks.com_45454_1479904984835",
                181432,
                "hcube", "hadoop", "-rw-r-----",
                "2016-11-23 12:43",
                "text", formatDetails);

        HdfsFile hcubeUserAppLog2 = buildHdfsFile("hcube1-1n03.eng.hortonworks.com_45454_1479905013250",
                "/app-logs/hcube/logs/application_1478967587833_10001/hcube1-1n03.eng.hortonworks.com_45454_1479905013250",
                97585,
                "hcube", "hadoop", "-rw-r-----",
                "2016-11-23 12:43",
                "text", formatDetails);

        Map<String, String> fileSetTypeDetails = new HashMap<>();
        fileSetTypeDetails.put("directory-uri-pattern", "/app-logs/hcube/logs/APP_ID/FILE_NAME");
        Map<String, String> fileSetContentFeatures = new HashMap<>();
        fileSetTypeDetails.put("keywords", "thread, DEBUG, NotificationHookConsumer");
        HdfsFileSet hcubeUserAppLogs = buildHdfsFileSet("Logs: HCube User", "hcube",
                "2016-11-23 12:43",
                new HdfsFileElement[]{hcubeUserAppLog1, hcubeUserAppLog2},
                "Directory grouping",
                fileSetTypeDetails, fileSetContentFeatures);

        hdfsMetadata.addFileSet(hcubeUserAppLogs);
    }

    private HdfsFileSet buildHdfsFileSet(String name, String owner, String timeStamp, HdfsFileElement[] hdfsFileElements,
                                         String fileSetType, Map<String, String> fileSetTypeDetails,
                                         Map<String, String> fileSetContentFeatures) {
        HdfsFileSet hdfsFileSet = new HdfsFileSet(name, name, owner);
        int size = 0;
        for (HdfsFileElement element : hdfsFileElements) {
            size += element.getSize();
            hdfsFileSet.addFileElements(element);
        }
        hdfsFileSet.setSize(size);
        Date accessTime = parseDateFromTimestamp(timeStamp);
        hdfsFileSet.setModificationTime(accessTime);
        hdfsFileSet.setAccessTime(accessTime);
        hdfsFileSet.setCount(hdfsFileElements.length);
        hdfsFileSet.setFileSetType(fileSetType);
        if (fileSetTypeDetails != null) {
            hdfsFileSet.setFileSetTypeDetails(fileSetTypeDetails);
        }
        if (fileSetContentFeatures != null) {
            hdfsFileSet.setFileSetContentFeatures(fileSetContentFeatures);
        }
        return hdfsFileSet;
    }

    private HdfsFile buildHdfsFile(String name, String path, int size, String owner, String group, String posixAcls,
                                   String timeStamp, String format, Map<String, String> formatDetails) {
        HdfsFile hdfsFile = new HdfsFile(name, name, owner);
        hdfsFile.setUri(path);
        hdfsFile.setSize(size);
        hdfsFile.setGroup(group);
        hdfsFile.setPosixAcls(posixAcls);
        Date accessTime = parseDateFromTimestamp(timeStamp);
        hdfsFile.setAccessTime(accessTime);
        hdfsFile.setModificationTime(accessTime);
        hdfsFile.setFormat(format);
        if (formatDetails != null) {
            hdfsFile.setFormatDetails(formatDetails);
        }
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
