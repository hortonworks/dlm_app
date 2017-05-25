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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    ZuulServer that = (ZuulServer) o;

    if (port != that.port) return false;
    if (!ip.equals(that.ip)) return false;
    return node.equals(that.node);
  }

  @Override
  public int hashCode() {
    int result = ip.hashCode();
    result = 31 * result + port;
    result = 31 * result + node.hashCode();
    return result;
  }
}
