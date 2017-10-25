/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */
package com.hortonworks.dataplane.gateway.permissions;

import org.junit.Test;

import java.io.InputStream;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PermissionsTest  {

  @Test
  public void testAllowedForPATH(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/",new String[]{"steward"});

    assertTrue("should be allowed",allowed);
  }

  @Test
  public void testNotAllowedForInvalidPerm(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dpapp",is);
    boolean allowed=permPoliciesService.isAuthorized("dpapp","GET","/blah",new String[]{"admin"});

    assertFalse("should not be allowed",allowed);
  }
  @Test
  public void testAllowedForSubPATH(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/replicate",new String[]{"steward"});

    assertTrue("should be allowed",allowed);
  }

  @Test
  public void testNotAllowedForSecretwork(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/secret",new String[]{"steward"});

    assertFalse("should not be allowed",allowed);
  }

  @Test
  public void testNotAllowedForSecretKey(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/secret/key",new String[]{"steward"});

    assertFalse("should not be allowed",allowed);
  }

  @Test
  public void testForAny(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/health",new String[]{});

    assertTrue("should be allowed",allowed);
  }

  @Test
  public void testAnyWithRoles(){
    PermPoliciesService permPoliciesService=new PermPoliciesService();
    InputStream is=loadResource("policyfile1.json");
    permPoliciesService.registerPolicy("dss",is);
    boolean allowed=permPoliciesService.isAuthorized("dss","GET","/health",new String[]{"steward"});

    assertTrue("should be allowed",allowed);
  }


  private InputStream loadResource(String path){
    return this.getClass().getClassLoader().getResourceAsStream(path);
  }
}
