package com.hortonworks.dataplane.gateway.filters;

import com.google.common.base.Optional;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
public class KnoxSso {
  private static final Logger logger = LoggerFactory.getLogger(KnoxSso.class);

  @Value("${sso.cookie.name}:")
  private String ssoCookieName;

  @Value("${signing.pub.key.path:}")
  private String publicKeyPath;

  @Value("${knox.url:}")
  private String knoxUrl;

  @Value("${knox.websso.path:}")
  private String knoxWebssoPath;


  public  boolean isSsoConfigured(){
    if (publicKeyPath!=null && !publicKeyPath.isEmpty()) {
      boolean ssoConfigured = Files.exists(Paths.get(publicKeyPath));
      return ssoConfigured;
    }else{
      return false;
    }
  }

  public  String getSsoCookieName(){
    return ssoCookieName;
  }

  public String getLoginUrl(String appRedirectUrl){
    return String.format("%s%s?originalUrl=%s",knoxUrl,knoxWebssoPath,appRedirectUrl);
  }

  public Optional<String> validateJwt(String token){
    Claims claims =Jwts.parser()
      .setSigningKey(getSigningKey())
      .parseClaimsJws(token).getBody();
    Date expiration = claims.getExpiration();
    if (expiration.before(new Date())){
      Optional.absent();
    }
    return Optional.of(claims.getSubject());
  }

  private PublicKey getSigningKey(){
    try {
      String pemString = FileUtils.readFileToString(new File(publicKeyPath));
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      ByteArrayInputStream is = new ByteArrayInputStream(
        pemString.getBytes("UTF8"));
      X509Certificate cer = (X509Certificate) fact.generateCertificate(is);
      return cer.getPublicKey();
    } catch (IOException e) {
      logger.error("Exception",e);
      throw new RuntimeException(e);
    } catch (CertificateException e) {
      logger.error("Exception",e);
      throw new RuntimeException(e);
    }
  }
}