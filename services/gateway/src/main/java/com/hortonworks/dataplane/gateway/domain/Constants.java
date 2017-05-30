package com.hortonworks.dataplane.gateway.domain;

public interface Constants {
    String DPAPP = "dpapp";
    String DPAPP_BASE_PATH="/api/app";
    String DP_USER_INFO_HEADER_KEY = "X-DP-User-Info";
    String SSO_CHECK_COOKIE_NAME="sso_login_valid";
    String KNOX_LOGIN_PATH =DPAPP_BASE_PATH+ "/auth/signInThrougKnox";
    String KNOX_LOGOUT_PATH =DPAPP_BASE_PATH+"/auth/signOutThrougKnox";
    String AUTHORIZATION_HEADER = "Authorization";
}
