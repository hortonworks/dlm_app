package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, GroupInfo}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.GroupService
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

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

