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
package com.hortonworks.dataplane.gateway;


import com.hortonworks.dataplane.gateway.ext.ExcludeContextScan;
import com.netflix.http4.ssl.AcceptAllSocketFactory;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;

import static org.springframework.cloud.commons.httpclient.ApacheHttpClientConnectionManagerFactory.HTTPS_SCHEME;
import static org.springframework.cloud.commons.httpclient.ApacheHttpClientConnectionManagerFactory.HTTP_SCHEME;


@ComponentScan(excludeFilters = {
  @ComponentScan.Filter(type = FilterType.ANNOTATION, value = ExcludeContextScan.class)
})
@SpringBootApplication
@EnableZuulProxy
@EnableFeignClients
public class RouteService {

  public static void main(String[] args) {
    new SpringApplicationBuilder(RouteService.class).profiles("zuul").web(true).run(args);
  }

  /**
   * Enables typesafe config from application.conf
   * @return
   */
  @Bean
  public Config loadConfig() {
    return ConfigFactory.load();
  }

  @Bean
  public RegistryBuilder registryBuilder() throws UnrecoverableKeyException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
    return RegistryBuilder.<ConnectionSocketFactory> create()
      .register(HTTP_SCHEME, PlainConnectionSocketFactory.INSTANCE)
      //TODO: Ashwin Attach a secure version after allowing cert files to be imported
      .register(HTTPS_SCHEME, new AcceptAllSocketFactory());
  }


}
