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

package controllers

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, GroupInfo}
import domain.{GroupsRepo, RolesUtil}
import play.api.libs.json.Json
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Groups @Inject()(groupsRepo: GroupsRepo, rolesUtil: RolesUtil)(
  implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def getGroups() = Action.async { request =>
    val offset: Long = request.getQueryString("offset").get.toLong
    val pageSize: Long = request.getQueryString("pageSize").get.toLong
    val searchTerm: Option[String] = request.getQueryString("searchTerm")
    groupsRepo
      .allWithRoles(offset, pageSize, searchTerm)
      .map { groups =>
        success(groups)
      }
      .recoverWith(apiError)
  }
  def getAllActiveGroups()=Action.async{request =>
   groupsRepo.getAllActiveGroups().map{groups=>
     success(groups)
   }.recoverWith(apiError)
  }

  def insertWithRoles = Action.async(parse.json) { req =>
    req.body
      .validate[GroupInfo]
      .map { groupInfo =>
        groupsRepo.groupExists(groupInfo.groupName).flatMap {
          case true=>Future.successful(Conflict(Json.toJson(Errors(Seq(Error("GROUP_ALREADY_EXISTS",s"Group Already Exists:${groupInfo.groupName}"))))))
          case _=>{
            groupsRepo
              .addGroupWithRoles(groupInfo)
              .map(groupInfo => success(groupInfo))
          }
       }.recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def updateGroupInfo = Action.async(parse.json) { req =>
    req.body
      .validate[GroupInfo]
      .map { groupInfo =>
        groupsRepo.updateGroupInfo(groupInfo)
          .map { res =>
            Ok
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def groupInfoByName(groupName: String) = Action.async { request =>
    groupsRepo
      .getGroupByName(groupName)
      .map { group =>
        success(group)
      }
      .recoverWith(apiError)
  }
  /*
  groupIds: comma separated groupIds
   */
  def getRoles()=Action.async {req=>
    val groupIdsStr = req.getQueryString("groupIds")
    groupIdsStr match {
      case None=> Future.successful(BadRequest("groupIds not given"))
      case Some(groupIdStr)=>{
        val groupIds=groupIdsStr.get.split(",").map(group=>group.toLong)
        groupsRepo.getRolesForGroups(groupIds).map{roles=>
          success(roles)
        }.recoverWith(apiError)
      }
    }
  }
}
