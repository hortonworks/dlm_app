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
