package com.hortonworks.dataplane.gateway.domain;

public interface Constants {
    String DPAPP = "dpapp";
    String DLMAPP = "dlmapp";
    String DPAPP_BASE_PATH="/api/app";
    String DP_USER_INFO_HEADER_KEY = "X-DP-User-Info";
    String DP_TOKEN_INFO_HEADER_KEY = "X-DP-Token-Info";
    String SSO_CHECK_COOKIE_NAME="sso_login_valid";
    String KNOX_LOGIN_PATH =DPAPP_BASE_PATH+ "/auth/signInThrougKnox";

    String LOGOUT_PATH =DPAPP_BASE_PATH+"/auth/signOut";
    String LOGIN_PATH="/login";
    String LOGIN_ENTRY_POINT = DPAPP_BASE_PATH+LOGIN_PATH;
    String AUTHORIZATION_HEADER = "Authorization";
    String USER_CTX_KEY = "user_ctx";
    String DP_JWT_COOKIE = "dp_jwt";
    String LOCAL_SIGNIN_PATH="/sign-in";
    String PERMS_POLICY_ENTRY_POINT = "/policies";
    boolean BEARER_TOKEN_IN_COOKIE=true;//If set to false value is taken from header
    String HTTP_X_REQUESTED_WITH="X-Requested-With";
    String XMLHttpRequestString="XMLHttpRequest";
    String XMLHttpRequestStringLowerCase=XMLHttpRequestString.toLowerCase();

}
