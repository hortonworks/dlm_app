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
