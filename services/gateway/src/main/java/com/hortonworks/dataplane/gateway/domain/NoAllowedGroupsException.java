package com.hortonworks.dataplane.gateway.domain;


public class NoAllowedGroupsException extends RuntimeException {
  public NoAllowedGroupsException() {
  }

  public NoAllowedGroupsException(String message) {
    super(message);
  }

  public NoAllowedGroupsException(String message, Throwable cause) {
    super(message, cause);
  }

  public NoAllowedGroupsException(Throwable cause) {
    super(cause);
  }

  public NoAllowedGroupsException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
    super(message, cause, enableSuppression, writableStackTrace);
  }
}
