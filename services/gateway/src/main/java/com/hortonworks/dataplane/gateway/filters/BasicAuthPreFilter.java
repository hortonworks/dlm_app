package com.hortonworks.dataplane.gateway.filters;

import com.hortonworks.dataplane.gateway.auth.AuthenticationService;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.Credential;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;

import java.nio.charset.Charset;
import java.util.Base64;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;


@Service
public class BasicAuthPreFilter extends ZuulFilter {

  @Autowired
  private AuthenticationService authenticationService;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 2;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    HttpServletRequest request = context.getRequest();
    String authHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);

    return context.get(Constants.USER_CTX_KEY) == null && (authHeader != null && authHeader.startsWith(Constants.AUTH_HEADER_PRE_BASIC));
  }

  @Override
  public Object run() {
    RequestContext context = RequestContext.getCurrentContext();
    HttpServletRequest request = context.getRequest();
    String authHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);

    Credential credential = getCredentialFromBasicAuthHeader(authHeader);
    UserContext userContext = authenticationService.buildUserContextFromCredential(credential);
    context.set(Constants.USER_CTX_KEY, userContext);

    return null;
  }

  private Credential getCredentialFromBasicAuthHeader(String header) throws GatewayException {
    String encoded = header.substring(Constants.AUTH_HEADER_PRE_BASIC.length());
    String[] partsOfcredential = new String(Base64.getDecoder().decode(encoded), Charset.forName("UTF-8")).split(":",2);

    Credential credential = new Credential();
    credential.setUsername(partsOfcredential[0]);
    credential.setPassword(partsOfcredential[1]);

    return credential;
  }
}
