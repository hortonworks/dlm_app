package com.hortonworks.dataplane.gateway.permissions;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriTemplate;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;

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

  public boolean isAuthorized(String serviceId, HttpServletRequest request, List<String> roles) {
    PermPolicy permPolicy = policies.get(serviceId);
    List<RoutePerm> routePerms = permPolicy.getRoutePerms();
    String requestPath=request.getServletPath();
//    UriTemplate uriTemplate=new UriTemplate(request.getRequestURI());
//        for (RoutePerm rp : routePerms) {
//
//    }
    return false;
  }
}
