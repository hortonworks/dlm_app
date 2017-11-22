/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */
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
    String CHANGE_PASSWORD_ROUTE = "/identity/actions/change-password";
    String LOGIN_ENTRY_POINT = DPAPP_BASE_PATH+LOGIN_PATH;
    String AUTHORIZATION_HEADER = "Authorization";
    String USER_CTX_KEY = "user_ctx";
    String DP_JWT_COOKIE = "dp_jwt";
    String LOCAL_SIGNIN_PATH="/sign-in";
    String PERMS_POLICY_ENTRY_POINT = "/access/policies";
    boolean BEARER_TOKEN_IN_COOKIE=true;//If set to false value is taken from header
    String HTTP_X_REQUESTED_WITH="X-Requested-With";
    String XMLHttpRequestString="XMLHttpRequest";
    String XMLHttpRequestStringLowerCase=XMLHttpRequestString.toLowerCase();

    String ABORT_FILTER_CHAIN = "ABORT_FILTER_CHAIN";
}
