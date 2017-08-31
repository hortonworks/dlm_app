package com.hortonworks.dataplane.gateway

import com.netflix.zuul.FilterLoader
import io.github.syamantm.zuul.client.GithubClient
import io.github.syamantm.zuul.filters.route.{GithubFilter, HelloFilter}
import org.slf4j.LoggerFactory

object GatewayApplication extends App {
  FilterLoader.getInstance();
}

@EnableZuulProxy
@RestController
class GatewayConfiguration {

  @RequestMapping(method = Array(RequestMethod.GET), value = Array("/ping/{name}"))
  def edit(@PathVariable("name") name: String) = {
    name
  }

  @Bean
  def helloFilter(): HelloFilter = new HelloFilter

  @Bean
  def githubFilter(): GithubFilter = new GithubFilter
}
