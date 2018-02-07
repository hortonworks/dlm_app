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

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, GroupInfo}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.RoleType
import com.hortonworks.dataplane.db.Webservice.GroupService
import com.typesafe.scalalogging.Logger
import models.{GroupsAndRolesListInput, GroupsListInput}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.collection.mutable
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Left

class GroupManager @Inject()(@Named("groupService") val groupService: GroupService)
  extends Controller {
  val logger = Logger(classOf[GroupManager])

  private def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.status == "400"))
      BadRequest(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

  def getGroups() = Action.async { request =>
    groupService.getGroups(request.getQueryString("offset"), request.getQueryString("pageSize"), request.getQueryString("searchTerm")).map {
      case Left(errors) => handleErrors(errors)
      case Right(groups) => Ok(Json.toJson(groups))
    }
  }

  def addAdminGroups() = Action.async(parse.json) { request =>
    request.body
      .validate[GroupsListInput]
      .map { groupsList =>
        addGroupInternal(groupsList.groups, Seq(RoleType.SUPERADMIN))
      }.getOrElse(Future.successful(BadRequest))
  }

  def getGroupsByName(name: String) = Action.async { request =>
    groupService.getGroupByName(name).map {
      case Left(errors) => handleErrors(errors)
      case Right(group) => Ok(Json.toJson(group))
    }
  }

  def addGroupWithRoles() = Action.async(parse.json) { request =>
    request.body
      .validate[GroupInfo]
      .map { groupInfo =>
        groupService.addGroupWithRoles(groupInfo).map {
          case Left(errors) => handleErrors(errors)
          case Right(updated) => Ok(Json.toJson(updated))
        }
      }.getOrElse(Future.successful(BadRequest))
  }

  def addGroupsWithRoles = Action.async(parse.json) { req =>
    req.body.validate[GroupsAndRolesListInput].map { groupsAndRolesInput =>
      val roleTypes = groupsAndRolesInput.roles.map { roleStr => RoleType.withName(roleStr) }
      addGroupInternal(groupsAndRolesInput.groups, roleTypes)
    }.getOrElse {
      Future.successful(BadRequest)
    }
  }

  private def addGroupInternal(groupList: Seq[String], roles: Seq[RoleType.Value]) = {
    val futures = groupList.map { groupName =>
      val groupInfo: GroupInfo = GroupInfo(groupName = groupName,
        displayName = groupName,
        active = Some(true),
        roles = roles)
      groupService.addGroupWithRoles(groupInfo)
    }
    val successFullyAdded = mutable.ArrayBuffer.empty[GroupInfo]
    val errorsReceived = mutable.ArrayBuffer.empty[Error]
    Future.sequence(futures).map { respList =>
      respList.foreach {
        case Left(error) => errorsReceived ++= error.errors
        case Right(groupInfo) => successFullyAdded += groupInfo
      }
      Ok(Json.toJson(
        Json.obj(
          "successfullyAdded" -> successFullyAdded,
          "errors" -> errorsReceived)))
    }
  }

  def updateGroupInfo() = Action.async(parse.json) { request =>
    request.body
      .validate[GroupInfo]
      .map { groupInfo =>
        groupService.updateGroupInfo(groupInfo).map {
          case Left(errors) => handleErrors(errors)
          case Right(updated) => Ok(Json.toJson(updated))
        }
      }.getOrElse(Future.successful(BadRequest))
  }
}

