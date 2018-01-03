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
  * Cloud types that are supported for cloud replication
  */
sealed trait CloudType {
  def name: String
}

case object S3 extends CloudType { val name = "S3" }

case object ADSL extends CloudType { val name = "ADSL" }

case object AZURE extends CloudType { val name = "AZURE" }
