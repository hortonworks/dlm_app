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

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.bouncycastle.openssl.jcajce.JceOpenSSLPKCS8DecryptorProviderBuilder;
import org.bouncycastle.operator.InputDecryptorProvider;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.pkcs.PKCS8EncryptedPrivateKeyInfo;
import org.bouncycastle.pkcs.PKCSException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

@Component
public class GatewayKeystore {
  private static final Logger logger = LoggerFactory.getLogger(GatewayKeystore.class);

  private static PrivateKey privateKey;
  private static PublicKey publicKey;

  @Value("${jwt.public.key.path}")
  private String publicKeyPath;
  @Value("${jwt.private.key.path}")
  private String privateKeyPath;
  @Value("${jwt.private.key.password}")
  private String privateKeyPassword;

  public PrivateKey getPrivate(){
    if(privateKey == null) {
      privateKey = readPrivate();
    }

    return  privateKey;
  }

  public PublicKey getPublic(){
    if(publicKey == null) {
      publicKey = readPublic();
    }

    return publicKey;
  }

  private PrivateKey readPrivate() {
    PEMParser pemParser = null;
    try {
      Security.addProvider(new BouncyCastleProvider());
      pemParser = new PEMParser(new StringReader(getKeyFileAsString(this.privateKeyPath)));
      PKCS8EncryptedPrivateKeyInfo encryptedKeyInfo = (PKCS8EncryptedPrivateKeyInfo) pemParser.readObject();

      JceOpenSSLPKCS8DecryptorProviderBuilder jce = new JceOpenSSLPKCS8DecryptorProviderBuilder();
      InputDecryptorProvider decProv = jce.build(this.privateKeyPassword.toCharArray());
      PrivateKeyInfo keyInfo = encryptedKeyInfo.decryptPrivateKeyInfo(decProv);
      JcaPEMKeyConverter converter = new JcaPEMKeyConverter();

      privateKey = converter.getPrivateKey(keyInfo);
      return privateKey;
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (OperatorCreationException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (PKCSException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } finally {
      IOUtils.closeQuietly(pemParser);
    }
  }

  private PublicKey readPublic() {
    try {
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      ByteArrayInputStream is = new ByteArrayInputStream(getKeyFileAsString(this.publicKeyPath).getBytes("UTF-8"));
      X509Certificate cer = (X509Certificate) fact.generateCertificate(is);
      return cer.getPublicKey();
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (CertificateException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }

  private String getKeyFileAsString(String path) {
    try {
      if (!StringUtils.isBlank(path)) {
        return FileUtils.readFileToString(new File(path));
      } else {
        throw new RuntimeException("File path was not supplied.");
      }
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }
}
