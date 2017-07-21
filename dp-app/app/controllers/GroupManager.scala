package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, GroupInfo}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.RoleType
import com.hortonworks.dataplane.db.Webservice.GroupService
import com.typesafe.scalalogging.Logger
import models.{GroupsAndRolesListInput}
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
    if (errors.errors.exists(_.code == "400"))
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

  def getGroupsByName() = Action.async { request =>
    groupService.getGroupByName(request.getQueryString("name").get).map {
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
    val errorsReceived = mutable.ArrayBuffer.empty[Errors]
    Future.sequence(futures).map { respList =>
      respList.foreach {
        case Left(error) => errorsReceived += error
        case Right(groupInfo) => successFullyAdded += groupInfo
      }
      Ok(Json.toJson(successFullyAdded))
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

