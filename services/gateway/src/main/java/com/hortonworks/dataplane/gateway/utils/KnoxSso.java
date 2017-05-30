package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
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

  @Value("${sso.cookie.name}")
  private String ssoCookieName;

  @Value("${sso.cookie.domain}")
  private String ssoCookieDomain;

  @Value("${signing.pub.key.path}")
  private String publicKeyPath;

  @Value("${knox.url}")
  private String knoxUrl;

  @Value("${knox.websso.path}")
  private String knoxWebssoPath;

  private PublicKey signingKey;

  @PostConstruct
  public void init() {
    configureSigningKey();
  }

  public boolean isSsoConfigured() {
    return signingKey != null;
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
      URL url=new URL(knoxUrl);
      return url.getHost();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  public String getLoginUrl(String appRedirectUrl) {
    return String.format("%s%s?originalUrl=%s", knoxUrl, knoxWebssoPath, appRedirectUrl);
  }

  public Optional<String> validateJwt(String token) {
    Claims claims = Jwts.parser()
      .setSigningKey(signingKey)
      .parseClaimsJws(token).getBody();
    Date expiration = claims.getExpiration();
    if (expiration != null && expiration.before(new Date())) {
      Optional.absent();
    }
    return Optional.of(claims.getSubject());
  }

  private void configureSigningKey() {
    try {
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      ByteArrayInputStream is = new ByteArrayInputStream(
        getPulicKeyString().getBytes("UTF8"));
      X509Certificate cer = (X509Certificate) fact.generateCertificate(is);
      this.signingKey = cer.getPublicKey();
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
      if (StringUtils.isBlank(getPublicKeyPath())) {
        return IOUtils.toString(this.getClass().getClassLoader().getResourceAsStream("cert/knox-signing.pem"));
      } else {
        return FileUtils.readFileToString(new File(getPublicKeyPath()));
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