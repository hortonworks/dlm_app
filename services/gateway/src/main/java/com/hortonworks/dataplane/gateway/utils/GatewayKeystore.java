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

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.security.*;
import java.security.cert.CertificateException;

@Component
public class GatewayKeystore {
  private static final Logger logger = LoggerFactory.getLogger(GatewayKeystore.class);

  @Value("${jwt.signing.keystore.jks.path}")
  private String signingKeystorePath;

  @Value("${jwt.signing.alias}")
  private String signingKeyAlias;

  @Value("${jwt.signing.keystore.password}")
  private String signingKeyStorePass;
  @Value("${jwt.signing.alias.password}")
  private String signingKeyAliasPass;

  public Key getPrivate(){
    try {
      String aliasPass= StringUtils.isBlank(signingKeyAliasPass)?signingKeyStorePass:signingKeyAliasPass;
      return getKeystore().getKey(signingKeyAlias,aliasPass.toCharArray());
    } catch (KeyStoreException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (NoSuchAlgorithmException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (UnrecoverableKeyException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    }
  }
  public PublicKey getPublic(){
    try {
      return getKeystore().getCertificate(signingKeyAlias).getPublicKey();
    } catch (KeyStoreException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    }
  }

  private KeyStore getKeystore(){
    InputStream keystoreStream=null;
    try {
      KeyStore  keyStore = KeyStore.getInstance("JKS");
      keystoreStream = getKeystoreStream();
      keyStore.load(keystoreStream, signingKeyStorePass.toCharArray() );
      return keyStore;
    } catch (KeyStoreException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (CertificateException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (NoSuchAlgorithmException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (FileNotFoundException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    } catch (IOException e) {
      logger.error("exception",e);
      throw new RuntimeException(e);
    }finally {
      try {
        if (keystoreStream!=null){
          keystoreStream.close();
        }
      } catch (IOException e) {
        logger.error("Exception",e);
      }
    }
  }

  private InputStream getKeystoreStream() throws FileNotFoundException {
    if (StringUtils.isBlank(signingKeystorePath)){
      return  GatewayKeystore.class.getClassLoader().getResourceAsStream("cert/gateway-signing.jks");
    }else{
      final File keyStoreFile = new File( signingKeystorePath );
      return new FileInputStream(keyStoreFile);
    }
  }
}
