package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserRef;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;

@Service
public class UserDetailFilter extends ZuulFilter {
  private static final String USER_DETAIL_ENTRY_POINT = Constants.DPAPP_BASE_PATH+"/auth/userDetail";
  @Autowired
  private Utils utils;

  @Autowired
  private UserService userService;

  private ObjectMapper objectMapper = new ObjectMapper();

  @Autowired
  private Jwt jwt;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 4;
  }

  @Override
  public boolean shouldFilter() {
    return utils.getServiceId().equals(Constants.DPAPP) &&  utils.serlvetPathMatches(USER_DETAIL_ENTRY_POINT);
  }

  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Object userObj = RequestContext.getCurrentContext().get(Constants.USER_CTX_KEY);
    if (userObj==null){
      throw new RuntimeException("illegal state. user should have been set");
    }
    try {
      User user=(User)userObj;
      List<String> roles = userService.getRoles(user.getUsername());
      String jwtToken = this.jwt.makeJWT(user, roles);
      UserRef userRef = userService.getUserRef(user, roles, jwtToken);//todo pass right token.
      String userRefJson=objectMapper.writeValueAsString(userRef);
      ctx.setResponseBody(userRefJson);
      ctx.setResponseStatusCode(200);
      ctx.setSendZuulResponse(false);
      return null;
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }
}
