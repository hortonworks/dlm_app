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
package com.hortonworks.dataplane.gateway.utils;

public class Conditions {

  public static ConditionBuilder ifFalse(boolean expression) {
    return new ConditionBuilder(!expression);
  }

  public static <T> ConditionBuilder ifNull(T reference) {
    return new ConditionBuilder(reference == null);
  }


  public static class ConditionBuilder {
    private boolean expression;
    private ConditionBuilder(){
    }

    private ConditionBuilder(boolean expression) {
      this.expression = expression;
    }

    public final void throwError(RuntimeException th) {
      if (expression) throw th;
    }

  }


}
