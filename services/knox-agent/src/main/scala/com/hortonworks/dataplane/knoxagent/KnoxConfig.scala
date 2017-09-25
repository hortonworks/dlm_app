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

package com.hortonworks.dataplane.knoxagent

case class KnoxConfig(
    ldapUrl: Option[String] = None,
    bindDn: Option[String] = None,
    userDnTemplate: Option[String] = None,
    userSearchAttributeName : Option[String]=None,
    userSearchBase : Option[String]=None,
    //domains: Option[String],/*list of urls from which app is accessible*/
    domains: Option[Seq[String]],/*list of urls from which app is accessible*/
    signedTokenTtl : Option[Long], /* None will make it -1 and valid forever. Give this in minutes*/
    allowHttpsOnly : Option[Boolean]=Some(false), /* the app has to be on https for more security*/
    password: Option[String]
)
object KnoxConfig {

  import play.api.libs.json.Json
  implicit val knoxConfigFormat = Json.format[KnoxConfig]

}
