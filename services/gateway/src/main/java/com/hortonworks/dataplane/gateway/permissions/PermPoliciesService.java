package com.hortonworks.dataplane.gateway.permissions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.ArrayUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriTemplate;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class PermPoliciesService {
  private HashMap<String, PermPolicy> policies = new HashMap<>();
  private ObjectMapper jsonMapper = new ObjectMapper();

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

  public boolean isAuthorized(String serviceId,String method,String path,String[] roles){
    PermPolicy permPolicy = policies.get(serviceId);
    List<RoutePerm> routePerms = permPolicy.getRoutePerms();
    routePerms.sort(Comparator.comparing(RoutePerm::getPath));
    for(RoutePerm rPerm:routePerms){
      if (path.startsWith(rPerm.getPath())){
        List<String> policyRoles = Arrays.asList(rPerm.getRoles());
        Collection intersection = CollectionUtils.intersection(policyRoles, Arrays.asList(roles));
        return !intersection.isEmpty();
      }
    }
    return false;
  }
}
