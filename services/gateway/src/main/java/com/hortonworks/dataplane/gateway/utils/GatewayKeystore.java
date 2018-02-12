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
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.EncryptedPrivateKeyInfo;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;

@Component
public class GatewayKeystore {
  private static final Logger logger = LoggerFactory.getLogger(GatewayKeystore.class);

  @Value("${jwt.public.key.path}")
  private String publicKeyPath;
  @Value("${jwt.private.key.path}")
  private String privateKeyPath;
  @Value("${jwt.private.key.password}")
  private String privateKeyPassword;

  public PrivateKey getPrivate(){
    try {
      EncryptedPrivateKeyInfo encryptPKInfo = new EncryptedPrivateKeyInfo(getKeyFileAsString(this.privateKeyPath).getBytes());

      Cipher cipher = Cipher.getInstance(encryptPKInfo.getAlgName());
      PBEKeySpec pbeKeySpec = new PBEKeySpec(this.privateKeyPassword.toCharArray());
      SecretKeyFactory secFac = SecretKeyFactory.getInstance(encryptPKInfo.getAlgName());
      Key pbeKey = secFac.generateSecret(pbeKeySpec);
      AlgorithmParameters algParams = encryptPKInfo.getAlgParameters();
      cipher.init(Cipher.DECRYPT_MODE, pbeKey, algParams);

      KeySpec pkcs8KeySpec = encryptPKInfo.getKeySpec(cipher);
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return kf.generatePrivate(pkcs8KeySpec);
    } catch (NoSuchAlgorithmException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (InvalidKeySpecException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (InvalidAlgorithmParameterException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (NoSuchPaddingException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (InvalidKeyException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }

  public PublicKey getPublic(){
    try {
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      ByteArrayInputStream is = new ByteArrayInputStream(getKeyFileAsString(this.publicKeyPath).getBytes("UTF8"));
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
        throw new RuntimeException("F");
      }
    } catch (IOException e) {
      logger.error("Exception", e);
      throw new RuntimeException(e);
    }
  }
}
