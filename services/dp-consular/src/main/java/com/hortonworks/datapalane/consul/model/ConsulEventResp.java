package com.hortonworks.datapalane.consul.model;


public class ConsulEventResp {
  private String id;
  private int lTime;


  public ConsulEventResp(String id,int lTime) {
    this.id = id;
    this.lTime=lTime;
  }

  public int getlTime() {
    return lTime;
  }

  public String getId() {
    return id;
  }

  public void setlTime(int lTime) {
    this.lTime = lTime;
  }

  @Override
  public String toString() {
    return "ConsulEventResp{" +
      "id='" + id + '\'' +
      ", lTime=" + lTime +
      '}';
  }
}
