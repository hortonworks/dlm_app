package com.hortonworks.dataplane.gateway.permissions;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;

public class RouteTest {
    public static void main(String args[])throws Exception{
        System.out.println("hello");
        File file=new File("D://dpapppolicy.json");
        ObjectMapper jsonMapper = new ObjectMapper();
        FileInputStream fis=new FileInputStream(file);
        PermPolicy permPolicy = jsonMapper.readValue(fis, PermPolicy.class);

        System.out.println(permPolicy);
    }
}
