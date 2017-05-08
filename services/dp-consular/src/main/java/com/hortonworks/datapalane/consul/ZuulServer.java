package com.hortonworks.datapalane.consul;

public class ZuulServer {

  private final String ip;
  private final int port;
  private final String node;

  public ZuulServer(String ip, int port, String node) {
    this.ip = ip;
    this.port = port;
    this.node = node;
  }

  public String getIp() {
    return ip;
  }

  public int getPort() {
    return port;
  }


  @Override
  public String toString() {
    return "ZuulServer{" +
      "ip='" + ip + '\'' +
      ", port=" + port +
      ", node='" + node + '\'' +
      '}';
  }

  public String getNode() {
    return node;
  }

  public String makeUrl(boolean ssl) {
    String protocol = ssl?"https":"http";
    return protocol+"://"+ip+":"+port;
  }
}
