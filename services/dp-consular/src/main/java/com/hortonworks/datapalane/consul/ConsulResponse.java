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

package com.hortonworks.datapalane.consul;

import com.ecwid.consul.v1.Response;

public class ConsulResponse<T>{

  private Response<T> underlying;

  private ConsulResponse() {
  }

  static <K>ConsulResponse<K> from(Response<K> response){
    return new ConsulResponse<>(response);
  }

  private ConsulResponse(Response<T> underlying) {
    this.underlying = underlying;
  }

  public Response<T> getUnderlying() {
    return underlying;
  }
}
