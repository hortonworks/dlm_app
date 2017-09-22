package com.hortonworks.dataplane.gateway.permissions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.ArrayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
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
        logger.info(String.format("Registered polcify for: %s",app));
      } catch (IOException e) {
        logger.error("could not read policy file"+app,e);
      }
    }
  }

  public void registerPolicy(String serviceId, InputStream policyStream) {
    try {
      PermPolicy permPolicies = jsonMapper.readValue(policyStream, PermPolicy.class);
      policies.put(serviceId, permPolicies);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public boolean hasPolicy(String serviceId) {
    return policies.containsKey(serviceId);
  }

  public boolean isAuthorized(String serviceId, HttpServletRequest request, String[] roles) {
    PermPolicy permPolicy = policies.get(serviceId);
    List<RoutePerm> routePerms = permPolicy.getRoutePerms();
    String requestPath=request.getServletPath();
    return isAuthorized(serviceId,request.getMethod(),requestPath,roles);
  }

  public boolean isAuthorized(String serviceId,String method,String inputPath,String[] roles){
    PermPolicy permPolicy = policies.get(serviceId);
    List<RoutePerm> routePerms = permPolicy.getRoutePerms();
    routePerms.sort(Comparator.comparing(RoutePerm::getPath));
    int longestMatch=0;
    RoutePerm bestMatch=null;
    for(RoutePerm rPerm:routePerms) {
      if (inputPath.startsWith(rPerm.getPath())) {
        int rpermPathLength = rPerm.getPath().length();
        if (rpermPathLength > longestMatch) {
          longestMatch = rpermPathLength;
          bestMatch = rPerm;
        }

      }
    }
      if (bestMatch!=null){
        List<String> policyRoles = Arrays.asList(bestMatch.getRoles());
        Collection intersection = CollectionUtils.intersection(policyRoles, Arrays.asList(roles));
        return !intersection.isEmpty();
      }else{
        return true;
      }
  }
}
