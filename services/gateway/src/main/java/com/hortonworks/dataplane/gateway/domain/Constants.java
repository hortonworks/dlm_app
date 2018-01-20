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
  String DPAPP = "core";
  String DLMAPP = "dlm";
  String DSSAPP = "dss";
  String CLOUDBREAK = "cloudbreak";
  String HDP_PROXY = "hdp_proxy";

  String DP_USER_INFO_HEADER_KEY = "X-DP-User-Info";
  String DP_TOKEN_INFO_HEADER_KEY = "X-DP-Token-Info";
  String DP_INVALIDATION_HEADER_KEY ="X-Invalidate-Token";
  String AUTH_HEADER_CHALLENGE_ADDRESS = "X-Authenticate-Href";
  String AUTHORIZATION_HEADER = "Authorization";

  String AUTH_HEADER_PRE_BASIC = "Basic ";
  String AUTH_HEADER_PRE_BEARER = "Bearer ";

  String DP_JWT_COOKIE = "dp_jwt";

  String DPAPP_BASE_PATH="/service/core";
  String KNOX_CONFIG_PATH = DPAPP_BASE_PATH + "/api/knox/configuration";
  String PERMS_POLICY_ENTRY_POINT = DPAPP_BASE_PATH + "/access/policies";

  String LOCAL_SIGNIN_PATH = "sign-in";

  String USER_CTX_KEY = "user_ctx";
  String USER_DP_TOKEN = "user_dp_token";

  String ABORT_FILTER_CHAIN = "ABORT_FILTER_CHAIN";
}
