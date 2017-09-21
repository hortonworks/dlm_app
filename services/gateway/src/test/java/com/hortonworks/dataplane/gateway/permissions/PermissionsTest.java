package com.hortonworks.dataplane.gateway.permissions;

import org.junit.Test;

import java.io.InputStream;

public class PermissionsTest  {

  @Test
  public void test1(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dpapp",is);
   // permPoliciesService.isAuthorized("GET","/api/")
    System.out.println("hello"+is);
  }
  private InputStream loadResource(String path){
    return this.getClass().getClassLoader().getResourceAsStream(path);
  }
}
