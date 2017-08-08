/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

/**
  * actions that can be performed on the policy
  */
sealed trait PolicyAction {
  def name: String
}

case object SCHEDULE extends PolicyAction { val name = "SCHEDULE" }

case object SUSPEND extends PolicyAction { val name = "SUSPEND" }

case object RESUME extends PolicyAction { val name = "RESUME" }

case object DELETE extends PolicyAction { val name = "DELETE" }
