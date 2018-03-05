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

package com.hortonworks.dataplane.db
import com.hortonworks.dataplane.commons.domain.RoleType
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.GroupService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class GroupServiceImpl(config: Config)(implicit ws: WSClient) extends GroupService {
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  def getGroups(offset: Option[String], pageSize: Option[String], searchTerm: Option[String]): Future[Either[Errors, GroupsList]] = {
    ws.url(s"$url/groups")
      .withQueryString("offset" -> offset.getOrElse("0"), "pageSize" -> pageSize.getOrElse("10"), "searchTerm" -> searchTerm.getOrElse(""))
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToGroupInfos(res)
      }
  }
  def getAllActiveGroups() : Future[Either[Errors,Seq[Group]]]={
    ws.url(s"$url/groups/active")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(res=>
        mapToGroups(res))

 }
  private def mapToGroupInfos(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[GroupsList].get)
      case _ => mapError(res)
    }
  }
  private def mapToGroups(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[Group]].get)
      case _ => mapError(res)
    }
  }

  def addGroupWithRoles(groupInfo: GroupInfo): Future[Either[Errors, GroupInfo]] = {
    ws.url(s"$url/groups/withroles")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(groupInfo))
      .map { res =>
        mapToGroupInfo(res)
      }
  }

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  private def mapToGroupInfo(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[GroupInfo].get)
      case _ => mapError(res)
    }
  }

  def updateGroupInfo(groupInfo: GroupInfo): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/groups/update")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(groupInfo))
      .map { res =>
        res.status match {
          case 200 => Right(true)
          case _ => mapError(res)
        }
      }
  }

  def getGroupByName(groupName: String): Future[Either[Errors,GroupInfo]] = {
    ws.url(s"$url/groups/${groupName}")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        res.status match {
          case 200 => Right((res.json \ "results").validate[GroupInfo].get)
          case _ => mapError(res)
        }
      }
  }
  override def getRolesForGroups(groupIds:Seq[Long]): Future[Either[Errors,Seq[String]]]={
    val groupIdsStr=groupIds.mkString(",")
    ws.url(s"$url/groups/roles?groupIds=$groupIdsStr")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        res.status match {
          case 200 => Right((res.json \ "results").validate[Seq[String]].get)
          case _ => mapError(res)
        }
      }
  }
}
