package com.hortonworks.dataplane.gateway.domain;


public class Constants {
    public static String DPAPP = "dpapp";
    public static String DPAPP_BASE_PATH="/api/app";
    public static String GATEWAY_TOKEN = "gateway-token";
    public static String SSO_CHECK_COOKIE_NAME="sso_login_valid";
    public static String KNOX_LOGIN_PATH =DPAPP_BASE_PATH+ "/auth/signInThrougKnox";
    public static String KNOX_LOGOUT_PATH =DPAPP_BASE_PATH+"/auth/signOutThrougKnox";

}
