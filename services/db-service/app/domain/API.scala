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

package domain


object API {

  val users = "/users"
  val roles = "/roles"
  val locations = "/locations"
  val dpClusters = "dp/clusters"
  val clusters = "/clusters"
  val datasets = "/datasets"
  val workspaces = "/workspaces"

  case class EntityNotFound() extends Throwable
  case class UpdateError() extends Throwable
  case class AlreadyExistsError() extends Throwable

}
