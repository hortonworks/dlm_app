package controllers

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{GroupInfo}
import domain.{GroupsRepo, RolesUtil}
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

  def insertWithRoles = Action.async(parse.json) { req =>
    req.body
      .validate[GroupInfo]
      .map { groupInfo =>
        groupsRepo
          .addGroupWithRoles(groupInfo)
          .map(groupInfo => success(groupInfo))
          .recoverWith(apiError)
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
