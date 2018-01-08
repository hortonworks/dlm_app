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

case object ADLS extends CloudType { val name = "ADLS" }

case object WASB extends CloudType { val name = "WASB" }

/**
  * Cloud credential types that are supported for cloud replication
  */
object CloudCredentialType extends Enumeration {
  type CloudCredentialType = Value

  val WASB_TOKEN = Value("WASB_TOKEN")
  val S3_TOKEN = Value("S3_TOKEN")
}

/**
  * List of supported cloud providers
  */
object CloudAccountProvider extends Enumeration {
  type CloudAccountProvider = Value

  val WASB = Value("WASB")
  val S3 = Value("S3")
  val ADLS = Value("ADLS")
}
