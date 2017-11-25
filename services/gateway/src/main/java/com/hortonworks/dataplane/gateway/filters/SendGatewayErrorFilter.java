/*
 * Copyright 2013-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.hortonworks.dataplane.gateway.filters;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.post.SendErrorFilter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SEND_ERROR_FILTER_ORDER;


@Service
public class SendGatewayErrorFilter extends SendErrorFilter {

	private static final Log logger = LogFactory.getLog(SendGatewayErrorFilter.class);

  @Autowired
  private Utils utils;

  @Autowired
  private CookieUtils cookieUtils;

	@Override
	public int filterOrder() {
		return SEND_ERROR_FILTER_ORDER - 1;
	}

	@Override
	public boolean shouldFilter() {
		RequestContext ctx = RequestContext.getCurrentContext();
		return ctx.getThrowable() != null && ctx.getThrowable().getCause() instanceof GatewayException;
	}

	@Override
	public Object run() {
		try {
			RequestContext ctx = RequestContext.getCurrentContext();
			GatewayException exception = (GatewayException) ctx.getThrowable().getCause();

			if(exception.getStatus() == HttpStatus.UNAUTHORIZED) {
        // set sign-in uri in header
        ctx.getResponse().addHeader(Constants.AUTH_HEADER_CHALLENGE_ADDRESS, utils.getSignInUri());

        // clear cookies
        Cookie[] cookies = ctx.getRequest().getCookies();
        if (cookies != null) {
          for (Cookie cookie : cookies) {
            if (cookieUtils.isRelevant(cookie.getName())) {
              Cookie clearCookie = cookieUtils.buildDeleteCookie(cookie, utils.getRequestHost(ctx.getRequest()));
              ctx.getResponse().addCookie(clearCookie);
            }
          }
        }
      }
		} catch (Exception ex) {
			logger.warn("Unable to get a valid HTTP status code.", ex);
		}
		return null;
	}

}
