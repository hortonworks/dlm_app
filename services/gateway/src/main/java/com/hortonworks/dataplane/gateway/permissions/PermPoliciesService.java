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

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class PermPoliciesService {
  private static final Logger logger = LoggerFactory.getLogger(PermPoliciesService.class);

  @Value("${permission.policies}")
  private String permissionPolices;
  @Autowired
  private Environment env;
  @Autowired
  private ResourceLoader resourceLoader;

  private HashMap<String, PermPolicy> policies = new HashMap<>();
  private ObjectMapper jsonMapper = new ObjectMapper();

  @PostConstruct
  public void init() {
    String[] apps=permissionPolices.split(",");
    for(String app:apps){
      String policyFile=env.getProperty(String.format("permission.policy.%s",app));
      Resource resource = resourceLoader.getResource(String.format("classpath:%s" , policyFile));
      try {
        registerPolicy(app,resource.getInputStream());
        logger.info(String.format("Registered policy for: %s",app));
      } catch (IOException e) {
        logger.error("could not read policy file"+app,e);
      }
    }
  }

  public void registerPolicy(String serviceId, InputStream policyStream) {
    try {
      PermPolicy permPolicies = jsonMapper.readValue(policyStream, PermPolicy.class);
      List<RoutePerm> routePerms = permPolicies.getRoutePerms();
      routePerms.sort(Comparator.comparing(RoutePerm::getPath));
      policies.put(serviceId, permPolicies);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public boolean hasPolicy(String serviceId) {
    return policies.containsKey(serviceId);
  }


  public boolean isAuthorized(String serviceId,String method,String inputPath,String[] roles){
    PermPolicy permPolicy = policies.get(serviceId);
    int longestMatch=0;
    RoutePerm bestMatch=null;
    for(RoutePerm rPerm:permPolicy.getRoutePerms()) {
      if (inputPath.startsWith(rPerm.getPath())) {
        int rpermPathLength = rPerm.getPath().length();
        if (rpermPathLength > longestMatch) {
          longestMatch = rpermPathLength;
          bestMatch = rPerm;
        }

      }
    }
    if (bestMatch!=null){
      if (Arrays.asList(bestMatch.getRoles()).contains("*")){
        return  true;
      }
      List<String> policyRoles = Arrays.asList(bestMatch.getRoles());
      Collection intersection = CollectionUtils.intersection(policyRoles, Arrays.asList(roles));
      return !intersection.isEmpty();
    }else{
      return true;
    }
  }
}
