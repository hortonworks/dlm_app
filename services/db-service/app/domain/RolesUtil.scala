package domain

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{GroupRole, Role, UserRole}
import com.hortonworks.dataplane.commons.domain.RoleType

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
//TODO synchronize
@Singleton
class RolesUtil  @Inject()(roleRepo: RoleRepo) {
  import scala.collection.mutable
  private var roleNameMapCache:Option[Map[String, Role]] =  None

  def getRoleNameMap()  :Future[Map[String,Role]]={
    roleNameMapCache match{
      case None =>{
        val roleMap=mutable.Map.empty[String,Role]
        roleRepo.all().map{ roles=>
          roles.foreach{role=>
            roleMap.put(role.roleName,role)
          }
          roleNameMapCache=Some(roleMap.toMap)
          roleNameMapCache.get
        }
      }
      case Some(roleMap)=>Future.successful(roleMap)
    }
  }

  def getRoleIdMap:Future[Map[Long,Role]]={
    val roleIdMap=mutable.Map.empty[Long,Role]
    getRoleNameMap().map{roleNameMap=>
      roleNameMap.foreach{ roleMapping =>
        roleIdMap.put(roleMapping._2.id.get,roleMapping._2)
      }
      roleIdMap.toMap
    }
  }

  def getRoleTypesForRoleIds(roleIds:Seq[Long]):Future[Seq[RoleType.Value]]={
    getRoleIdMap.map{roleIdMap=>
      roleIds.map ( roleid =>RoleType.withName(roleIdMap.get(roleid).get.roleName))
    }
  }

  def getUserRoleObjectsforRoleIds(userId:Long,roles:Seq[Long]): Seq[UserRole] ={
     roles.map(roleId=>UserRole(userId=Some(userId),roleId = Some(roleId)))
  }
  def getUserRoleObjects(userId:Long,roles:Seq[RoleType.Value],allRolesInDb:Map[String,Role]):Seq[UserRole]={
    roles.map(role=>
      UserRole(userId=Some(userId),roleId = allRolesInDb.get(role.toString).get.id)
    )
  }

  def getGroupRolesObjectsforRoleIds(userId:Long, roles:Seq[Long]): Seq[GroupRole] = {
    roles.map(roleId => GroupRole(groupId = Some(userId), roleId = Some(roleId)))
  }

  def getGroupRoleObjects(groupId:Long, roles:Seq[RoleType.Value], allRolesInDb:Map[String,Role]) : Seq[GroupRole] = {
    roles.map(role =>
      GroupRole(groupId = Some(groupId), roleId = allRolesInDb.get(role.toString).get.id)
    )
  }


  def getRoleAsRoleTypes(roleId:Long,allRoles:Seq[Role]) ={
    RoleType.withName(allRoles.filter(_.id==roleId).head.roleName)
  }
  def getRolesAsRoleTypes(roleIds:Seq[Long],allRoles:Seq[Role]):Seq[RoleType.Value]={
    val roleMap=mutable.Map.empty[Long,String]
    allRoles.foreach{role=>
      roleMap.put(role.id.get,role.roleName)
    }
    roleIds.map{roleid=>
      RoleType.withName(roleMap.get(roleid).get)
    }
  }

}
