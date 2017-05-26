package com.hortonworks.dataplane.gateway;


import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cloud.netflix.feign.EnableFeignClients;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan
@SpringBootApplication
@EnableZuulProxy
@EnableFeignClients
public class RouteService {

  public static void main(String[] args) {
    new SpringApplicationBuilder(RouteService.class).profiles("zuul").web(true).run(args);
  }
}
