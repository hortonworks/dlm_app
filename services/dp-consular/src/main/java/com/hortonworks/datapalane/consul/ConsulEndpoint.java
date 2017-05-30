package com.hortonworks.datapalane.consul;


/**
 * Represents a local consul instance
 */
public class ConsulEndpoint {

  private String host;
  private Integer port;

  public ConsulEndpoint(String host, Integer port) {
    this.host = host;
    this.port = port;
  }

  public String getHost() {
    return host;
  }

  public Integer getPort() {
    return port;
  }

  @Override
  public String toString() {
    return "LocalConsul{" +
      "host='" + host + '\'' +
      ", port=" + port +
      '}';
  }
}
