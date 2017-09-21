package com.hortonworks.dataplane.gateway.permissions;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.permissions.PermPoliciesService;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.Route;
import org.springframework.cloud.netflix.zuul.filters.RouteLocator;
import org.springframework.stereotype.Service;

import javax.servlet.ServletInputStream;

import java.io.IOException;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class PermissionsPolicyRegistrationFilter extends ZuulFilter {
    @Autowired
	private RouteLocator routeLocator;

    @Autowired
    private PermPoliciesService permPoliciesService;

    @Override
    public String filterType() {
        return PRE_TYPE;
    }

    @Override
    public int filterOrder() {
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        RequestContext ctx = RequestContext.getCurrentContext();
        if (ctx.getRequest().getServletPath().endsWith(Constants.PERMS_POLICY_ENTRY_POINT)){
            for (Route r:routeLocator.getRoutes()){
                if (ctx.getRequest().getServletPath().equals(r.getPath()+Constants.PERMS_POLICY_ENTRY_POINT)){
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public Object run() {
        System.out.println("permission policy controller called");
        RequestContext ctx = RequestContext.getCurrentContext();
        try {
            ServletInputStream inputStream = ctx.getRequest().getInputStream();
            String serviceId = ctx.get(SERVICE_ID_KEY).toString();
            permPoliciesService.registerPolicy(serviceId,inputStream);
        } catch (IOException e) {
            ctx.setResponseStatusCode(500);
            ctx.setSendZuulResponse(false);
            throw new RuntimeException("Error reading request");
        }
        return null;
    }
}
