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
package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.TokenInfo;
import io.jsonwebtoken.*;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;


@Component
public class KnoxSso {
  private static final Logger logger = LoggerFactory.getLogger(KnoxSso.class);


  @Value("${sso.enabled}")
  private Boolean isSsoEnabled;

  @Value("${sso.cookie.name}")
  private String ssoCookieName;

  @Value("${sso.cookie.domain}")
  private String ssoCookieDomain;

  @Value("${signing.pub.key.path}")
  private String publicKeyPath;

  @Value("${knox.url.discover.fromrequest}")
  private Boolean knoxUrlDiscoverFromRequest;

  @Value("${knox.route}")
  private String knoxRoute;

  @Value("${server.domain}")
  private String serverDomain;

  @Value("${dps.root.path}")
  private String dpsRootPath;

  @Autowired
  private HostUtils hostUtils;

  public String getKnoxUrl() {
    if (knoxUrlDiscoverFromRequest){
      return String.format("https://%s%s%s", hostUtils.getRequestHost(), dpsRootPath, knoxRoute);
    }else {
      return String.format("https://%s%s%s", serverDomain, dpsRootPath, knoxRoute);
    }
  }


  @Value("${knox.websso.path}")
  private String knoxWebssoPath;

  private Optional<PublicKey> signingKey=Optional.absent();

  @PostConstruct
  public void init() {
    configureSigningKey();
  }

  public boolean isSsoConfigured() {
    return isSsoEnabled;
  }

  public String getSsoCookieName() {
    return ssoCookieName;
  }

  public String getCookieDomain(){
    if (StringUtils.isBlank(ssoCookieDomain)){
      return inferDomainFromKnoxUrl();
    }else{
      return ssoCookieDomain;
    }
  }

  private String inferDomainFromKnoxUrl() {
    try {
      URL url=new URL(getKnoxUrl());
      return url.getHost();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  public String getLoginUrl(String appRedirectUrl) {
    return String.format("%s%s?originalUrl=%s", getKnoxUrl(), knoxWebssoPath, appRedirectUrl);
  }

  public TokenInfo validateJwt(String token) {
    TokenInfo tokenInfo=new TokenInfo();
    try {
      Claims claims = Jwts.parser()
        .setSigningKey(signingKey.get())
        .parseClaimsJws(token).getBody();
      tokenInfo.setClaims(claims);
      return tokenInfo;
    }catch(ExpiredJwtException ex){
      logger.info("knox sso cookie has expired");
      return tokenInfo;
    }catch (JwtException e){
      logger.error("knox sso validate exception",e);
      return tokenInfo;
    }
  }

  private void configureSigningKey() {
    if (!isSsoEnabled){
      return;
    }
    try {
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      ByteArrayInputStream is = new ByteArrayInputStream(
          getPulicKeyString().getBytes("UTF8"));
        X509Certificate cer = (X509Certificate) fact.generateCertificate(is);
        this.signingKey = Optional.of(cer.getPublicKey());
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (CertificateException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }

  private String getPulicKeyString() {
    try {
      if (!StringUtils.isBlank(getPublicKeyPath())) {
        return FileUtils.readFileToString(new File(getPublicKeyPath()));
      } else {
        throw new RuntimeException("Public certificate of knox must be configured");
      }
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }

  private String getPublicKeyPath() {
    return publicKeyPath;
  }
}
