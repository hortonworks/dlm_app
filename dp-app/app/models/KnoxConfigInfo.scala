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

case class KnoxConfigInfo(
    id: Option[Long],
    ldapUrl: String,
    userSearchBase: Option[String],
    userSearchAttributeName:Option[String],
    groupSearchBase: Option[String],
    groupSearchAttributeName:Option[String],
    groupObjectClass:Option[String],
    groupMemberAttributeName: Option[String],
    bindDn :Option[String],
    password: Option[String],
    domains: Option[Seq[String]],/*list of urls from which app is accessible*/
    signedTokenTtl : Option[Long], /* None will make it -1 and valid forever. Give this in minutes*/
    allowHttpsOnly : Option[Boolean]=Some(false) /* the app has to be on https for more security*/
)
object KnoxConfigInfo {
  import play.api.libs.json.Json
  implicit val knoxConfigInfoFormat = Json.format[KnoxConfigInfo]
}
case class KnoxConfigUpdateInfo(
  id: Long,
  ldapUrl: String,
  bindDn :Option[String],
  password: Option[String]
)
object KnoxConfigUpdateInfo {
  import play.api.libs.json.Json
  implicit val knoxConfigUpdateInfoFormat = Json.format[KnoxConfigUpdateInfo]
}


