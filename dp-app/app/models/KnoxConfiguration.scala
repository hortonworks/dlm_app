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

package models

case class KnoxConfiguration(ldapUrl: String,
                             bindDn: Option[String],
                             userDnTemplate: Option[String],
                             domains: Option[Seq[String]],
                             userSearchAttributeName: Option[String],
                             userSearchBase: Option[String],
                             password: Option[String],
                             signedTokenTtl: Option[Long] = None
                            )
object KnoxConfiguration {

  import play.api.libs.json.Json
  implicit val knoxConfigurationWrites = Json.writes[models.KnoxConfiguration]
  implicit val knoxConfigurationReads = Json.reads[models.KnoxConfiguration]

}
