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
